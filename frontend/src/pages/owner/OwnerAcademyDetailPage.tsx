import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import EmptyState from "@/components/shared/EmptyState";
import SubscriptionFormDialog from "./components/SubscriptionFormDialog";
import { useOwnerAcademy } from "@/hooks/useOwner";
import type { AcademyMemberDetail, AcademyWithSubscription } from "@/types";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const PLAN_CHIP_CLASSES: Record<string, string> = {
  free: "bg-surface-highest text-on-surface-variant",
  pro: "bg-primary-container text-on-primary",
  enterprise: "bg-secondary text-surface-lowest",
};

const STATUS_CHIP_CLASSES: Record<string, string> = {
  active: "bg-primary-container text-on-primary",
  suspended: "bg-error-container text-on-surface",
  cancelled: "bg-surface-highest text-on-surface-variant",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  suspended: "Suspendida",
  cancelled: "Cancelada",
};

const ROLE_LABELS: Record<string, string> = {
  saas_owner: "Propietario",
  academy_director: "Director",
  coach: "Entrenador",
  parent: "Padre/Madre",
};

const ROLE_CHIP_CLASSES: Record<string, string> = {
  saas_owner: "bg-secondary text-surface-lowest",
  academy_director: "bg-primary-container text-on-primary",
  coach: "bg-surface-highest text-on-surface",
  parent: "bg-surface-highest text-on-surface-variant",
};

export default function OwnerAcademyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);

  const { data: academy, isLoading } = useOwnerAcademy(id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!academy) {
    return <EmptyState message="Academia no encontrada." />;
  }

  const sub = academy.subscription;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate("/owner/academies")}
        className="flex items-center gap-2 font-body text-sm text-on-surface-variant hover:text-primary transition-colors min-h-11"
      >
        <ArrowLeft size={16} />
        Academias
      </button>

      {/* Hero card */}
      <div className="bg-surface-high rounded-3xl overflow-hidden">
        <div
          className="h-0.5 w-full"
          style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
        />
        <div className="p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[3.5rem] font-bold text-on-surface leading-tight">
                {academy.name}
              </h1>
              {academy.city && (
                <p className="font-body text-sm text-on-surface-variant mt-2">
                  {academy.city}
                </p>
              )}
              <div className="flex gap-2 mt-3 flex-wrap">
                {sub && (
                  <>
                    <span
                      className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${PLAN_CHIP_CLASSES[sub.plan] ?? ""}`}
                    >
                      {PLAN_LABELS[sub.plan] ?? sub.plan}
                    </span>
                    <span
                      className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${STATUS_CHIP_CLASSES[sub.status] ?? ""}`}
                    >
                      {STATUS_LABELS[sub.status] ?? sub.status}
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="font-body text-sm text-on-surface-variant">
              Registrada el{" "}
              {new Date(academy.createdAt).toLocaleDateString("es-EC")}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column section: subscription + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription card */}
        <div className="bg-surface-high rounded-3xl overflow-hidden">
          <div
            className="h-0.5 w-full"
            style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
          />
          <div className="p-6">
            <h3 className="font-display text-[1.75rem] font-semibold text-on-surface mb-4">
              Suscripción
            </h3>
            {sub ? (
              <div className="space-y-3">
                <StatRow
                  icon={<Building2 size={16} />}
                  label="Plan"
                  value={PLAN_LABELS[sub.plan] ?? sub.plan}
                />
                <StatRow
                  icon={<Building2 size={16} />}
                  label="Estado"
                  value={STATUS_LABELS[sub.status] ?? sub.status}
                />
                <StatRow
                  icon={<Building2 size={16} />}
                  label="Inicio"
                  value={new Date(sub.startsAt).toLocaleDateString("es-EC")}
                />
                {sub.endsAt && (
                  <StatRow
                    icon={<Building2 size={16} />}
                    label="Vencimiento"
                    value={new Date(sub.endsAt).toLocaleDateString("es-EC")}
                  />
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-on-surface-variant">
                Sin suscripción activa.
              </p>
            )}
            <Button
              variant="secondary"
              className="mt-6 min-h-11"
              onClick={() => setSubscriptionDialogOpen(true)}
            >
              Editar suscripción
            </Button>
          </div>
        </div>

        {/* Stats card */}
        <div className="bg-surface-high rounded-3xl overflow-hidden">
          <div
            className="h-0.5 w-full"
            style={{ background: "linear-gradient(135deg, #bcf521, #00f4fe)" }}
          />
          <div className="p-6">
            <h3 className="font-display text-[1.75rem] font-semibold text-on-surface mb-4">
              Estadísticas
            </h3>
            <div className="space-y-3">
              <StatRow
                icon={<User size={16} />}
                label="Jugadores activos"
                value={String(academy.totalPlayers)}
              />
              <StatRow
                icon={<Users size={16} />}
                label="Equipos"
                value={String(academy.totalTeams)}
              />
              <StatRow
                icon={<Users size={16} />}
                label="Miembros totales"
                value={String(academy.totalMembers)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div>
        <h3 className="font-display text-[1.75rem] font-semibold text-on-surface mb-4">
          Miembros
        </h3>
        <div className="bg-surface-high rounded-3xl overflow-hidden">
          <div className="grid bg-surface-lowest px-4 py-3 grid-cols-3">
            {["Nombre", "Email", "Rol"].map((h) => (
              <span
                key={h}
                className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant"
              >
                {h}
              </span>
            ))}
          </div>
          {academy.members.length === 0 ? (
            <EmptyState message="No hay miembros registrados." />
          ) : (
            academy.members.map((member: AcademyMemberDetail, i: number) => (
              <div
                key={member.userId}
                className={`grid grid-cols-3 px-4 py-4 ${i % 2 === 0 ? "bg-surface-high" : "bg-surface-highest"}`}
              >
                <span className="font-body text-sm text-on-surface">
                  {member.fullName}
                </span>
                <span className="font-body text-sm text-on-surface-variant">
                  {member.email}
                </span>
                <span>
                  <span
                    className={`font-body text-[0.6875rem] uppercase tracking-[0.05em] rounded-full px-3 py-1 ${ROLE_CHIP_CLASSES[member.role] ?? "bg-surface-highest"}`}
                  >
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <SubscriptionFormDialog
        open={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        academy={academy as AcademyWithSubscription}
      />
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2 text-on-surface-variant">
        {icon}
        <span className="font-body text-sm">{label}</span>
      </div>
      <span className="font-body text-sm font-medium text-on-surface">
        {value}
      </span>
    </div>
  );
}
