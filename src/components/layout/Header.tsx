import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.ts';
import { useAppStore } from '../../stores/useAppStore.ts';
import { useTelemetryClock } from '../../hooks/useTelemetryClock.ts';
import { EVENT_DETAILS, APP_ROUTES } from '../../utils/constants.ts';
import { StatusIndicator } from '../ui/StatusIndicator.tsx';
import { Avatar } from '../ui/Avatar.tsx';
import { Button } from '../ui/Button.tsx';
import { QrCode, LogOut, Menu, Radio, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { organizer, logout } = useAuthStore();
  const { toggleSidebar, systemStatus } = useAppStore();
  const { timeStr, algiersOffset } = useTelemetryClock();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  const isScannerActive = location.pathname === APP_ROUTES.SCANNER;

  const pageTitles: Record<string, string> = {
    [APP_ROUTES.DASHBOARD]: 'Mission Dashboard',
    [APP_ROUTES.SCANNER]: 'QR Scanner Terminal',
    [APP_ROUTES.PARTICIPANTS]: 'Participants Roster',
    [APP_ROUTES.ATTENDANCE]: 'Attendance History',
    [APP_ROUTES.DESIGN_SYSTEM]: 'Design System & Tokens',
  };
  const currentPageTitle = pageTitles[location.pathname] || 'Operations Terminal';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#050b1a]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Branding, Node Info & Current Page Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* NASA Logo & Event Title */}
          <Link to={APP_ROUTES.DASHBOARD} className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 shadow-md shadow-blue-950/50 group-hover:border-blue-400 transition-colors">
              <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#050b1a]" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  NASA Space Apps
                </span>
                <span className="text-[10px] font-telemetry bg-blue-900/60 text-blue-300 px-1.5 py-0.2 rounded border border-blue-700/40">
                  ALG-2026
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-tight">
                Operations Platform — {EVENT_DETAILS.LOCATION}
              </span>
            </div>
          </Link>

          {/* Current Page Title Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              {currentPageTitle}
            </span>
          </div>
        </div>

        {/* Center: Live Telemetry Clock & Station Status (Hidden on small mobile) */}
        <div className="hidden md:flex items-center gap-4">
          <StatusIndicator
            status={systemStatus === 'OPERATIONAL' ? 'online' : 'warning'}
            label={systemStatus}
            sublabel="ALGIERS OPS NODE 01"
          />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070e20] border border-slate-800/80 font-telemetry text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-xs font-semibold tracking-wider text-cyan-300">{timeStr}</span>
            <span className="text-[10px] text-slate-400 font-normal">{algiersOffset}</span>
          </div>
        </div>

        {/* Right: Quick Action & Organizer Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick Scanner Shortcut */}
          <Link to={APP_ROUTES.SCANNER}>
            <Button
              size="sm"
              variant={isScannerActive ? 'success' : 'primary'}
              leftIcon={<QrCode className="w-4 h-4" />}
              className="font-medium"
            >
              <span className="hidden sm:inline">QR Scanner</span>
              <span className="sm:hidden">Scan</span>
            </Button>
          </Link>

          {/* Organizer Info & Logout */}
          {organizer && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800/80">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200 leading-tight">
                  {organizer.name}
                </span>
                <span className="text-[10px] font-telemetry text-cyan-400/90 leading-tight">
                  {organizer.callsign || organizer.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <Avatar
                name={organizer.name}
                callsign={organizer.callsign}
                size="sm"
                isOnline
              />

              <button
                type="button"
                onClick={handleLogout}
                title="Sign out of operations terminal"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
