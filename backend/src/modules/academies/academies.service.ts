import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UpdateAcademyDto } from './dto/update-academy.dto.js';

@Injectable()
export class AcademiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyAcademy(academyId: string) {
    const academy = await this.prisma.academy.findUnique({
      where: { id: academyId },
      include: { subscription: true },
    });

    if (!academy) {
      throw new NotFoundException('Academia no encontrada');
    }

    return academy;
  }

  async updateMyAcademy(academyId: string, dto: UpdateAcademyDto) {
    const academy = await this.prisma.academy.findUnique({
      where: { id: academyId },
    });

    if (!academy) {
      throw new NotFoundException('Academia no encontrada');
    }

    return this.prisma.academy.update({
      where: { id: academyId },
      data: dto,
      include: { subscription: true },
    });
  }

  async findAll(filters: { status?: SubscriptionStatus; plan?: SubscriptionPlan }) {
    const { status, plan } = filters;

    return this.prisma.academy.findMany({
      include: { subscription: true },
      where:
        status || plan
          ? {
              subscription: {
                ...(status && { status }),
                ...(plan && { plan }),
              },
            }
          : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async suspendAcademy(id: string) {
    const subscription = await this.prisma.academySubscription.findUnique({
      where: { academyId: id },
    });

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    return this.prisma.academySubscription.update({
      where: { academyId: id },
      data: { status: SubscriptionStatus.suspended },
    });
  }
}
