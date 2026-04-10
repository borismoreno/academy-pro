import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const { user, academy } = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
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

      return { user: newUser, academy: newAcademy };
    });

    return this.buildTokenResponse(user, {
      id: academy.id,
      name: academy.name,
      role: Role.academy_director,
    });
  }

  async login(user: User): Promise<AuthTokenResponse | AcademySelectionResponse> {
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

  private buildTokenResponse(user: User, academy: AcademyInfo): AuthTokenResponse {
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
