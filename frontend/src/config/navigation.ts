import {
  LayoutDashboard,
  Users,
  User,
  ClipboardList,
  BarChart2,
  Settings,
  Building2,
  CreditCard,
  Sliders,
  Wallet,
  Trophy,
} from "lucide-react";
import type { ComponentType } from "react";
import type { UserRole } from "@/types";

export interface NavItemConfig {
  label: string;
  path: string;
  /** Lucide icon component — render with your preferred size */
  Icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  /** Roles that may access this route — single source of truth for route permissions */
  allowedRoles: UserRole[];
}

// ---------------------------------------------------------------------------
// Route permission map — authoritative source used by ProtectedRoute and UI
// ---------------------------------------------------------------------------

/**
 * All protected routes and which roles may access them.
 * ProtectedRoute reads this — never define permissions anywhere else.
 */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/dashboard": ["academy_director", "coach"],
  "/teams": ["academy_director", "coach"],
  "/players": ["academy_director", "coach"],
  "/attendance": ["academy_director", "coach"],
  "/evaluations": ["academy_director", "coach"],
  "/matches": ["academy_director", "coach"],
  "/payments": ["academy_director"],
  "/notifications": ["academy_director", "coach", "parent"],
  "/settings": ["academy_director", "coach", "parent"],
  "/portal": ["parent"],
  "/owner/dashboard": ["saas_owner"],
  "/owner/academies": ["saas_owner"],
  "/owner/subscriptions": ["saas_owner"],
  "/owner/plan-limits": ["saas_owner"],
  "/owner/users": ["saas_owner"],
};

/**
 * Returns true when `role` is permitted to access `path`.
 *
 * Resolution order:
 * 1. Exact match — e.g. `/teams` hits the `/teams` entry directly.
 * 2. Prefix match — e.g. `/teams/abc-123` falls back to the longest
 *    registered prefix (`/teams`), inheriting its permissions.
 *    This covers all dynamic segments like `:id` without needing to
 *    enumerate every parametric route in ROUTE_PERMISSIONS.
 *
 * Paths not present in ROUTE_PERMISSIONS (and with no matching prefix)
 * are considered unprotected and return false — the router handles them.
 */
export function isRouteAllowed(path: string, role: UserRole): boolean {
  // 1. Exact match
  const exact = ROUTE_PERMISSIONS[path];
  if (exact) return exact.includes(role);

  // 2. Prefix match — find the longest registered prefix that the path starts with
  const prefixMatch = Object.keys(ROUTE_PERMISSIONS)
    .filter((key) => path.startsWith(key + "/"))
    .sort((a, b) => b.length - a.length)[0];

  if (!prefixMatch) return false;
  return ROUTE_PERMISSIONS[prefixMatch].includes(role);
}

/**
 * Returns the default landing path for a given role after login.
 */
export function getDefaultRoute(role: UserRole): string {
  if (role === "parent") return "/portal";
  if (role === "saas_owner") return "/owner/dashboard";
  return "/dashboard";
}

export function getLandingURL(): string {
  return import.meta.env.VITE_LANDING_URL || "http://localhost:4321";
}

// ---------------------------------------------------------------------------
// Navigation items per role (used by Sidebar and BottomNav)
// ---------------------------------------------------------------------------

/**
 * Full navigation map per role.
 * Import this in Sidebar and BottomNav — never duplicate.
 */
