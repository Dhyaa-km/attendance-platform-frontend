import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CameraViewfinder } from './components/CameraViewfinder.tsx';
import { ManualCodeInput } from './components/ManualCodeInput.tsx';
import { ScanResultModal } from './components/ScanResultModal.tsx';
import { Tabs } from '../../components/ui/Tabs.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { useAuthStore } from '../../stores/useAuthStore.ts';
import { useAppStore } from '../../stores/useAppStore.ts';
import { scanService } from './services/scanService.ts';
import { playScanFeedback } from './utils/audioFeedback.ts';
import type { AttendanceAction, ScanVerificationResult } from '../../types/attendance.ts';
import { APP_ROUTES } from '../../utils/constants.ts';
import {
  ArrowLeft,
  LogIn,
  LogOut,
  QrCode,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const { organizer } = useAuthStore();
  const { soundEnabled, toggleSound } = useAppStore();

  const [scanMode, setScanMode] = useState<AttendanceAction>('check-in');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanVerificationResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Main QR detection handler (invoked by either camera or manual input)
  const handleProcessCode = async (rawCode: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const organizerId = organizer?.id || 'org-algiers-unknown';
      const organizerName = organizer?.name || 'Gate Operator';

      const result = await scanService.verifyAndProcessCode(
        rawCode,
        scanMode,
        organizerId,
        organizerName
      );

      // Play audio & haptic feedback based on verification status
      if (result.status === 'success') {
        playScanFeedback('success', soundEnabled);
      } else if (result.status === 'already_processed') {
        playScanFeedback('warning', soundEnabled);
      } else {
        playScanFeedback('error', soundEnabled);
      }

      setScanResult(result);
      setIsModalOpen(true);
    } catch {
      // In case of unexpected verification error
      const fallbackResult: ScanVerificationResult = {
        status: 'error',
        action: scanMode,
        message: 'Scanner Engine Error',
        explanation: 'An unexpected error occurred while parsing the token.',
        rawCode,
        timestamp: new Date().toISOString(),
      };
      playScanFeedback('error', soundEnabled);
      setScanResult(fallbackResult);
      setIsModalOpen(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismissModal = () => {
    setIsModalOpen(false);
    setScanResult(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back to Dashboard and Title */}
        <div className="flex items-center gap-3">
          <Link to={APP_ROUTES.DASHBOARD}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Dashboard
            </Button>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                <span>QR Attendance Scanner</span>
              </h1>
              <Badge variant="telemetry" withDot pulseDot className="text-[10px]">
                {scanMode.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hold participant QR code within viewfinder. Gate operator: <span className="text-slate-200 font-medium">{organizer?.name || 'Authorized Crew'}</span>
            </p>
          </div>
        </div>

        {/* Action Mode Toggle & Audio Controls */}
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-lg bg-[#081023] border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Disable Audio Beeps' : 'Enable Audio Beeps'}
            aria-label="Toggle Audio Beeps"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Mode Switch: Check-In vs Check-Out */}
          <Tabs
            tabs={[
              { id: 'check-in', label: 'Check-In', icon: <LogIn className="w-3.5 h-3.5" /> },
              { id: 'check-out', label: 'Check-Out', icon: <LogOut className="w-3.5 h-3.5" /> },
            ]}
            activeTab={scanMode}
            onChange={(tab) => setScanMode(tab as AttendanceAction)}
          />
        </div>
      </div>

      {/* Main Camera Viewfinder */}
      <CameraViewfinder
        onCodeDetected={handleProcessCode}
        isProcessing={isProcessing}
        soundEnabled={soundEnabled}
      />

      {/* Manual Code Input Fallback & Test Vectors */}
      <ManualCodeInput
        onSubmitCode={handleProcessCode}
        isProcessing={isProcessing}
      />

      {/* Result Modal Dialog */}
      <ScanResultModal
        result={scanResult}
        isOpen={isModalOpen}
        onDismiss={handleDismissModal}
      />
    </div>
  );
};
