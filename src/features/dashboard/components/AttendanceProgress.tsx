import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import type { DashboardStats } from '../../../types/attendance.ts';
import { Target, CheckCircle2 } from 'lucide-react';

interface AttendanceProgressProps {
  stats: DashboardStats;
}

export const AttendanceProgress: React.FC<AttendanceProgressProps> = ({ stats }) => {
  const totalParticipants = Math.max(0, stats.totalParticipants);
  const checkedInPct = totalParticipants
    ? Math.min(100, Math.round((stats.checkedInParticipants / totalParticipants) * 100))
    : 0;
  const checkedOutPct = totalParticipants
    ? Math.min(100 - checkedInPct, Math.round((stats.checkedOutParticipants / totalParticipants) * 100))
    : 0;
  const pendingPct = Math.max(0, 100 - checkedInPct - checkedOutPct);

  const totalArrived = stats.checkedInParticipants + stats.checkedOutParticipants;

  return (
    <Card hudCorner className="bg-[#0b1328]/90 border-slate-800/80">
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Attendance Progress & Quota
            </CardTitle>
          </div>
          <Badge variant="telemetry" className="text-[10px]">
            {stats.attendancePercentage}% VERIFIED
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Big percentage & total counts */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-telemetry uppercase text-slate-400 block">
              Cumulative Arrival Rate
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-bold font-telemetry text-cyan-400">
                {stats.attendancePercentage}%
              </span>
              <span className="text-xs text-slate-400 font-telemetry">
                ({totalArrived} of {stats.totalParticipants} attendees)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-telemetry text-emerald-400 font-semibold flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target: &gt; 85%</span>
            </span>
            <span className="text-[10px] text-slate-400 font-telemetry">
              {stats.notYetCheckedInParticipants} remaining
            </span>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-[#060c1c] border border-slate-800 overflow-hidden flex">
            {/* Checked In (Present) */}
            <div
              style={{ width: `${checkedInPct}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Checked In: ${stats.checkedInParticipants} (${checkedInPct}%)`}
            />
            {/* Checked Out */}
            <div
              style={{ width: `${checkedOutPct}%` }}
              className="bg-sky-400 h-full transition-all duration-500"
              title={`Checked Out: ${stats.checkedOutParticipants} (${checkedOutPct}%)`}
            />
            {/* Pending */}
            <div
              style={{ width: `${pendingPct}%` }}
              className="bg-slate-700/60 h-full transition-all duration-500"
              title={`Pending: ${stats.notYetCheckedInParticipants} (${pendingPct}%)`}
            />
          </div>

          {/* Segment Legends */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-telemetry">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-300">Present ({stats.checkedInParticipants})</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
              <span className="text-slate-300">Checked Out ({stats.checkedOutParticipants})</span>
            </div>

            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 shrink-0" />
              <span className="text-slate-400">Pending ({stats.notYetCheckedInParticipants})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
