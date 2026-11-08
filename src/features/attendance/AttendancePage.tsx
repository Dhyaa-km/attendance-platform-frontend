import React from 'react';
import { Card } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table.tsx';
import { MOCK_ATTENDANCE_LOGS } from '../../mocks/mockData.ts';
import { formatTime } from '../../utils/formatters.ts';
import { ClipboardCheck, Download, Clock } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-400" />
              <span>Attendance History & Logs</span>
            </h1>
            <Badge variant="telemetry" withDot pulseDot>
              LIVE SYNC
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of all check-in and check-out scans performed by organizers.
          </p>
        </div>

        <Button variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
          Export CSV Log
        </Button>
      </div>

      {/* Attendance Records Table */}
      <Card hudCorner>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time (UTC+1)</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Ticket QR</TableHead>
              <TableHead>Scan Action</TableHead>
              <TableHead>Verified By Organizer</TableHead>
              <TableHead className="text-right">Terminal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ATTENDANCE_LOGS.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-telemetry text-xs text-cyan-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-slate-100">
                  {log.participantName}
                </TableCell>
                <TableCell>
                  <span className="font-telemetry text-xs px-2 py-0.5 rounded bg-[#091228] border border-blue-900/40 text-slate-300">
                    {log.qrCode}
                  </span>
                </TableCell>
                <TableCell>
                  {log.action === 'check-in' ? (
                    <Badge variant="success" withDot>
                      CHECK-IN
                    </Badge>
                  ) : (
                    <Badge variant="warning" withDot>
                      CHECK-OUT
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-xs text-slate-200">{log.scannedByOrganizerName}</div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-telemetry text-xs text-slate-400">
                    {log.terminalId || 'DEFAULT'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
