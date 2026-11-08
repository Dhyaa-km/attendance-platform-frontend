import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '../../../components/ui/Button.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Alert } from '../../../components/ui/Alert.tsx';
import type { CameraDevice, CameraPermissionStatus } from '../../../types/attendance.ts';
import {
  Camera,
  Play,
  Square,
  Flashlight,
  FlashlightOff,
  RefreshCw,
  AlertTriangle,
  Loader2,
  VideoOff,
  ShieldAlert,
} from 'lucide-react';

interface CameraViewfinderProps {
  onCodeDetected: (code: string) => void;
  isProcessing: boolean;
  soundEnabled?: boolean;
}

const CONTAINER_ID = 'nasa-qr-reader-viewport';

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCodeDetected,
  isProcessing,
}) => {
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const onCodeDetectedRef = useRef(onCodeDetected);
  const lastScannedTimeRef = useRef<number>(0);

  const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Sync ref with prop to avoid re-binding scanner callback
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  useEffect(() => {
    onCodeDetectedRef.current = onCodeDetected;
  }, [onCodeDetected]);

  // Safe stop scanner instance
  const stopScanner = useCallback(async () => {
    if (qrScannerRef.current && isRunningRef.current) {
      try {
        await qrScannerRef.current.stop();
      } catch {
        // Stop error ignored during unmount
      } finally {
        isRunningRef.current = false;
        setIsScanning(false);
        setTorchOn(false);
        setTorchAvailable(false);
      }
    }
  }, []);

  // Start scanner with active camera device
  const startScannerWithDevice = useCallback(
    async (deviceIdOrFacing: string | { facingMode: string }) => {
      setErrorMessage(null);
      setPermissionStatus('requesting');

      // Ensure previous scanner stopped before starting anew
      await stopScanner();

      try {
        if (!qrScannerRef.current) {
          qrScannerRef.current = new Html5Qrcode(CONTAINER_ID);
        }

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: edgeSize, height: edgeSize };
          },
          aspectRatio: 1.0,
        };

        const onScanSuccess = (decodedText: string) => {
          const now = Date.now();

          // 1. Prevent duplicate processing while a result is being handled or cool down active
          if (isProcessingRef.current) return;
          if (now - lastScannedTimeRef.current < 2000) return;

          lastScannedTimeRef.current = now;
          isProcessingRef.current = true;

          // Notify parent callback
          onCodeDetectedRef.current(decodedText);
        };

        const onScanFailure = () => {
          // Frame parsed without QR - normal scanning behavior
        };

        const cameraConfig = typeof deviceIdOrFacing === 'string'
          ? { deviceId: { exact: deviceIdOrFacing } }
          : deviceIdOrFacing;

        await qrScannerRef.current.start(
          cameraConfig,
          config,
          onScanSuccess,
          onScanFailure
        );

        if (!isMountedRef.current) {
          await qrScannerRef.current.stop();
          return;
        }

        isRunningRef.current = true;
        setIsScanning(true);
        setPermissionStatus('granted');

        // Check torch capability
        try {
          const capabilities = qrScannerRef.current.getRunningTrackCapabilities();
          const hasTorch = Boolean((capabilities as unknown as { torch?: boolean })?.torch);
          setTorchAvailable(hasTorch);
        } catch {
          setTorchAvailable(false);
        }
      } catch (err: unknown) {
        isRunningRef.current = false;
        if (!isMountedRef.current) return;
        setIsScanning(false);

        const errorStr = err instanceof Error ? err.message : String(err);
        const errorLower = errorStr.toLowerCase();

        if (errorLower.includes('permission') || errorLower.includes('notallowed') || errorLower.includes('denied')) {
          setPermissionStatus('denied');
          setErrorMessage('Camera access was denied. Please allow camera permissions in your browser address bar.');
        } else if (errorLower.includes('notfound') || errorLower.includes('nodevice') || errorLower.includes('requested device not found')) {
          setPermissionStatus('no_camera');
          setErrorMessage('No camera device was detected on this terminal.');
        } else {
          setPermissionStatus('error');
          setErrorMessage(`Unable to initialize camera sensor: ${errorStr}`);
        }
      }
    },
    [stopScanner]
  );

  // Initialize camera list on mount
  useEffect(() => {
    let isMounted = true;
    isMountedRef.current = true;

    async function initCameras() {
      try {
        const devices = await Html5Qrcode.getCameras();

        if (!isMounted) return;

        if (devices && devices.length > 0) {
          const formatted = devices.map((d) => ({
            id: d.id,
            label: d.label || `Camera ${d.id.slice(0, 5)}`,
          }));
          setCameras(formatted);

          // Prefer back/rear camera for mobile attendees scanning
          const backCam = formatted.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
          );
          const chosenId = backCam ? backCam.id : formatted[0].id;
          setSelectedCameraId(chosenId);

          // Start scanning with selected camera
          startScannerWithDevice(chosenId);
        } else {
          // Attempt generic facingMode environment
          startScannerWithDevice({ facingMode: 'environment' });
        }
      } catch {
        if (isMounted) {
          // Direct fallback to facingMode environment
          startScannerWithDevice({ facingMode: 'environment' });
        }
      }
    }

    initCameras();

    return () => {
      isMounted = false;
      isMountedRef.current = false;
      stopScanner();
    };
  }, [startScannerWithDevice, stopScanner]);

  // Handle camera selection change
  const handleCameraChange = async (newCameraId: string) => {
    setSelectedCameraId(newCameraId);
    await startScannerWithDevice(newCameraId);
  };

  // Toggle flashlight (torch)
  const toggleTorch = async () => {
    if (!qrScannerRef.current || !torchAvailable) return;

    try {
      const nextState = !torchOn;
      await qrScannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as unknown as MediaTrackConstraintSet],
      });
      setTorchOn(nextState);
    } catch {
      // Ignore torch error on unsupported devices
    }
  };

  // Switch between Start and Stop
  const handleToggleScanning = async () => {
    if (isScanning) {
      await stopScanner();
      setPermissionStatus('stopped');
    } else {
      if (selectedCameraId) {
        await startScannerWithDevice(selectedCameraId);
      } else {
        await startScannerWithDevice({ facingMode: 'environment' });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Operations Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#081023] border border-slate-800">
        <div className="flex items-center gap-2">
          <Badge
            variant={isScanning ? 'success' : permissionStatus === 'denied' ? 'danger' : 'neutral'}
            withDot
            pulseDot={isScanning}
            className="uppercase font-telemetry text-xs"
          >
            {isScanning ? 'SCANNER LIVE' : permissionStatus === 'stopped' ? 'STANDBY' : 'OFFLINE'}
          </Badge>

          {isProcessing && (
            <Badge variant="warning" withDot pulseDot className="font-telemetry text-xs">
              VERIFYING...
            </Badge>
          )}
        </div>

        {/* Action Controls: Flashlight, Camera Switch, Play/Stop */}
        <div className="flex items-center gap-2">
          {/* Torch Button */}
          {torchAvailable && (
            <Button
              type="button"
              variant={torchOn ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleTorch}
              leftIcon={torchOn ? <Flashlight className="w-4 h-4 text-cyan-200" /> : <FlashlightOff className="w-4 h-4" />}
              title={torchOn ? 'Disable Flashlight' : 'Enable Flashlight'}
            >
              <span className="hidden sm:inline">Torch</span>
            </Button>
          )}

          {/* Camera Selector when multiple cameras exist */}
          {cameras.length > 1 && (
            <div className="relative">
              <select
                value={selectedCameraId}
                onChange={(e) => handleCameraChange(e.target.value)}
                className="bg-[#0b1633] text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-telemetry cursor-pointer"
                aria-label="Select Camera Device"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0b1633] text-slate-200">
                    {c.label.length > 20 ? `${c.label.slice(0, 18)}...` : c.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toggle Scan Play/Stop */}
          <Button
            type="button"
            variant={isScanning ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleScanning}
            leftIcon={isScanning ? <Square className="w-3.5 h-3.5 text-red-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          >
            {isScanning ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Main Video Viewfinder Container */}
      <div className="relative aspect-square sm:aspect-[4/3] w-full max-h-[460px] mx-auto rounded-2xl bg-[#03060f] border-2 border-slate-800/90 overflow-hidden shadow-2xl flex items-center justify-center">
        {/* DOM Target Container for Html5Qrcode video element */}
        <div
          id={CONTAINER_ID}
          className="w-full h-full object-cover"
        />

        {/* Overlay Reticle HUD Frame (Shown when camera is live) */}
        {isScanning && !isProcessing && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Viewfinder Target Reticle */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-cyan-400/50 rounded-2xl hud-corner flex items-center justify-center">
              {/* Scanning Laser Beam */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-bounce" />

              <div className="text-center space-y-1">
                <Camera className="w-7 h-7 text-cyan-400/60 mx-auto" />
                <span className="text-[10px] font-telemetry tracking-widest text-cyan-400 uppercase block">
                  HOLD QR CODE INSIDE
                </span>
              </div>
            </div>

            {/* Corner Telemetry Overlay */}
            <div className="absolute top-3 left-3 font-telemetry text-[10px] text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
              FRAME: LIVE • 60 FPS
            </div>
            <div className="absolute bottom-3 right-3 font-telemetry text-[10px] text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
              ALGIERS CHECK-IN GATE
            </div>
          </div>
        )}

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <div className="text-center space-y-0.5">
              <span className="text-sm font-bold text-white uppercase tracking-wider font-telemetry block">
                PROCESSING BADGE TOKEN...
              </span>
              <span className="text-xs text-slate-400 font-telemetry">
                Verifying attendee against Algiers 2026 database
              </span>
            </div>
          </div>
        )}

        {/* Permission Denied Error State */}
        {permissionStatus === 'denied' && (
          <div className="absolute inset-0 z-20 bg-[#060c1c]/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Camera Permission Denied</h4>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Camera access was blocked by the browser. Please tap the lock or camera icon in your address bar and allow camera access for this platform.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startScannerWithDevice({ facingMode: 'environment' })}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Camera Permission
            </Button>
          </div>
        )}

        {/* No Camera / Device Error State */}
        {(permissionStatus === 'no_camera' || permissionStatus === 'error') && (
          <div className="absolute inset-0 z-20 bg-[#060c1c]/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <VideoOff className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Camera Sensor Unavailable</h4>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              {errorMessage || 'Unable to access video device. You can verify participant badges using the manual QR token input below.'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startScannerWithDevice({ facingMode: 'environment' })}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reinitialize Sensor
            </Button>
          </div>
        )}

        {/* Stopped / Standby State */}
        {permissionStatus === 'stopped' && (
          <div className="absolute inset-0 z-20 bg-[#060c1c]/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-950/60 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Scanner In Standby</h4>
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
              Camera preview is paused to conserve device battery and bandwidth.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleToggleScanning}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Resume Camera Scanner
            </Button>
          </div>
        )}
      </div>

      {/* Inline Warning for Camera Issues */}
      {errorMessage && permissionStatus !== 'denied' && permissionStatus !== 'no_camera' && (
        <Alert type="warning" title="CAMERA NOTICE" onClose={() => setErrorMessage(null)}>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Alert>
      )}
    </div>
  );
};
