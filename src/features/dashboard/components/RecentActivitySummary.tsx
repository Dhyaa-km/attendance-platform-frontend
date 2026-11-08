import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table.tsx';
import type { AttendanceRecord } from '../../../types/attendance.ts';
import { formatTime } from '../../../utils/formatters.ts';
import { APP_ROUTES } from '../../../utils/constants.ts';
import { Activity, ArrowRight, Clock } from 'lucide-react';

interface RecentActivitySummaryProps {
  records: AttendanceRecord[];
}

export const RecentActivitySummary: React.FC<RecentActivitySummaryProps> = ({ records }) => {
  return (
    <Card hudCorner className="bg-[#0b1328]/90 border-slate-800/80">
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Recent Attendance Activity
            </CardTitle>
          </div>
          <Link
            to={APP_ROUTES.ATTENDANCE}
            className="text-xs font-telemetry text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table className="border-0 rounded-none bg-transparent">
          <TableHeader>
            <TableRow>
              <TableHead>Time (UTC+1)</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Ticket QR</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="text-right">Gate / Verified By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="hover:bg-slate-800/30">
                {/* Timestamp */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5 font-telemetry text-xs text-cyan-300">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{formatTime(record.timestamp)}</span>
                  </div>
                </TableCell>

                {/* Participant name and role */}
                <TableCell className="py-3">
                  <div className="font-semibold text-slate-100 text-xs">
                    {record.participantName}
                  </div>
                  {record.participantCategory && (
                    <span className="text-[10px] uppercase font-telemetry text-slate-400">
                      {record.participantCategory}
                    </span>
                  )}
                </TableCell>

                {/* QR Code */}
                <TableCell className="py-3">
                  <span className="font-telemetry text-[11px] px-2 py-0.5 rounded bg-[#070e20] border border-blue-900/40 text-slate-300">
                    {record.qrCode}
                  </span>
                </TableCell>

                {/* Action Badge */}
                <TableCell className="py-3">
                  {record.action === 'check-in' ? (
                    <Badge variant="success" withDot className="text-[10px]">
                      CHECK-IN
                    </Badge>
                  ) : (
                    <Badge variant="info" withDot className="text-[10px]">
                      CHECK-OUT
                    </Badge>
                  )}
                </TableCell>

                {/* Verified by organizer & gate */}
                <TableCell className="py-3 text-right">
                  <div className="text-xs text-slate-300 font-medium">
                    {record.scannedByOrganizerName}
                  </div>
                  <div className="text-[10px] font-telemetry text-slate-400">
                    {record.terminalId || 'GATE-01'}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
