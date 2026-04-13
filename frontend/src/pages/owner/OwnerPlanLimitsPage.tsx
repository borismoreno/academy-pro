import PageHeader from "@/components/shared/PageHeader";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import PlanLimitRow from "./components/PlanLimitRow";
import { useOwnerPlanLimits, useUpdatePlanLimit } from "@/hooks/useOwner";
import type { PlanLimit, SubscriptionPlan } from "@/types";

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_CHIP_CLASSES: Record<SubscriptionPlan, string> = {
  free: "bg-surface-highest text-on-surface-variant",
  pro: "bg-primary-container text-on-primary",
  enterprise: "bg-secondary text-surface-lowest",
};

const PLANS: SubscriptionPlan[] = ["free", "pro", "enterprise"];

export default function OwnerPlanLimitsPage() {
  const { data: grouped, isLoading } = useOwnerPlanLimits();
  const updatePlanLimit = useUpdatePlanLimit();

  async function handleUpdate(id: string, maxCount: number) {
    await updatePlanLimit.mutateAsync({ id, data: { maxCount } });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Límites de planes"
        subtitle="Configura los límites de recursos por plan. Usa -1 para ilimitado."
      />

      {PLANS.map((plan) => {
        const limits: PlanLimit[] = grouped?.[plan] ?? [];

        return (
          <div key={plan}>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
                {PLAN_LABELS[plan]}
              </h3>
              <span
                className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${PLAN_CHIP_CLASSES[plan]}`}
              >
                {PLAN_LABELS[plan]}
              </span>
            </div>

            {limits.length === 0 ? (
              <p className="font-body text-sm text-on-surface-variant px-4">
                No hay límites configurados para este plan.
              </p>
            ) : (
              <div className="space-y-2">
                {limits.map((limit) => (
                  <PlanLimitRow
                    key={limit.id}
                    limit={limit}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
