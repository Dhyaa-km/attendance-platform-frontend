import React from 'react';
import { cn } from '../../lib/utils.ts';

export type StatusLevel = 'online' | 'warning' | 'offline' | 'busy';

export interface StatusIndicatorProps {
  status?: StatusLevel;
  label?: string;
  sublabel?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = 'online',
  label = 'SYSTEM OPERATIONAL',
  sublabel,
  className,
}) => {
  const statusConfig: Record<StatusLevel, { dot: string; ping: string; text: string }> = {
    online: {
      dot: 'bg-emerald-400',
      ping: 'bg-emerald-400',
      text: 'text-emerald-400',
    },
    warning: {
      dot: 'bg-amber-400',
      ping: 'bg-amber-400',
      text: 'text-amber-400',
    },
    offline: {
      dot: 'bg-red-400',
      ping: 'bg-red-400',
      text: 'text-red-400',
    },
    busy: {
      dot: 'bg-cyan-400',
      ping: 'bg-cyan-400',
      text: 'text-cyan-400',
    },
  };

  const current = statusConfig[status];

  return (
    <div className={cn('inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#070e1e]/90 border border-slate-800/80', className)}>
      <span className="relative flex h-2 w-2">
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', current.ping)} />
        <span className={cn('relative inline-flex rounded-full h-2 w-2', current.dot)} />
      </span>
      <div className="flex flex-col text-left">
        <span className={cn('text-[11px] font-telemetry font-semibold tracking-wider uppercase leading-none', current.text)}>
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-slate-400 font-telemetry leading-none mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
