import React from 'react';
import { cn } from '../../lib/utils.ts';

export type BadgeVariant =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'outline'
  | 'telemetry';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
  pulseDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  withDot = false,
  pulseDot = false,
  className,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    success: {
      container: 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    danger: {
      container: 'bg-red-950/50 text-red-300 border-red-500/30',
      dot: 'bg-red-400',
    },
    warning: {
      container: 'bg-amber-950/50 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    info: {
      container: 'bg-blue-950/50 text-blue-300 border-blue-500/30',
      dot: 'bg-blue-400',
    },
    neutral: {
      container: 'bg-slate-900/60 text-slate-300 border-slate-700/50',
      dot: 'bg-slate-400',
    },
    outline: {
      container: 'bg-transparent text-slate-300 border-slate-700',
      dot: 'bg-slate-400',
    },
    telemetry: {
      container: 'bg-[#081124] text-cyan-300 border-cyan-500/40 font-telemetry uppercase tracking-wider',
      dot: 'bg-cyan-400',
    },
  };

  const selected = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none',
        selected.container,
        className
      )}
      {...props}
    >
      {withDot && (
        <span className="relative flex h-2 w-2">
          {pulseDot && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                selected.dot
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', selected.dot)} />
        </span>
      )}
      {children}
    </span>
  );
};
