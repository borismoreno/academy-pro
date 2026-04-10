import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InvitationStatus, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EmailService } from '../../common/email/email.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { AcceptInvitationDto } from './dto/accept-invitation.dto.js';
import { ListInvitationsQueryDto } from './dto/invitation-response.dto.js';

const BCRYPT_ROUNDS = 10;
const INVITATION_TTL_HOURS = 48;

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async create(academyId: string, invitedById: string, dto: CreateInvitationDto) {
    dto.validate();

    const role = dto.role as unknown as Role;

    if (dto.playerId) {
      const player = await this.prisma.player.findFirst({
        where: { id: dto.playerId, academyId, isActive: true },
      });
      if (!player) {
        throw new NotFoundException('Jugador no encontrado');
      }
    }

    const existingMember = await this.prisma.userAcademyRole.findFirst({
      where: {
        academyId,
        user: { email: dto.email },
        isActive: true,
      },
    });
    if (existingMember) {
      throw new ConflictException('Este usuario ya es miembro de la academia');
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        academyId,
        email: dto.email,
        status: InvitationStatus.pending,
      },
    });
    if (existingInvitation) {
      throw new ConflictException(
        'Ya existe una invitación pendiente para este correo',
      );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);

    const invitation = await this.prisma.invitation.create({
      data: {
        academyId,
        invitedBy: invitedById,
        email: dto.email,
        role,
        token,
        status: InvitationStatus.pending,
        playerId: dto.playerId ?? null,
        expiresAt,
      },
      include: { academy: true },
    });

    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const acceptUrl = `${frontendUrl}/invitations/accept?token=${token}`;

    await this.emailService.sendInvitationEmail(
      dto.email,
      invitation.academy.name,
      role,
      acceptUrl,
    );

    return invitation;
  }

  async findAll(academyId: string, query: ListInvitationsQueryDto) {
    return this.prisma.invitation.findMany({
      where: {
        academyId,
        ...(query.status && { status: query.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(academyId: string, id: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: { id, academyId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.status !== InvitationStatus.pending) {
      throw new BadRequestException('Solo se pueden cancelar invitaciones pendientes');
    }

    await this.prisma.invitation.delete({ where: { id } });
  }

  async preview(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { academy: true },
    });

    this.assertValidInvitation(invitation);

    return {
      email: invitation!.email,
      role: invitation!.role,
      academyName: invitation!.academy.name,
    };
  }

  async accept(dto: AcceptInvitationDto) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
      include: { academy: true },
    });

    this.assertValidInvitation(invitation);

    const { email, role, academyId } = invitation!;

    await this.prisma.$transaction(async (tx) => {
      let userId: string;

      const existingUser = await tx.user.findUnique({ where: { email } });

      if (!existingUser) {
        // Case 1: new user — email is implicitly verified via invitation link
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const newUser = await tx.user.create({
          data: {
            fullName: dto.fullName,
            email,
            passwordHash,
            isActive: true,
            emailVerifiedAt: new Date(),
            verificationToken: null,
            verificationTokenExpiresAt: null,
          },
        });
        userId = newUser.id;
      } else if (!existingUser.isActive) {
        // Case 2: suspended user — block before any write
        throw new ForbiddenException(
          'Tu cuenta está suspendida. Contacta al administrador.',
        );
      } else if (!existingUser.emailVerifiedAt) {
        // Case 3: active but unverified — invitation flow serves as implicit verification
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerifiedAt: new Date(),
            verificationToken: null,
            verificationTokenExpiresAt: null,
          },
        });
        userId = existingUser.id;
      } else {
        // Case 4: active and already verified — no user record changes needed
        userId = existingUser.id;
      }

      await tx.userAcademyRole.create({
        data: { userId, academyId, role },
      });

      if (invitation!.playerId) {
        const alreadyLinked = await tx.playerParent.findFirst({
          where: { playerId: invitation!.playerId, userId },
        });
        if (!alreadyLinked) {
          await tx.playerParent.create({
            data: {
              playerId: invitation!.playerId,
              userId,
              relationship: 'tutor',
            },
          });
        }
      }

      await tx.invitation.update({
        where: { id: invitation!.id },
        data: {
          status: InvitationStatus.accepted,
          acceptedAt: new Date(),
        },
      });
    });

    return { message: 'Cuenta creada exitosamente. Ya puedes iniciar sesión.' };
  }

  private assertValidInvitation(
    invitation: { status: InvitationStatus; expiresAt: Date } | null,
  ): void {
    if (
      !invitation ||
      invitation.status !== InvitationStatus.pending ||
      invitation.expiresAt < new Date()
    ) {
      throw new BadRequestException('La invitación no es válida o ha expirado');
    }
  }
}
