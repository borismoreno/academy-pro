import {
  LayoutDashboard,
  Users,
  User,
  ClipboardList,
  BarChart2,
  Bell,
  Settings,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { UserRole } from '@/types';

export interface NavItemConfig {
  label: string;
  path: string;
  /** Lucide icon component — render with your preferred size */
  Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
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
  '/dashboard':    ['academy_director', 'coach'],
  '/teams':        ['academy_director', 'coach'],
  '/players':      ['academy_director', 'coach'],
  '/attendance':   ['academy_director', 'coach'],
  '/evaluations':  ['academy_director', 'coach'],
  '/notifications':['academy_director', 'coach', 'parent'],
  '/settings':     ['academy_director'],
  '/portal':       ['parent'],
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
    .filter((key) => path.startsWith(key + '/'))
    .sort((a, b) => b.length - a.length)[0];

  if (!prefixMatch) return false;
  return ROUTE_PERMISSIONS[prefixMatch].includes(role);
}

/**
 * Returns the default landing path for a given role after login.
 */
export function getDefaultRoute(role: UserRole): string {
  return role === 'parent' ? '/portal' : '/dashboard';
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
    { label: 'Dashboard',      path: '/dashboard',    Icon: LayoutDashboard, allowedRoles: ROUTE_PERMISSIONS['/dashboard'] },
    { label: 'Equipos',        path: '/teams',        Icon: Users,           allowedRoles: ROUTE_PERMISSIONS['/teams'] },
    { label: 'Jugadores',      path: '/players',      Icon: User,            allowedRoles: ROUTE_PERMISSIONS['/players'] },
    { label: 'Asistencia',     path: '/attendance',   Icon: ClipboardList,   allowedRoles: ROUTE_PERMISSIONS['/attendance'] },
    { label: 'Evaluaciones',   path: '/evaluations',  Icon: BarChart2,       allowedRoles: ROUTE_PERMISSIONS['/evaluations'] },
    { label: 'Notificaciones', path: '/notifications',Icon: Bell,            allowedRoles: ROUTE_PERMISSIONS['/notifications'] },
    { label: 'Configuración',  path: '/settings',     Icon: Settings,        allowedRoles: ROUTE_PERMISSIONS['/settings'] },
  ],
  coach: [
    { label: 'Dashboard',      path: '/dashboard',    Icon: LayoutDashboard, allowedRoles: ROUTE_PERMISSIONS['/dashboard'] },
    { label: 'Equipos',        path: '/teams',        Icon: Users,           allowedRoles: ROUTE_PERMISSIONS['/teams'] },
    { label: 'Jugadores',      path: '/players',      Icon: User,            allowedRoles: ROUTE_PERMISSIONS['/players'] },
    { label: 'Asistencia',     path: '/attendance',   Icon: ClipboardList,   allowedRoles: ROUTE_PERMISSIONS['/attendance'] },
    { label: 'Evaluaciones',   path: '/evaluations',  Icon: BarChart2,       allowedRoles: ROUTE_PERMISSIONS['/evaluations'] },
    { label: 'Notificaciones', path: '/notifications',Icon: Bell,            allowedRoles: ROUTE_PERMISSIONS['/notifications'] },
  ],
  parent: [
    { label: 'Mi hijo',        path: '/portal',       Icon: User,            allowedRoles: ROUTE_PERMISSIONS['/portal'] },
    { label: 'Notificaciones', path: '/notifications',Icon: Bell,            allowedRoles: ROUTE_PERMISSIONS['/notifications'] },
  ],
  saas_owner: [
    { label: 'Dashboard',      path: '/dashboard',    Icon: LayoutDashboard, allowedRoles: ROUTE_PERMISSIONS['/dashboard'] },
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
 * academy_director (7 items) → 4 primary + overflow sheet
 * coach            (6 items) → 5 primary, no overflow
 * parent           (2 items) → 2 primary, no overflow
 * saas_owner       (1 item)  → 1 primary, no overflow
 */
export function getBottomNavItems(role: UserRole): {
  primary: NavItemConfig[];
  overflow: NavItemConfig[];
} {
  const all = getNavigationItems(role);

  if (role === 'academy_director') {
    // Primary: Dashboard, Jugadores, Asistencia, Evaluaciones (4 tabs + "Más")
    const primaryPaths = ['/dashboard', '/players', '/attendance', '/evaluations'];
    const primary = all.filter((item) => primaryPaths.includes(item.path));
    const overflow = all.filter((item) => !primaryPaths.includes(item.path));
    return { primary, overflow };
  }

  if (role === 'coach') {
    // Primary: Dashboard, Jugadores, Asistencia, Evaluaciones, Notificaciones (5 tabs)
    const primaryPaths = ['/dashboard', '/players', '/attendance', '/evaluations', '/notifications'];
    const primary = all.filter((item) => primaryPaths.includes(item.path));
    return { primary, overflow: [] };
  }

  // parent, saas_owner — show everything (≤ 5 items)
  return { primary: all, overflow: [] };
}
