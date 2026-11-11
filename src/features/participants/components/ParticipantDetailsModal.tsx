import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import type { Participant } from '../../../types/participant.ts';
import { formatFullTimestamp } from '../../../utils/formatters.ts';
import {
  Mail,
  Phone,
  QrCode,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

interface ParticipantDetailsModalProps {
  participant: Participant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ParticipantDetailsModal: React.FC<ParticipantDetailsModalProps> = ({
  participant,
  isOpen,
  onClose,
}) => {
  const [revealToken, setRevealToken] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!participant) return null;

  const isCheckedIn = participant.status === 'checked_in';
  const isCheckedOut = participant.status === 'checked_out';
  const isPending = participant.status === 'pending';

  const handleCopyId = () => {
    if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
      navigator.clipboard.writeText(participant.qrCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const maskedToken = `${participant.qrCode.slice(0, 5)}-••••-••••`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Participant Profile & Attendance Credentials"
      description="NASA Space Apps Challenge Algiers 2026 attendee database record."
      maxWidth="md"
      hudCorner
    >
      <div className="space-y-5">
        {/* Attendee Identity Header Card */}
        <div className="p-4 rounded-xl bg-[#081023] border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-telemetry font-bold text-sm flex items-center justify-center shrink-0">
                {participant.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{participant.fullName}</span>
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span className="text-cyan-300 font-semibold">{participant.teamName || 'Independent Participant'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-center">
              <Badge variant="telemetry" className="text-[10px]">
                {participant.role.toUpperCase()}
              </Badge>
              {isCheckedIn && <Badge variant="success" withDot pulseDot>CHECKED IN</Badge>}
              {isCheckedOut && <Badge variant="info" withDot>CHECKED OUT</Badge>}
              {isPending && <Badge variant="warning" withDot>NOT CHECKED IN</Badge>}
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{participant.email}</span>
            </div>

            {participant.phone && (
              <div className="flex items-center gap-2 text-slate-300 font-telemetry">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{participant.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Status & Telemetry Timestamps */}
        <div className="p-4 rounded-xl bg-[#070e20] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider font-telemetry">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Attendance Status & Gate Records</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Check-In Timestamp */}
            <div className="p-3 rounded-lg bg-[#050b1a] border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-telemetry uppercase text-slate-400 block">
                Check-In Timestamp
              </span>
              <span className="text-xs font-semibold font-telemetry text-emerald-400 block">
                {participant.firstCheckInAt ? formatFullTimestamp(participant.firstCheckInAt) : 'Not Yet Recorded'}
              </span>
            </div>

            {/* Check-Out Timestamp */}
            <div className="p-3 rounded-lg bg-[#050b1a] border border-slate-800/80 space-y-1">
              <span className="text-[10px] font-telemetry uppercase text-slate-400 block">
                Check-Out Timestamp
              </span>
              <span className="text-xs font-semibold font-telemetry text-sky-300 block">
                {participant.checkOutAt ? formatFullTimestamp(participant.checkOutAt) : '— (No Departure)'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Credential & QR Token Section (Never exposed unnecessarily) */}
        <div className="p-4 rounded-xl bg-[#070e20] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider font-telemetry">
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Badge Credential Token</span>
            </div>

            <button
              type="button"
              onClick={() => setRevealToken(!revealToken)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-telemetry flex items-center gap-1 transition-colors cursor-pointer"
            >
              {revealToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{revealToken ? 'Mask Token' : 'Reveal Token'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-[#050b1a] border border-slate-800/80 font-telemetry text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Badge ID:</span>
              <code className="text-cyan-300 font-bold">
                {revealToken ? participant.qrCode : maskedToken}
              </code>
            </div>

            <button
              type="button"
              onClick={handleCopyId}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              title="Copy Badge ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {participant.notes && (
            <p className="text-xs text-slate-400 italic">
              Note: {participant.notes}
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Details
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
