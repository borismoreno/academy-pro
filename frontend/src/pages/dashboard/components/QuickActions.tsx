import { Plus, UserPlus, ClipboardList, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '@/types';

interface QuickActionsProps {
  role: UserRole | null;
}

export default function QuickActions({ role }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3 lg:space-y-4">
      <h3 className="font-display text-[1.75rem] font-semibold text-on-surface">
        Acciones rápidas
      </h3>

      {/* flex-col (stacked) on mobile, flex-row on desktop */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        {role === 'academy_director' && (
          <>
            <button
              onClick={() => navigate('/teams?action=create')}
              className="w-full lg:w-auto inline-flex items-center justify-center lg:justify-start gap-2 min-h-[44px] px-5 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-br from-primary to-secondary text-on-primary font-semibold rounded-xl transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              Crear equipo
            </button>
            <button
              onClick={() => navigate('/settings?action=invite')}
              className="w-full lg:w-auto inline-flex items-center justify-center lg:justify-start gap-2 min-h-[44px] px-5 lg:px-6 py-2.5 lg:py-3 bg-surface-highest text-primary font-medium rounded-xl hover:bg-surface-high transition-colors"
            >
              <UserPlus size={16} />
              Invitar usuario
            </button>
          </>
        )}

        {role === 'coach' && (
          <>
            <button
              onClick={() => navigate('/attendance?action=create')}
              className="w-full lg:w-auto inline-flex items-center justify-center lg:justify-start gap-2 min-h-[44px] px-5 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-br from-primary to-secondary text-on-primary font-semibold rounded-xl transition-opacity hover:opacity-90"
            >
              <ClipboardList size={16} />
              Registrar asistencia
            </button>
            <button
              onClick={() => navigate('/evaluations?action=create')}
              className="w-full lg:w-auto inline-flex items-center justify-center lg:justify-start gap-2 min-h-[44px] px-5 lg:px-6 py-2.5 lg:py-3 bg-surface-highest text-primary font-medium rounded-xl hover:bg-surface-high transition-colors"
            >
              <BarChart2 size={16} />
              Nueva evaluación
            </button>
          </>
        )}
      </div>
    </div>
  );
}
