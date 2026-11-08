import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { Tabs } from '../../components/ui/Tabs.tsx';
import { useAppStore } from '../../stores/useAppStore.ts';
import {
  QrCode,
  Camera,
  RefreshCw,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  Send,
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const { soundEnabled, toggleSound, cameraFacing, setCameraFacing } = useAppStore();
  const [scanMode, setScanMode] = useState<string>('check-in');
  const [manualCode, setManualCode] = useState<string>('');
  const [lastScanResult, setLastScanResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
    participantName?: string;
    ticketCode?: string;
  }>({
    status: 'success',
    message: 'Participant verified successfully',
    participantName: 'Sami Benali',
    ticketCode: 'ALG26-HCK-042',
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    if (manualCode.toUpperCase().startsWith('ALG26')) {
      setLastScanResult({
        status: 'success',
        message: `${scanMode === 'check-in' ? 'Check-in confirmed' : 'Check-out confirmed'}`,
        participantName: 'Meriem Zaidi',
        ticketCode: manualCode.toUpperCase(),
      });
    } else {
      setLastScanResult({
        status: 'error',
        message: 'Invalid QR Code or ticket not found in Algiers database',
        ticketCode: manualCode.toUpperCase(),
      });
    }
    setManualCode('');
  };

  const toggleCamera = () => {
    setCameraFacing(cameraFacing === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              <span>QR Scanner Terminal</span>
            </h1>
            <Badge variant="telemetry" withDot pulseDot>
              RADAR ACTIVE
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scan attendee badges for check-in / check-out. Hold QR within viewfinder.
          </p>
        </div>

        {/* Scan Mode Toggle: Check-In vs Check-Out */}
        <Tabs
          tabs={[
            { id: 'check-in', label: 'Check-In', icon: <LogIn className="w-3.5 h-3.5" /> },
            { id: 'check-out', label: 'Check-Out', icon: <LogOut className="w-3.5 h-3.5" /> },
          ]}
          activeTab={scanMode}
          onChange={(tab) => setScanMode(tab)}
        />
      </div>

      {/* Main Scanner Viewfinder Container */}
      <Card hudCorner className="border-blue-900/40 bg-[#080f22] overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Top Controls Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={scanMode === 'check-in' ? 'success' : 'warning'}>
                MODE: {scanMode.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="font-telemetry">
                CAM: {cameraFacing.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSound}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
                title={soundEnabled ? 'Mute Audio Beeps' : 'Enable Audio Beeps'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
                title="Switch Camera (Front/Rear)"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Viewfinder Area (Simulated HUD with Reticle) */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full max-h-[380px] mx-auto rounded-2xl bg-[#03060f] border-2 border-slate-800 flex items-center justify-center overflow-hidden ops-scanlines">
            {/* Viewfinder Target Reticle */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-cyan-400/40 rounded-2xl flex items-center justify-center hud-corner animate-pulse">
              <div className="absolute inset-x-0 h-0.5 bg-cyan-400/80 shadow-lg shadow-cyan-400/50 animate-bounce" />
              <div className="text-center space-y-1">
                <Camera className="w-8 h-8 text-cyan-400/60 mx-auto" />
                <span className="text-[10px] font-telemetry tracking-widest text-cyan-400/80 uppercase block">
                  ALIGN QR CODE HERE
                </span>
              </div>
            </div>

            {/* Corner Metadata Telemetry */}
            <div className="absolute top-3 left-3 font-telemetry text-[10px] text-cyan-400/70">
              FRAME: 60 FPS • SENSOR OK
            </div>
            <div className="absolute bottom-3 right-3 font-telemetry text-[10px] text-cyan-400/70">
              ALGIERS CHECK-IN NODE
            </div>
          </div>

          {/* Feedback Result Banner (Green for success, Red for errors) */}
          {lastScanResult.status === 'success' && (
            <Alert
              type="success"
              title="ATTENDANCE CONFIRMED"
              onClose={() => setLastScanResult({ status: null, message: '' })}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-1">
                <span className="font-semibold text-slate-100">
                  {lastScanResult.participantName}
                </span>
                <span className="font-telemetry text-emerald-300 text-xs">
                  CODE: {lastScanResult.ticketCode}
                </span>
              </div>
            </Alert>
          )}

          {lastScanResult.status === 'error' && (
            <Alert
              type="error"
              title="INVALID OR UNKNOWN QR CODE"
              onClose={() => setLastScanResult({ status: null, message: '' })}
            >
              <div className="mt-1">
                <p>{lastScanResult.message}</p>
                {lastScanResult.ticketCode && (
                  <span className="font-telemetry text-red-300 text-xs">
                    SCANNED: {lastScanResult.ticketCode}
                  </span>
                )}
              </div>
            </Alert>
          )}

          {/* Manual Entry Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Or enter QR ticket code manually (e.g. ALG26-HCK-042)"
                  telemetry
                  leftIcon={<QrCode className="w-4 h-4 text-slate-400" />}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                rightIcon={<Send className="w-3.5 h-3.5" />}
                className="shrink-0"
              >
                Verify Code
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
