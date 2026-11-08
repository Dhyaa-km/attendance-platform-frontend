import React from 'react';
import { cn } from '../../lib/utils.ts';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className,
  ...props
}) => {
  const styles: Record<AlertType, { border: string; bg: string; icon: React.ReactNode; titleColor: string }> = {
    success: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/30',
      titleColor: 'text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      border: 'border-red-500/30',
      bg: 'bg-red-950/30',
      titleColor: 'text-red-300',
      icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" />,
    },
    warning: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/30',
      titleColor: 'text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    },
    info: {
      border: 'border-blue-500/30',
      bg: 'bg-blue-950/30',
      titleColor: 'text-blue-300',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    },
  };

  const current = styles[type];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm',
        current.border,
        current.bg,
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 space-y-0.5">
        {title && <h5 className={cn('text-sm font-semibold tracking-wide', current.titleColor)}>{title}</h5>}
        <div className="text-xs text-slate-300 leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
