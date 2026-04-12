import { NavLink, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useLogout";
import { getNavigationItems } from "@/config/navigation";

const ROLE_LABELS = {
  academy_director: "Director",
  coach: "Entrenador",
  parent: "Padre / Madre",
  saas_owner: "Administrador",
} as const;

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const academyName = useAuthStore((state) => state.academyName);
  const { logout } = useLogout();

  const navItems = role ? getNavigationItems(role) : [];
  const initials = user ? getInitials(user.fullName) : "?";

  return (
    // hidden by default; shown as flex column on lg+ (desktop only)
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-65 bg-surface-lowest z-10 flex-col">
      {/* Top: Logo + Academy name */}
      <div className="px-6 pt-8 pb-6">
        <span className="font-display text-[1.25rem] font-bold text-primary tracking-tight">
          AcademyPro
        </span>
        {academyName && (
          <p className="mt-1 font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
            {academyName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={[
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    isActive
                      ? "bg-surface-high text-primary font-medium"
                      : "bg-transparent text-on-surface-variant hover:bg-surface-high hover:text-on-surface",
                  ].join(" ")}
                >
                  <item.Icon size={18} />
                  <span className="font-body text-[0.875rem]">
                    {item.label}
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: User info + Logout */}
      <div className="px-4 py-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surface-high flex items-center justify-center shrink-0">
            <span className="font-display text-[0.75rem] font-bold text-primary">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-body text-[0.875rem] text-on-surface truncate">
              {user?.fullName ?? "—"}
            </p>
            <p className="font-body text-[0.6875rem] uppercase tracking-[0.05em] text-on-surface-variant">
              {role ? ROLE_LABELS[role] : "—"}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-transparent text-on-surface-variant hover:text-primary transition-colors w-full cursor-pointer"
        >
          <LogOut size={16} />
          <span className="font-body text-[0.875rem]">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
