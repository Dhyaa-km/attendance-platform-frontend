import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Alert } from '../../components/ui/Alert.tsx';
import { StatusIndicator } from '../../components/ui/StatusIndicator.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import { Tabs } from '../../components/ui/Tabs.tsx';
import { Avatar } from '../../components/ui/Avatar.tsx';
import {
  Palette,
  QrCode,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Terminal,
} from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('primitives');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-blue-400" />
              <span>NASA Space Apps Design System</span>
            </h1>
            <Badge variant="telemetry">TOKENS v1.0</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Design tokens, color swatches, typography hierarchy, and operational UI primitives.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'primitives', label: 'UI Primitives' },
            { id: 'colors', label: 'Color Tokens' },
            { id: 'typography', label: 'Typography' },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
      </div>

      {/* View 1: UI Primitives */}
      {activeTab === 'primitives' && (
        <div className="space-y-6">
          {/* Section: Buttons */}
          <Card hudCorner>
            <CardHeader>
              <CardTitle>Button Primitives</CardTitle>
              <CardDescription>
                Space ops action triggers with carefully calibrated hover, active, focus, and loading states.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Surface</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="success" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Check-In Verified
                </Button>
                <Button variant="danger" leftIcon={<XCircle className="w-4 h-4" />}>
                  Invalid Badge
                </Button>
                <Button variant="telemetry" leftIcon={<Terminal className="w-3.5 h-3.5" />}>
                  TELEMETRY MONO
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
                <Button size="xs">Size XS</Button>
                <Button size="sm">Size SM</Button>
                <Button size="md">Size MD</Button>
                <Button size="lg">Size LG</Button>
                <Button isLoading variant="primary">
                  Processing Scan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                  leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}
                >
                  Open Operational Modal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section: Badges & Status Indicators */}
          <Card hudCorner>
            <CardHeader>
              <CardTitle>Badges & Telemetry Status Indicators</CardTitle>
              <CardDescription>
                High-contrast event status badges for participants, organizers, and scanner radar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success" withDot>
                  CHECKED IN
                </Badge>
                <Badge variant="danger" withDot>
                  REJECTED
                </Badge>
                <Badge variant="warning" withDot pulseDot>
                  PENDING ARRIVAL
                </Badge>
                <Badge variant="info">INFO ACCENT</Badge>
                <Badge variant="neutral">NEUTRAL SLATE</Badge>
                <Badge variant="outline">OUTLINE BADGE</Badge>
                <Badge variant="telemetry" withDot pulseDot>
                  LIVE RADAR
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800">
                <StatusIndicator status="online" label="MISSION CONTROL ONLINE" sublabel="ALGIERS NODE 01" />
                <StatusIndicator status="busy" label="SCANNER SENSOR BUSY" sublabel="CAMERA BUFFER 60FPS" />
                <StatusIndicator status="warning" label="OFFLINE CACHE READY" sublabel="PENDING SYNC (3)" />
                <StatusIndicator status="offline" label="CONNECTION DROPPED" sublabel="SWITCHING TO LOCAL" />
              </div>
            </CardContent>
          </Card>

          {/* Section: Inputs & Avatars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Input Primitives</CardTitle>
                <CardDescription>Precision form controls with icons and telemetry styling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Search Participant Database"
                  placeholder="Type participant name or QR code..."
                  leftIcon={<Search className="w-4 h-4" />}
                />
                <Input
                  label="QR Ticket Code (Telemetry Monospace)"
                  placeholder="ALG26-HCK-XXXX"
                  telemetry
                  defaultValue="ALG26-HCK-001"
                  leftIcon={<QrCode className="w-4 h-4" />}
                  helperText="Standard NASA Space Apps Algiers ticket format"
                />
                <Input
                  label="Invalid Code State"
                  defaultValue="UNKNOWN-BADGE"
                  error="Code not recognized in Algiers 2026 event database"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alerts & Callouts</CardTitle>
                <CardDescription>Visual feedback states for attendance and system actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert type="success" title="Check-In Confirmed">
                  Participant successfully checked in at Gate 01.
                </Alert>
                <Alert type="error" title="Invalid QR Code">
                  The scanned QR code is either corrupted or registered to another event.
                </Alert>
                <Alert type="warning" title="Already Checked In">
                  Participant checked in today at 08:45 UTC+1. Double scan detected.
                </Alert>
                <Alert type="info" title="Station Synchronized">
                  All local scans synchronized with central database.
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Section: Organizers Avatars */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer Identity & Avatars</CardTitle>
              <CardDescription>Organizer badge initials and active station status dots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <Avatar name="Amina Mansouri" callsign="FLIGHT-LEAD" size="lg" isOnline />
                  <div>
                    <div className="text-xs font-semibold text-slate-100">Amina Mansouri</div>
                    <div className="text-[11px] font-telemetry text-cyan-400">FLIGHT-LEAD • NASA-ALG-01</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar name="Karim Bouzid" callsign="TECH-LEAD" size="md" isOnline />
                  <div>
                    <div className="text-xs font-semibold text-slate-100">Karim Bouzid</div>
                    <div className="text-[11px] font-telemetry text-cyan-400">RADAR-01 • NASA-ALG-02</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar name="Yasmine Hadj" callsign="SCAN-DELTA" size="sm" isOnline />
                  <div>
                    <div className="text-xs font-semibold text-slate-100">Yasmine Hadj</div>
                    <div className="text-[11px] font-telemetry text-cyan-400">SCAN-DELTA • NASA-ALG-03</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View 2: Color Tokens */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Space Void & Surfaces</CardTitle>
              <CardDescription>Deep navy and near-black surfaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-telemetry text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#040812] border border-slate-800">
                <span>space-950 (Void Body)</span>
                <span className="text-slate-400">#040812</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#070d1e] border border-slate-800">
                <span>space-900 (Page Ground)</span>
                <span className="text-slate-400">#070d1e</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0c152e] border border-slate-800">
                <span>space-850 (Card Surface)</span>
                <span className="text-slate-400">#0c152e</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#111e3f] border border-slate-800">
                <span>space-800 (Elevated Panel)</span>
                <span className="text-slate-400">#111e3f</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Space Blue & Telemetry Accents</CardTitle>
              <CardDescription>Primary actions and HUD glowing indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-telemetry text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-600 text-white font-bold">
                <span>brand-blue (Primary)</span>
                <span>#2563EB</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-700 text-white font-bold">
                <span>brand-blue-hover</span>
                <span>#1D4ED8</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-600 text-white font-bold">
                <span>brand-cyan (Radar Accent)</span>
                <span>#06B6D4</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-sky-400 text-slate-900 font-bold">
                <span>brand-cyan-glow</span>
                <span>#38BDF8</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational Feedback</CardTitle>
              <CardDescription>Green for check-in success, red for errors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-telemetry text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-600 text-white font-bold">
                <span>status-success (Valid QR)</span>
                <span>#10B981</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                <span>status-success-surface</span>
                <span>emerald-950/60</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-600 text-white font-bold">
                <span>status-error (Invalid QR)</span>
                <span>#EF4444</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500 text-slate-950 font-bold">
                <span>status-warning (Pending)</span>
                <span>#F59E0B</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View 3: Typography */}
      {activeTab === 'typography' && (
        <Card hudCorner>
          <CardHeader>
            <CardTitle>Typography System</CardTitle>
            <CardDescription>
              Inter font for UI body and JetBrains Mono for telemetry codes, timestamps, and ticket codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-telemetry text-slate-400 uppercase">Heading 1 — 24px Bold</span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                NASA Space Apps Challenge — Algiers 2026
              </h1>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-telemetry text-slate-400 uppercase">Heading 2 — 18px SemiBold</span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Participant Check-in & Telemetry Terminal
              </h2>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-telemetry text-slate-400 uppercase">Body — 14px Regular</span>
              <p className="text-sm text-slate-300 leading-relaxed">
                The NASA Space Apps Challenge Algiers local operations team validates attendees using on-device QR scanning.
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-telemetry text-slate-400 uppercase">Telemetry Monospace — 12px Mono</span>
              <p className="font-telemetry text-xs text-cyan-300 bg-[#080f22] p-3 rounded-lg border border-slate-800">
                UTC_TIMESTAMP: 2026-10-08T09:02:40Z | QR_CODE: ALG26-HCK-002 | STATUS: VERIFIED
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Modal Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Operational Dialog Primitive"
        description="NASA Space Apps operations dialog with backdrop blur and accessible escape key handling."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            This modal primitive is built for quick confirmation actions, manual participant check-in overrides, and scanner hardware settings.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
              Dismiss
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>
              Acknowledge
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
