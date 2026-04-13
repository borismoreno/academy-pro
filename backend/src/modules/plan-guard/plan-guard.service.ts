import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Role, SubscriptionPlan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';

const LIMIT_MESSAGES: Record<string, string> = {
  teams:
    'Has alcanzado el límite de equipos para tu plan actual. Actualiza tu plan para crear más equipos.',
  players:
    'Has alcanzado el límite de jugadores para tu plan actual. Actualiza tu plan para registrar más jugadores.',
  coaches:
    'Has alcanzado el límite de entrenadores para tu plan actual. Actualiza tu plan para invitar más entrenadores.',
  fields:
    'Has alcanzado el límite de canchas para tu plan actual. Actualiza tu plan para agregar más canchas.',
};

@Injectable()
export class PlanGuardService {
  private readonly logger = new Logger(PlanGuardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateLimit(academyId: string, resource: string): Promise<void> {
    try {
      // Step 1 — resolve the active subscription plan for this academy
      const subscription = await this.prisma.academySubscription.findFirst({
        where: { academyId, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });

      const activePlan: SubscriptionPlan = subscription?.plan ?? SubscriptionPlan.free;

      // Step 2 — get the configured limit for this plan/resource pair
      const planLimit = await this.prisma.planLimit.findUnique({
        where: { plan_resource: { plan: activePlan, resource } },
      });

      if (!planLimit) {
        // No limit configured for this resource — allow by default
        return;
      }

      // Step 3 — unlimited plan, no restriction
      if (planLimit.maxCount === -1) {
        return;
      }

      // Step 4 — count current active resources for this academy
      let currentCount = 0;

      switch (resource) {
        case 'teams':
          currentCount = await this.prisma.team.count({
            where: { academyId, isActive: true },
          });
          break;

        case 'players':
          currentCount = await this.prisma.player.count({
            where: { academyId, isActive: true },
          });
          break;

        case 'coaches':
          currentCount = await this.prisma.userAcademyRole.count({
            where: { academyId, role: Role.coach, isActive: true },
          });
          break;

        case 'fields':
          currentCount = await this.prisma.field.count({
            where: { academyId, isActive: true },
          });
          break;

        default:
          // Unknown resource — allow by default
          return;
      }

      // Step 5 — enforce the limit
      if (currentCount >= planLimit.maxCount) {
        const message =
          LIMIT_MESSAGES[resource] ??
          'Has alcanzado el límite para tu plan actual. Actualiza tu plan para continuar.';
        throw new ForbiddenException(message);
      }
    } catch (err) {
      // Re-throw ForbiddenException — it is intentional
      if (err instanceof ForbiddenException) {
        throw err;
      }

      // Unexpected error during limit check — log and allow to avoid blocking users
      this.logger.error(`Error al verificar límite de plan para recurso "${resource}":`, err);
    }
  }
}
