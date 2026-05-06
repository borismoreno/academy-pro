import 'dotenv/config';
import { PrismaClient, SubscriptionPlan } from '@prisma/client';

// Seeds plan_limits table with resource caps per subscription plan.
// Uses upsert — safe to run multiple times without creating duplicates.
// Usage: npm run seed:plan-limits

type PlanLimitSeed = {
  plan: SubscriptionPlan;
  resource: string;
  maxCount: number;
};

const LIMITS: PlanLimitSeed[] = [
  // ── Free plan — strict caps ─────────────────────────────────────────────────
  { plan: SubscriptionPlan.free, resource: 'teams', maxCount: 1 },
  { plan: SubscriptionPlan.free, resource: 'players', maxCount: 15 },
  { plan: SubscriptionPlan.free, resource: 'coaches', maxCount: 1 },
  { plan: SubscriptionPlan.free, resource: 'fields', maxCount: 1 },
  // 0 = feature disabled
  { plan: SubscriptionPlan.free, resource: 'evaluations_custom_metrics', maxCount: 0 },
  { plan: SubscriptionPlan.free, resource: 'parent_portal_evaluations', maxCount: 0 },
  { plan: SubscriptionPlan.free, resource: 'parent_notifications', maxCount: 0 },
  { plan: SubscriptionPlan.free, resource: 'parent_portal_matches', maxCount: 0 },

  // ── Pro plan — unlimited (-1) ────────────────────────────────────────────────
  { plan: SubscriptionPlan.pro, resource: 'teams', maxCount: -1 },
  { plan: SubscriptionPlan.pro, resource: 'players', maxCount: -1 },
  { plan: SubscriptionPlan.pro, resource: 'coaches', maxCount: -1 },
  { plan: SubscriptionPlan.pro, resource: 'fields', maxCount: -1 },
  { plan: SubscriptionPlan.pro, resource: 'evaluations_custom_metrics', maxCount: -1 },
  { plan: SubscriptionPlan.pro, resource: 'parent_portal_evaluations', maxCount: -1 },
  { plan: SubscriptionPlan.pro, resource: 'parent_notifications', maxCount: -1 },
  { plan: SubscriptionPlan.pro, resource: 'parent_portal_matches', maxCount: -1 },

  // ── Enterprise plan — unlimited (-1) ────────────────────────────────────────
  { plan: SubscriptionPlan.enterprise, resource: 'teams', maxCount: -1 },
  { plan: SubscriptionPlan.enterprise, resource: 'players', maxCount: -1 },
  { plan: SubscriptionPlan.enterprise, resource: 'coaches', maxCount: -1 },
  { plan: SubscriptionPlan.enterprise, resource: 'fields', maxCount: -1 },
  { plan: SubscriptionPlan.enterprise, resource: 'evaluations_custom_metrics', maxCount: -1 },
  { plan: SubscriptionPlan.enterprise, resource: 'parent_portal_evaluations', maxCount: -1 },
  { plan: SubscriptionPlan.enterprise, resource: 'parent_notifications', maxCount: -1 },
  { plan: SubscriptionPlan.enterprise, resource: 'parent_portal_matches', maxCount: -1 },
];

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    for (const limit of LIMITS) {
      await prisma.planLimit.upsert({
        where: { plan_resource: { plan: limit.plan, resource: limit.resource } },
        update: { maxCount: limit.maxCount },
        create: {
          plan: limit.plan,
          resource: limit.resource,
          maxCount: limit.maxCount,
        },
      });
    }

    console.log(`Plan limits seeded: ${LIMITS.length} records upserted.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('Seeder falló:', err);
  process.exit(1);
});
