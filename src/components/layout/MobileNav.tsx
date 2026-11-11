import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_ROUTES } from '../../utils/constants.ts';
import { cn } from '../../lib/utils.ts';
import { useAuthStore } from '../../stores/useAuthStore.ts';
import { LayoutDashboard, QrCode, Users, ClipboardCheck } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { organizer } = useAuthStore();
  const isAdmin = organizer?.role === 'admin';

  const isScannerActive = location.pathname === APP_ROUTES.SCANNER;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-[#050b1a]/95 backdrop-blur-lg border-t border-slate-800/90 px-3 py-1.5 pb-safe">
      <div className="flex items-center justify-around relative">
        {/* Dashboard */}
        <NavLink
          to={APP_ROUTES.DASHBOARD}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
              isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Overview</span>
        </NavLink>

        {/* Participants */}
        {isAdmin && <NavLink
          to={APP_ROUTES.PARTICIPANTS}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
              isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Roster</span>
        </NavLink>}

        {/* Big Center Floating Scanner Action */}
        <div className="relative -top-4">
          {isAdmin && <NavLink
            to={APP_ROUTES.SCANNER}
            className={cn(
              'flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-200 border-2',
              isScannerActive
                ? 'bg-emerald-500 text-white border-emerald-300 ring-4 ring-emerald-500/20 scale-105 shadow-emerald-500/50'
                : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50 ring-4 ring-blue-600/20 shadow-blue-600/50'
            )}
            aria-label="Launch QR Scanner"
          >
            <QrCode className="w-7 h-7" />
          </NavLink>}
        </div>

        {/* Attendance Records */}
        <NavLink
          to={APP_ROUTES.ATTENDANCE}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors',
              isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          <ClipboardCheck className="w-5 h-5 mb-0.5" />
          <span>Records</span>
        </NavLink>

      </div>
    </nav>
  );
};
