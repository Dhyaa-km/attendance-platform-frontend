import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/useAppStore.ts';
import { useAuthStore } from '../../stores/useAuthStore.ts';
import { APP_ROUTES, EVENT_DETAILS } from '../../utils/constants.ts';
import { cn } from '../../lib/utils.ts';
import {
  LayoutDashboard,
  QrCode,
  Users,
  ClipboardCheck,
  Palette,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Radio,
} from 'lucide-react';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: string;
  isOpsAction?: boolean;
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, soundEnabled, toggleSound } = useAppStore();
  const { logout } = useAuthStore();
  const location = useLocation();

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  const navItems: NavItem[] = [
    {
      label: 'Mission Dashboard',
      to: APP_ROUTES.DASHBOARD,
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      label: 'QR Scanner',
      to: APP_ROUTES.SCANNER,
      icon: <QrCode className="w-4 h-4 shrink-0" />,
      badge: 'LIVE',
      isOpsAction: true,
    },
    {
      label: 'Participants Roster',
      to: APP_ROUTES.PARTICIPANTS,
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      label: 'Attendance History',
      to: APP_ROUTES.ATTENDANCE,
      icon: <ClipboardCheck className="w-4 h-4 shrink-0" />,
    },
    {
      label: 'Design System & Tokens',
      to: APP_ROUTES.DESIGN_SYSTEM,
      icon: <Palette className="w-4 h-4 shrink-0" />,
      badge: 'v1.0',
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 h-full lg:h-[calc(100vh-57px)] w-64 bg-[#060c1d] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top: Mobile Close Button & Compact Event Identity */}
        <div>
          <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 font-telemetry tracking-wider uppercase">
                NASA ALG-2026
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            <p className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-telemetry">
              Terminal Navigation
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group select-none',
                      isActive
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-inner'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50'
                            : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className={cn(isActive && 'font-semibold text-slate-100')}>
                        {item.label}
                      </span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-telemetry px-1.5 py-0.5 rounded uppercase tracking-wider',
                          item.isOpsAction
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {/* Explicit Logout Navigation Action */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all select-none cursor-pointer mt-2"
              >
                <span className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </span>
                <span>Sign Out Terminal</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Bottom Section: Operations Telemetry & Links */}
        <div className="p-3 border-t border-slate-800/80 space-y-3">
          {/* Audio Beep Feedback Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#081023] border border-slate-800 text-slate-300 hover:border-slate-700 text-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="font-telemetry text-[11px]">Scanner Audio</span>
            </div>
            <span
              className={cn(
                'text-[10px] font-telemetry font-bold px-1.5 py-0.5 rounded',
                soundEnabled ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400 bg-slate-900'
              )}
            >
              {soundEnabled ? 'ON' : 'MUTED'}
            </span>
          </button>

          {/* Compact Event Identity Card */}
          <div className="p-3 rounded-xl bg-[#091226]/80 border border-blue-900/30 text-left">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-200">
                NASA Space Apps Algiers
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              {EVENT_DETAILS.DATES} • {EVENT_DETAILS.LOCATION}
            </p>

            <a
              href={EVENT_DETAILS.OFFICIAL_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Official Event Page</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
