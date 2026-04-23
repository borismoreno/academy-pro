import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, Users, BarChart2, User, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useSettings } from "@/hooks/useSettings";
import AcademyInfoForm from "./components/AcademyInfoForm";
import UserManagement from "./components/UserManagement";
import EvaluationMetricsManager from "./components/EvaluationMetricsManager";
import ProfileForm from "./components/ProfileForm";
import InviteUserSheet from "./components/InviteUserSheet";
import FieldsManager from "./components/FieldsManager";

type TabId = "academia" | "canchas" | "usuarios" | "metricas" | "perfil";

interface TabConfig {
  id: TabId;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const DIRECTOR_TABS: TabConfig[] = [
  { id: "academia", label: "Mi academia", Icon: Building2 },
  { id: "canchas", label: "Canchas", Icon: MapPin },
  { id: "usuarios", label: "Usuarios", Icon: Users },
  { id: "metricas", label: "Métricas", Icon: BarChart2 },
  { id: "perfil", label: "Mi perfil", Icon: User },
];

const PROFILE_ONLY_TABS: TabConfig[] = [
  { id: "perfil", label: "Mi perfil", Icon: User },
];

export default function SettingsPage() {
  const role = useAuthStore((s) => s.role);
  const [searchParams] = useSearchParams();

  const isDirector = role === "academy_director";
  const tabs = isDirector ? DIRECTOR_TABS : PROFILE_ONLY_TABS;
  const defaultTab: TabId = isDirector ? "academia" : "perfil";

  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);

  const {
    academy,
    academyLoading,
    members,
    membersLoading,
    metrics,
    metricsLoading,
    isCustomMetricsEnabled,
    updateAcademyMutation,
    createMetricMutation,
    updateMetricMutation,
    deleteMetricMutation,
    pendingInvitations,
    pendingInvitationsLoading,
    resendInvitationMutation,
    cancelInvitationMutation,
  } = useSettings(isDirector);

  // ?action=invite — navigate to usuarios tab and open sheet
  useEffect(() => {
    if (searchParams.get("action") === "invite" && isDirector) {
      setActiveTab("usuarios");
      setInviteSheetOpen(true);
    }
  }, [searchParams, isDirector]);

  function renderContent() {
    switch (activeTab) {
      case "academia":
        if (academyLoading) {
          return (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          );
        }
        return (
          <AcademyInfoForm
            academy={academy ?? null}
            onSubmit={(data) => updateAcademyMutation.mutate(data)}
            isLoading={updateAcademyMutation.isPending}
          />
        );

      case "canchas":
        return <FieldsManager />;

      case "usuarios":
        return (
          <>
            <UserManagement
              members={members}
              onInvite={() => setInviteSheetOpen(true)}
              isLoading={membersLoading}
              pendingInvitations={pendingInvitations}
              pendingInvitationsLoading={pendingInvitationsLoading}
              onResend={(id) => resendInvitationMutation.mutate(id)}
              onCancel={(id) => cancelInvitationMutation.mutate(id)}
              isResending={resendInvitationMutation.isPending}
              isCancelling={cancelInvitationMutation.isPending}
            />
            <InviteUserSheet
              open={inviteSheetOpen}
              onOpenChange={setInviteSheetOpen}
              onSuccess={() => {}}
            />
          </>
        );

      case "metricas":
        return (
          <EvaluationMetricsManager
            metrics={metrics}
            isCustomMetricsEnabled={isCustomMetricsEnabled}
            onCreate={(data) => createMetricMutation.mutate(data)}
            onUpdate={(id, data) => updateMetricMutation.mutate({ id, data })}
            onDelete={(id) => deleteMetricMutation.mutate(id)}
            isLoading={metricsLoading}
            isCreating={createMetricMutation.isPending}
            isUpdating={updateMetricMutation.isPending}
            isDeleting={deleteMetricMutation.isPending}
          />
        );

      case "perfil":
        return <ProfileForm />;

      default:
        return null;
    }
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <div className="mt-2 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Tab list */}
        <div className="lg:w-48 lg:shrink-0">
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide lg:hidden pb-1">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={[
                  "flex items-center gap-2 min-h-11 px-4 py-2 rounded-xl font-body text-sm whitespace-nowrap transition-all shrink-0 cursor-pointer",
                  activeTab === id
                    ? "bg-surface-high text-primary"
                    : "text-on-surface-variant hover:bg-surface-high",
                ].join(" ")}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical list */}
          <div className="hidden lg:flex flex-col gap-1">
            {tabs.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={[
                  "flex items-center gap-3 min-h-11 px-4 py-3 rounded-xl font-body text-sm text-left transition-all cursor-pointer",
                  activeTab === id
                    ? "bg-surface-high text-primary"
                    : "text-on-surface-variant hover:bg-surface-high",
                ].join(" ")}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
}
