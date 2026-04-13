import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/teams': 'Equipos',
  '/players': 'Jugadores',
  '/attendance': 'Asistencia',
  '/evaluations': 'Evaluaciones',
  '/notifications': 'Notificaciones',
  '/settings': 'Configuración',
  '/portal': 'Mi Hijo',
};

export default function AppLayout() {
  const location = useLocation();
  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'AcademyPro';

  return (
    <div className="flex h-screen bg-surface-low overflow-hidden">
      {/* Fixed sidebar — desktop only (hidden on mobile/tablet) */}
      <Sidebar />

      {/* Main content area
          Mobile/tablet : no left margin (sidebar is hidden)
          Desktop (lg+)  : ml-65 to clear the sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-65">
        {/* Sticky glassmorphism topbar */}
        <Topbar pageTitle={pageTitle} />

        {/* Scrollable page content
            Mobile/tablet : pb-16 (64px) to clear the bottom nav bar
            Tablet sm+    : pb-18 to clear the taller bottom nav
            Desktop lg+   : pb-0 (no bottom nav) */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 sm:pb-22 lg:p-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation bar — mobile/tablet only (hidden on desktop) */}
      <BottomNav />
    </div>
  );
}
