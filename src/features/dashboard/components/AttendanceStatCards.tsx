import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card.tsx';
import type { DashboardStats } from '../../../types/attendance.ts';
import { Users, UserCheck, UserMinus, Clock } from 'lucide-react';

interface AttendanceStatCardsProps {
  stats: DashboardStats;
}

export const AttendanceStatCards: React.FC<AttendanceStatCardsProps> = ({ stats }) => {
  const percentage = (value: number) =>
    stats.totalParticipants > 0
      ? Math.round((value / stats.totalParticipants) * 100)
      : 0;

  const cards = [
    {
      id: 'total',
      label: 'Total Registered',
      sublabel: 'Imported CSV Roster',
      value: stats.totalParticipants,
      textColor: 'text-slate-100',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-950/40 border-blue-500/30',
      icon: <Users className="w-5 h-5" />,
      detail: '100% database quota',
    },
    {
      id: 'checked-in',
      label: 'Checked-In (On-Site)',
      sublabel: 'Verified & Present',
      value: stats.checkedInParticipants,
      textColor: 'text-emerald-400',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-950/40 border-emerald-500/30',
      icon: <UserCheck className="w-5 h-5" />,
      detail: `${percentage(stats.checkedInParticipants)}% of total participants`,
    },
    {
      id: 'checked-out',
      label: 'Checked-Out',
      sublabel: 'Temporary / Departed',
      value: stats.checkedOutParticipants,
      textColor: 'text-sky-300',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-950/40 border-sky-500/30',
      icon: <UserMinus className="w-5 h-5" />,
      detail: `${percentage(stats.checkedOutParticipants)}% recorded exits`,
    },
    {
      id: 'pending',
      label: 'Not Yet Checked In',
      sublabel: 'Awaiting Gate Arrival',
      value: stats.notYetCheckedInParticipants,
      textColor: 'text-amber-400',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-950/40 border-amber-500/30',
      icon: <Clock className="w-5 h-5" />,
      detail: `${percentage(stats.notYetCheckedInParticipants)}% pending check-in`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.id} hudCorner className="bg-[#0b1328]/90 border-slate-800/80">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-telemetry uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <div className={`text-3xl font-bold font-telemetry tracking-tight mt-1 ${card.textColor}`}>
                  {card.value}
                </div>
              </div>

              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 shadow-inner ${card.iconBg} ${card.iconColor}`}
              >
                {card.icon}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-telemetry">
              <span>{card.sublabel}</span>
              <span className="text-slate-400">{card.detail}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
