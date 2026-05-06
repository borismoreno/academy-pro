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
  evaluations_custom_metrics:
    'La personalización de métricas no está disponible en tu plan actual. Actualiza a Pro para personalizar las métricas de evaluación.',
  parent_portal_evaluations:
    'La visualización de evaluaciones en el portal de padres no está disponible en tu plan actual. Actualiza a Pro para que los padres puedan ver las evaluaciones.',
  parent_notifications:
    'Las notificaciones a padres no están disponibles en tu plan actual. Actualiza a Pro para activar las notificaciones.',
  parent_portal_matches:
    'El historial de encuentros en el portal de padres no está disponible en tu plan actual. Actualiza a Pro para que los padres puedan ver los encuentros.',
};

@Injectable()
export class PlanGuardService {
  private readonly logger = new Logger(PlanGuardService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async resolveActivePlan(academyId: string): Promise<SubscriptionPlan> {
    const subscription = await this.prisma.academySubscription.findFirst({
      where: { academyId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    return subscription?.plan ?? SubscriptionPlan.free;
  }

  async validateLimit(academyId: string, resource: string): Promise<void> {
    try {
      const activePlan = await this.resolveActivePlan(academyId);

      const planLimit = await this.prisma.planLimit.findUnique({
        where: { plan_resource: { plan: activePlan, resource } },
      });

      // No limit configured for this resource — allow by default
      if (!planLimit) {
        return;
      }

      // Unlimited plan — no restriction
      if (planLimit.maxCount === -1) {
        return;
      }

      // maxCount === 0 means the feature is disabled — throw immediately without counting
      if (planLimit.maxCount === 0) {
        const message =
          LIMIT_MESSAGES[resource] ??
          'Esta función no está disponible en tu plan actual. Actualiza tu plan para continuar.';
        throw new ForbiddenException(message);
      }

      // Count current active resources for this academy
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
          // Unknown count resource — allow by default
          return;
      }

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

  async isFeatureEnabled(academyId: string, resource: string): Promise<boolean> {
    try {
      const activePlan = await this.resolveActivePlan(academyId);

      const planLimit = await this.prisma.planLimit.findUnique({
        where: { plan_resource: { plan: activePlan, resource } },
      });

      // No record found — default to false for unknown feature resources
      if (!planLimit) {
        return false;
      }

      // -1 = unlimited/enabled, > 0 = enabled
      return planLimit.maxCount === -1 || planLimit.maxCount > 0;
    } catch (err) {
      this.logger.error(
        `Error al verificar habilitación de función "${resource}" para academia "${academyId}":`,
        err,
      );
      // On unexpected error, default to false
      return false;
    }
  }
}
