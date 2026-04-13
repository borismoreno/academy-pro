import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  InvitationStatus,
  Role,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EmailService } from '../../common/email/email.service.js';
import { CreateAcademyDto } from './dto/create-academy.dto.js';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto.js';
import { UpdatePlanLimitDto } from './dto/update-plan-limit.dto.js';
import { OwnerStatsResponseDto } from './dto/owner-stats-response.dto.js';

const PLAN_PRICES: Record<string, number> = { free: 0, pro: 29, enterprise: 79 };
const INVITATION_TTL_HOURS = 48;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

@Injectable()
export class OwnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async getStats(): Promise<OwnerStatsResponseDto> {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAcademies,
      activeAcademies,
      totalPlayers,
      totalUsers,
      newAcademiesThisMonth,
      planCounts,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.academy.count(),
      this.prisma.academy.count({
        where: { subscription: { status: SubscriptionStatus.active } },
      }),
      this.prisma.player.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.academy.count({
        where: { createdAt: { gte: firstOfMonth } },
      }),
      this.prisma.academySubscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
      this.prisma.academySubscription.findMany({
        where: { status: SubscriptionStatus.active },
        select: { plan: true },
      }),
    ]);

    const academiesByPlan = { free: 0, pro: 0, enterprise: 0 };
    for (const row of planCounts) {
      academiesByPlan[row.plan] = row._count.plan;
    }

    const estimatedMRR = activeSubscriptions.reduce(
      (sum, sub) => sum + (PLAN_PRICES[sub.plan] ?? 0),
      0,
    );

    return {
      totalAcademies,
      activeAcademies,
      totalPlayers,
      totalUsers,
      academiesByPlan,
      newAcademiesThisMonth,
      estimatedMRR,
    };
  }

  async getAcademies(search?: string) {
    const academies = await this.prisma.academy.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: {
        subscription: {
          select: { id: true, plan: true, status: true, startsAt: true, endsAt: true, createdAt: true },
        },
        userRoles: {
          where: { role: Role.academy_director, isActive: true },
          include: { user: { select: { fullName: true, email: true } } },
          take: 1,
        },
        _count: {
          select: {
            players: { where: { isActive: true } },
            teams: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return academies.map((a) => ({
      id: a.id,
      name: a.name,
      city: a.city,
      address: a.address,
      phone: a.phone,
      email: a.email,
      logoUrl: a.logoUrl,
      createdAt: a.createdAt,
      subscription: a.subscription,
      director: a.userRoles[0]?.user ?? null,
      totalPlayers: a._count.players,
      totalTeams: a._count.teams,
    }));
  }

  async getAcademyById(id: string) {
    const academy = await this.prisma.academy.findUnique({
      where: { id },
      include: {
        subscription: true,
        userRoles: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        _count: {
          select: {
            players: { where: { isActive: true } },
            teams: true,
          },
        },
      },
    });

    if (!academy) {
      throw new NotFoundException('Academia no encontrada');
    }

    return {
      id: academy.id,
      name: academy.name,
      city: academy.city,
      address: academy.address,
      phone: academy.phone,
      email: academy.email,
      logoUrl: academy.logoUrl,
      createdAt: academy.createdAt,
      subscription: academy.subscription,
      members: academy.userRoles.map((r) => ({
        userId: r.userId,
        fullName: r.user.fullName,
        email: r.user.email,
        role: r.role,
        isActive: r.isActive,
      })),
      totalPlayers: academy._count.players,
      totalTeams: academy._count.teams,
      totalMembers: academy.userRoles.filter((r) => r.isActive).length,
    };
  }

  async createAcademy(dto: CreateAcademyDto, ownerId: string) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
    const endsAt = new Date(Date.now() + ONE_YEAR_MS);

    const academy = await this.prisma.$transaction(async (tx) => {
      const newAcademy = await tx.academy.create({
        data: {
          name: dto.name,
          city: dto.city,
          address: dto.address ?? null,
          phone: dto.phone ?? null,
          email: dto.email ?? null,
        },
      });

      await tx.academySubscription.create({
        data: {
          academyId: newAcademy.id,
          plan: SubscriptionPlan.free,
          status: SubscriptionStatus.active,
          startsAt: new Date(),
          endsAt,
        },
      });

      await tx.invitation.create({
        data: {
          academyId: newAcademy.id,
          invitedBy: ownerId,
          email: dto.directorEmail,
          role: Role.academy_director,
          token,
          status: InvitationStatus.pending,
          expiresAt,
        },
      });

      return newAcademy;
    });

    const frontendUrl = this.config.get<string>('app.frontendUrl');
    const acceptUrl = `${frontendUrl}/invitations/accept?token=${token}`;

    await this.emailService.sendInvitationEmail(
      dto.directorEmail,
      academy.name,
      Role.academy_director,
      acceptUrl,
    );

    return academy;
  }

  async updateSubscription(academyId: string, dto: UpdateSubscriptionDto) {
    const existingAcademy = await this.prisma.academy.findUnique({
      where: { id: academyId },
    });
    if (!existingAcademy) {
      throw new NotFoundException('Academia no encontrada');
    }

    return this.prisma.academySubscription.upsert({
      where: { academyId },
      update: {
        ...(dto.plan && { plan: dto.plan }),
        ...(dto.status && { status: dto.status }),
        ...(dto.startsAt && { startsAt: new Date(dto.startsAt) }),
        ...(dto.endsAt !== undefined && {
          endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        }),
      },
      create: {
        academyId,
        plan: dto.plan ?? SubscriptionPlan.free,
        status: dto.status ?? SubscriptionStatus.active,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : new Date(Date.now() + ONE_YEAR_MS),
      },
    });
  }

  async getPlanLimits() {
    const limits = await this.prisma.planLimit.findMany({
      orderBy: [{ plan: 'asc' }, { resource: 'asc' }],
    });

    const grouped: Record<string, typeof limits> = {
      free: [],
      pro: [],
      enterprise: [],
    };

    for (const limit of limits) {
      if (grouped[limit.plan]) {
        grouped[limit.plan].push(limit);
      }
    }

    return grouped;
  }

  async updatePlanLimit(id: string, dto: UpdatePlanLimitDto) {
    if (dto.maxCount < -1) {
      throw new BadRequestException('El valor mínimo es -1 (ilimitado)');
    }

    const limit = await this.prisma.planLimit.findUnique({ where: { id } });
    if (!limit) {
      throw new NotFoundException('Límite no encontrado');
    }

    return this.prisma.planLimit.update({
      where: { id },
      data: { maxCount: dto.maxCount },
    });
  }

  async getUsers(search?: string) {
    const users = await this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        academyRoles: {
          include: {
            academy: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      isActive: u.isActive,
      createdAt: u.createdAt,
      academyRoles: u.academyRoles.map((r) => ({
        academyId: r.academyId,
        academyName: r.academy?.name ?? null,
        role: r.role,
        isActive: r.isActive,
      })),
    }));
  }
}
