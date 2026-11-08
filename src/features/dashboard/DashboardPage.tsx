import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { APP_ROUTES, EVENT_DETAILS } from '../../utils/constants.ts';
import {
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Activity,
  Layers,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner: Mission Header */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-r from-[#0a142c] via-[#0b1736] to-[#071126] border border-blue-900/40 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="telemetry" withDot pulseDot>
                OPERATIONAL DESK ACTIVE
              </Badge>
              <Badge variant="info">
                ALGIERS STATION
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {EVENT_DETAILS.NAME} — {EVENT_DETAILS.YEAR}
            </h1>
            <p className="text-xs md:text-sm text-slate-400">
              Attendance management and participant verification terminal for organizers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to={APP_ROUTES.SCANNER}>
              <Button
                variant="primary"
                leftIcon={<QrCode className="w-4 h-4" />}
                className="glow-blue"
              >
                Launch QR Scanner
              </Button>
            </Link>
            <Link to={APP_ROUTES.PARTICIPANTS}>
              <Button variant="secondary" leftIcon={<Users className="w-4 h-4" />}>
                View Roster
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <Card hudCorner>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-telemetry uppercase text-slate-400">Total Participants</p>
              <h4 className="text-2xl font-bold font-telemetry text-slate-100 mt-1">120</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Imported from CSV list</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Checked In */}
        <Card hudCorner>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-telemetry uppercase text-slate-400">Checked In</p>
              <h4 className="text-2xl font-bold font-telemetry text-emerald-400 mt-1">84</h4>
              <p className="text-[11px] text-emerald-400/90 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified on-site</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Expected / Remaining */}
        <Card hudCorner>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-telemetry uppercase text-slate-400">Pending Arrival</p>
              <h4 className="text-2xl font-bold font-telemetry text-amber-400 mt-1">36</h4>
              <p className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>Awaiting check-in</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card hudCorner>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-telemetry uppercase text-slate-400">Attendance Rate</p>
              <h4 className="text-2xl font-bold font-telemetry text-cyan-400 mt-1">70.0%</h4>
              <p className="text-[11px] text-cyan-400/90 flex items-center gap-1 mt-0.5">
                <Activity className="w-3 h-3" />
                <span>Target &gt; 85%</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Section Skeletons / Foundation Slices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations Guide & Terminal Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <CardTitle>Attendance Operations Overview</CardTitle>
              </div>
              <Badge variant="outline">STATION READY</Badge>
            </div>
            <CardDescription>
              Operational flow and check-in procedures for NASA Space Apps Algiers organizers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-telemetry font-bold text-xs">
                  01
                </div>
                <h5 className="text-xs font-semibold text-slate-200">Import CSV Roster</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Participant lists imported via backend with unique QR identification codes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-telemetry font-bold text-xs">
                  02
                </div>
                <h5 className="text-xs font-semibold text-slate-200">Mobile QR Scanning</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Fast camera scanning on handheld smartphones or tablets at the check-in gates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#080f21] border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-telemetry font-bold text-xs">
                  03
                </div>
                <h5 className="text-xs font-semibold text-slate-200">Real-time Telemetry</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Attendance logs and statistics available immediately across all organizers.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#070e20] border border-blue-900/30 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-semibold text-slate-200">
                  Design System & Architecture Tokens
                </h5>
                <p className="text-[11px] text-slate-400">
                  Inspect reusable UI primitives, color swatches, typography, and badges.
                </p>
              </div>
              <Link to={APP_ROUTES.DESIGN_SYSTEM}>
                <Button size="sm" variant="telemetry" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Explore Tokens
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Live Station Status & Organizers Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <CardTitle>Organizers Station</CardTitle>
            </div>
            <CardDescription>3–5 Organizers on active attendance duty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-[#081023] border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Amina Mansouri</div>
                  <div className="text-[10px] text-slate-400 font-telemetry">LEAD ORGANIZER • GATE 1</div>
                </div>
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </div>

            <div className="p-3 rounded-lg bg-[#081023] border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Karim Bouzid</div>
                  <div className="text-[10px] text-slate-400 font-telemetry">TECH LEAD • GATE 2</div>
                </div>
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </div>

            <div className="p-3 rounded-lg bg-[#081023] border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Yasmine Hadj</div>
                  <div className="text-[10px] text-slate-400 font-telemetry">SCAN OPERATOR • GATE 3</div>
                </div>
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