export const NAV_ITEMS: Record<UserRole, NavItemConfig[]> = {
  academy_director: [
    {
      label: "Dashboard",
      path: "/dashboard",
      Icon: LayoutDashboard,
      allowedRoles: ROUTE_PERMISSIONS["/dashboard"],
    },
    {
      label: "Equipos",
      path: "/teams",
      Icon: Users,
      allowedRoles: ROUTE_PERMISSIONS["/teams"],
    },
    {
      label: "Jugadores",
      path: "/players",
      Icon: User,
      allowedRoles: ROUTE_PERMISSIONS["/players"],
    },
    {
      label: "Asistencia",
      path: "/attendance",
      Icon: ClipboardList,
      allowedRoles: ROUTE_PERMISSIONS["/attendance"],
    },
    {
      label: "Evaluaciones",
      path: "/evaluations",
      Icon: BarChart2,
      allowedRoles: ROUTE_PERMISSIONS["/evaluations"],
    },
    {
      label: "Encuentros",
      path: "/matches",
      Icon: Trophy,
      allowedRoles: ROUTE_PERMISSIONS["/matches"],
    },
    {
      label: "Pagos",
      path: "/payments",
      Icon: Wallet,
      allowedRoles: ROUTE_PERMISSIONS["/payments"],
    },
    {
      label: "Configuración",
      path: "/settings",
      Icon: Settings,
      allowedRoles: ROUTE_PERMISSIONS["/settings"],
    },
  ],
  coach: [
    {
      label: "Dashboard",
      path: "/dashboard",
      Icon: LayoutDashboard,
      allowedRoles: ROUTE_PERMISSIONS["/dashboard"],
    },
    {
      label: "Equipos",
      path: "/teams",
      Icon: Users,
      allowedRoles: ROUTE_PERMISSIONS["/teams"],
    },
    {
      label: "Jugadores",
      path: "/players",
      Icon: User,
      allowedRoles: ROUTE_PERMISSIONS["/players"],
    },
    {
      label: "Asistencia",
      path: "/attendance",
      Icon: ClipboardList,
      allowedRoles: ROUTE_PERMISSIONS["/attendance"],
    },
    {
      label: "Evaluaciones",
      path: "/evaluations",
      Icon: BarChart2,
      allowedRoles: ROUTE_PERMISSIONS["/evaluations"],
    },
    {
      label: "Encuentros",
      path: "/matches",
      Icon: Trophy,
      allowedRoles: ROUTE_PERMISSIONS["/matches"],
    },
    {
      label: "Configuración",
      path: "/settings",
      Icon: Settings,
      allowedRoles: ROUTE_PERMISSIONS["/settings"],
    },
  ],
  parent: [
    {
      label: "Inicio",
      path: "/portal",
      Icon: User,
      allowedRoles: ROUTE_PERMISSIONS["/portal"],
    },
    {
      label: "Configuración",
      path: "/settings",
      Icon: Settings,
      allowedRoles: ROUTE_PERMISSIONS["/settings"],
    },
  ],
  saas_owner: [
    {
      label: "Dashboard",
      path: "/owner/dashboard",
      Icon: LayoutDashboard,
      allowedRoles: ["saas_owner"],
    },
    {
      label: "Academias",
      path: "/owner/academies",
      Icon: Building2,
      allowedRoles: ["saas_owner"],
    },
    {
      label: "Suscripciones",
      path: "/owner/subscriptions",
      Icon: CreditCard,
      allowedRoles: ["saas_owner"],
    },
    {
      label: "Límites de planes",
      path: "/owner/plan-limits",
      Icon: Sliders,
      allowedRoles: ["saas_owner"],
    },
    {
      label: "Usuarios",
      path: "/owner/users",
      Icon: Users,
      allowedRoles: ["saas_owner"],
    },
  ],
};

/**
 * Returns the full list of navigation items for a given role.
 */
export function getNavigationItems(role: UserRole): NavItemConfig[] {
  return NAV_ITEMS[role] ?? [];
}

/**
 * For bottom nav: primary tabs (always visible, max 5) + overflow tabs
 * (shown inside the "Más" sheet) per role.
 *
 * academy_director (6 items) → 5 primary + Configuración in overflow sheet
 * coach            (6 items) → 5 primary + Configuración in overflow sheet
 * parent           (2 items) → 2 primary, no overflow
 * saas_owner       (5 items) → 5 primary, no overflow
 *
 * Notificaciones is no longer a nav item — it is accessed via the bell icon in the Topbar.
 */
export function getBottomNavItems(role: UserRole): {
  primary: NavItemConfig[];
  overflow: NavItemConfig[];
} {
  const all = getNavigationItems(role);

  if (role === "academy_director") {
    // Primary: Dashboard, Equipos, Jugadores, Evaluaciones, Pagos (5 tabs + Asistencia + Configuración in overflow)
    const primaryPaths = [
      "/dashboard",
      "/teams",
      "/players",
      "/evaluations",
      "/payments",
    ];
    const primary = all.filter((item) => primaryPaths.includes(item.path));
    const overflow = all.filter((item) => !primaryPaths.includes(item.path));
    return { primary, overflow };
  }

  if (role === "coach") {
    // Primary: Dashboard, Equipos, Jugadores, Asistencia, Evaluaciones (5 tabs + "Más" for Configuración)
    const primaryPaths = [
      "/dashboard",
      "/teams",
      "/players",
      "/attendance",
      "/evaluations",
    ];
    const primary = all.filter((item) => primaryPaths.includes(item.path));
    const overflow = all.filter((item) => !primaryPaths.includes(item.path));
    return { primary, overflow };
  }

  // parent (2 items), saas_owner (5 items) — show everything directly
  return { primary: all, overflow: [] };
}
