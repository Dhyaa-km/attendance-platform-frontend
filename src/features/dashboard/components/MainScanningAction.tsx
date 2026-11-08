import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { APP_ROUTES } from '../../../utils/constants.ts';
import { QrCode, ArrowRight, Zap, Radio } from 'lucide-react';

export const MainScanningAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#07132e] via-[#0d1f47] to-[#091533] border-2 border-blue-500/40 p-6 sm:p-7 shadow-2xl shadow-blue-950/70 group">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 blur-2xl pointer-events-none" />

      {/* Decorative Technical Reticle Corner */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none opacity-80">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[10px] font-telemetry tracking-widest text-cyan-400 uppercase">
          RADAR SENSOR READY
        </span>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Description */}
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="telemetry" withDot pulseDot className="bg-blue-950/80 border-blue-400/40 text-cyan-300">
              PRIMARY MISSION OPERATION
            </Badge>
            <Badge variant="success" className="text-[10px]">
              CAMERA GATES ONLINE
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-cyan-400 shrink-0 animate-pulse" />
            <span>Attendee Verification Terminal</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Scan attendee badges for rapid check-in and check-out. Hold participant QR code within the viewfinder for instant verification.
          </p>
        </div>

        {/* Right: The Prominent "Start Scanning" Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Button
            type="button"
            size="lg"
            variant="primary"
            onClick={() => navigate(APP_ROUTES.SCANNER)}
            leftIcon={<QrCode className="w-6 h-6 text-cyan-200" />}
            rightIcon={<ArrowRight className="w-5 h-5 text-cyan-200 group-hover:translate-x-1 transition-transform" />}
            className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold tracking-wide bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-xl shadow-blue-600/40 border-2 border-cyan-400/50 glow-cyan transition-all transform active:scale-[0.98] cursor-pointer"
          >
            Start Scanning
          </Button>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="mt-5 pt-4 border-t border-blue-900/40 flex flex-wrap items-center justify-between gap-3 text-[11px] font-telemetry text-slate-300">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Instant sound & visual confirmation on successful check-in</span>
        </div>
        <div className="text-slate-400">
          Direct navigation to <code className="text-cyan-300 bg-[#060d1f] px-1.5 py-0.5 rounded border border-blue-900/50">/scanner</code>
        </div>
      </div>
    </div>
  );
};
