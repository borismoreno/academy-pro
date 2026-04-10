import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../common/email/email.service.js';
import { EvaluationsService } from '../modules/evaluations/evaluations.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { SelectAcademyDto } from './dto/select-academy.dto.js';
import {
  AcademyInfo,
  AcademySelectionResponse,
  AuthTokenResponse,
} from './dto/auth-response.dto.js';
import { JwtPayload } from './strategies/jwt.strategy.js';
import { Role, User } from '@prisma/client';

const BCRYPT_ROUNDS = 10;
const VERIFICATION_EXPIRY_HOURS = 24;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly evaluationsService: EvaluationsService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const verificationToken = randomUUID();
    const verificationTokenExpiresAt = new Date(
      Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    const { newAcademyId } = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
          isActive: false,
          verificationToken,
          verificationTokenExpiresAt,
        },
      });

      const newAcademy = await tx.academy.create({
        data: { name: dto.academyName },
      });

      await tx.userAcademyRole.create({
        data: {
          userId: newUser.id,
          academyId: newAcademy.id,
          role: Role.academy_director,
        },
      });

      return { newAcademyId: newAcademy.id };
    });

    await this.evaluationsService.seedDefaultMetrics(newAcademyId);

    const frontendUrl = this.config.getOrThrow<string>('app.frontendUrl');
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;
    await this.emailService.sendVerificationEmail(dto.email, verificationUrl);

    return { message: 'Revisa tu correo para activar tu cuenta.' };
  }

  async login(
    user: User,
  ): Promise<AuthTokenResponse | AcademySelectionResponse> {
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(
        'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada o solicita un nuevo link.',
      );
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Tu cuenta está suspendida. Contacta al administrador.',
      );
    }

    const academyRoles = await this.prisma.userAcademyRole.findMany({
      where: { userId: user.id, isActive: true },
      include: { academy: true },
    });

    const academies: AcademyInfo[] = academyRoles.map((ar) => ({
      id: ar.academy.id,
      name: ar.academy.name,
      role: ar.role,
    }));

    if (academies.length === 1) {
      return this.buildTokenResponse(user, academies[0]);
    }

    // Multiple academies — issue a short-lived selection token (no academy context)
    const selectionPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      academyId: null,
      role: null,
    };
    const selectionToken = this.jwtService.sign(selectionPayload, {
      expiresIn: '5m',
    });

    return {
      requiresAcademySelection: true,
      academies,
      selectionToken,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (
      !user ||
      !user.verificationToken ||
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException(
        'El link de verificación no es válido o ha expirado',
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        isActive: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });

    return {
      message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.',
    };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const SAME_RESPONSE = {
      message:
        'Si el correo está registrado y no verificado, recibirás un nuevo link.',
    };

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerifiedAt) {
      const verificationToken = randomUUID();
      const verificationTokenExpiresAt = new Date(
        Date.now() + VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000,
      );

      await this.prisma.user.update({
        where: { id: user.id },
        data: { verificationToken, verificationTokenExpiresAt },
      });

      const frontendUrl = this.config.getOrThrow<string>('app.frontendUrl');
      const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;
      await this.emailService.sendVerificationEmail(email, verificationUrl);
    }

    return SAME_RESPONSE;
  }

  async selectAcademy(
    currentUser: JwtPayload,
    dto: SelectAcademyDto,
  ): Promise<AuthTokenResponse> {
    const academyRole = await this.prisma.userAcademyRole.findFirst({
      where: {
        userId: currentUser.sub,
        academyId: dto.academyId,
        isActive: true,
      },
      include: { academy: true },
    });

    if (!academyRole) {
      throw new ForbiddenException('No tienes acceso a esta academia');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUser.sub },
    });

    return this.buildTokenResponse(user, {
      id: academyRole.academy.id,
      name: academyRole.academy.name,
      role: academyRole.role,
    });
  }

  private buildTokenResponse(
    user: User,
    academy: AcademyInfo,
  ): AuthTokenResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      academyId: academy.id,
      role: academy.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      academy,
    };
  }
}
