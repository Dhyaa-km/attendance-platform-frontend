import React, { useEffect } from 'react';
import { Dialog } from '../../../components/ui/Dialog.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import type { ScanVerificationResult } from '../../../types/attendance.ts';
import { formatTime } from '../../../utils/formatters.ts';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  User,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ScanResultModalProps {
  result: ScanVerificationResult | null;
  isOpen: boolean;
  onDismiss: () => void;
}

export const ScanResultModal: React.FC<ScanResultModalProps> = ({
  result,
  isOpen,
  onDismiss,
}) => {
  // Listen for Enter or Space key to quickly dismiss and resume scanning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!result) return null;

  const isSuccess = result.status === 'success';
  const isAlreadyProcessed = result.status === 'already_processed';
  const isInvalid = result.status === 'invalid_code' || result.status === 'error';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onDismiss}
      maxWidth="md"
      hudCorner
    >
      <div className="space-y-5 text-center sm:text-left">
        {/* Status Header & Icon */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-2xl transition-transform transform scale-105 ${
              isSuccess
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-400 glow-emerald'
                : isAlreadyProcessed
                ? 'bg-amber-950/60 border-amber-400 text-amber-400'
                : 'bg-red-950/60 border-red-500 text-red-400 glow-rose'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-9 h-9" />}
            {isAlreadyProcessed && <AlertTriangle className="w-9 h-9" />}
            {isInvalid && <XCircle className="w-9 h-9" />}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge
                variant={isSuccess ? 'success' : isAlreadyProcessed ? 'warning' : 'danger'}
                withDot
                pulseDot={isSuccess}
                className="uppercase tracking-wider font-telemetry"
              >
                {result.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="font-telemetry text-[10px]">
                ACTION: {result.action.toUpperCase()}
              </Badge>
            </div>

            <h3 className="text-xl font-bold tracking-tight text-white">
              {result.message}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>

        {/* Detailed Participant Card when valid or already processed */}
        {result.participant && (
          <div className="p-4 rounded-xl bg-[#070e20] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">
                  {result.participant.fullName}
                </span>
              </div>
              <Badge variant="telemetry" className="text-[10px]">
                {result.participant.role.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-telemetry">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">{result.participant.teamName || 'No Team Assigned'}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 justify-end">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-semibold">{result.participant.qrCode}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-telemetry text-slate-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Verified: {formatTime(result.timestamp)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                <span>Operator: {result.organizerName || 'Desk Operator'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Invalid Raw Code Card */}
        {isInvalid && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-telemetry space-y-1">
            <span className="text-slate-400 text-[10px] uppercase block">
              Scanned QR Token:
            </span>
            <code className="text-red-300 text-sm font-semibold break-all">
              {result.rawCode || 'UNKNOWN_CODE'}
            </code>
          </div>
        )}

        {/* Action Button: Scan Next */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            size="lg"
            variant={isSuccess ? 'success' : 'primary'}
            onClick={onDismiss}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold tracking-wide cursor-pointer"
          >
            <span>Scan Next Participant</span>
            <span className="text-[10px] opacity-75 hidden sm:inline ml-1 font-telemetry">[Space / Enter]</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
