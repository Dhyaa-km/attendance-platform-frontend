import React from 'react';
import { Card } from '../../../components/ui/Card.tsx';
import { Badge } from '../../../components/ui/Badge.tsx';
import { Button } from '../../../components/ui/Button.tsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table.tsx';
import type { Participant } from '../../../types/participant.ts';
import { formatTime } from '../../../utils/formatters.ts';
import {
  UserCheck,
  Clock,
  Eye,
  QrCode,
  SearchX,
  Users,
} from 'lucide-react';

interface ParticipantsTableProps {
  participants: Participant[];
  onSelectParticipant: (participant: Participant) => void;
  onShowQr: (participant: Participant) => void;
  isLoading: boolean;
  searchQuery: string;
}

export const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  onSelectParticipant,
  onShowQr,
  isLoading,
  searchQuery,
}) => {
  if (isLoading) {
    return (
      <Card hudCorner className="p-8 text-center space-y-3 bg-[#081023]/80">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="text-xs font-telemetry uppercase text-slate-400 tracking-wider block">
          QUERYING ATTENDEE ROSTER...
        </span>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card hudCorner className="p-10 text-center space-y-3 bg-[#081023]/80">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
          {searchQuery ? <SearchX className="w-6 h-6 text-amber-400" /> : <Users className="w-6 h-6 text-cyan-400" />}
        </div>
        <h4 className="text-base font-bold text-white">
          {searchQuery ? 'No Matching Attendees Found' : 'No Participants in this Category'}
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          {searchQuery
            ? `No participant records matched your search query "${searchQuery}". Please check the spelling or clear active filters.`
            : 'No attendee records exist under the selected filter criteria.'}
        </p>
      </Card>
    );
  }

  return (
    <>
      {/* 1. Desktop & Tablet Responsive Table View (Hidden on extra-small mobile screens) */}
      <div className="hidden sm:block">
        <Card hudCorner className="overflow-hidden border-slate-800/80 bg-[#081023]/90">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name & Team</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Attendance Status</TableHead>
                <TableHead>Check-In Time</TableHead>
                <TableHead>Check-Out Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => {
                const isCheckedIn = p.status === 'checked_in';
                const isCheckedOut = p.status === 'checked_out';

                return (
                  <TableRow
                    key={p.id}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    onClick={() => onSelectParticipant(p)}
                  >
                    {/* Full Name & Role */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-500/20 text-blue-300 font-telemetry font-bold text-xs flex items-center justify-center shrink-0">
                          {p.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 text-sm">
                            {p.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <span className="text-cyan-300 font-medium">
                              {p.teamName || 'Individual'}
                            </span>
                            <span>•</span>
                            <span className="uppercase text-[10px] font-telemetry text-slate-400">
                              {p.role || p.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-xs text-slate-300 font-telemetry">
                      {p.email}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {isCheckedIn && (
                        <Badge variant="success" withDot pulseDot className="text-[11px]">
                          CHECKED IN
                        </Badge>
                      )}
                      {isCheckedOut && (
                        <Badge variant="info" withDot className="text-[11px]">
                          CHECKED OUT
                        </Badge>
                      )}
                      {!isCheckedIn && !isCheckedOut && (
                        <Badge variant="warning" withDot className="text-[11px]">
                          NOT CHECKED IN
                        </Badge>
                      )}
                    </TableCell>

                    {/* Check-In Time */}
                    <TableCell>
                      {p.firstCheckInAt ? (
                        <div className="flex items-center gap-1.5 font-telemetry text-xs text-emerald-400">
                          <UserCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatTime(p.firstCheckInAt)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-telemetry">—</span>
                      )}
                    </TableCell>

                    {/* Check-Out Time */}
                    <TableCell>
                      {p.checkOutAt ? (
                        <div className="flex items-center gap-1.5 font-telemetry text-xs text-sky-300">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatTime(p.checkOutAt)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-telemetry">—</span>
                      )}
                    </TableCell>

                    {/* Action Button */}
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectParticipant(p);
                        }}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="text-slate-400 hover:text-cyan-300"
                      >
                        Details
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowQr(p);
                        }}
                        leftIcon={<QrCode className="w-3.5 h-3.5" />}
                        className="text-cyan-400 hover:text-cyan-200"
                      >
                        QR
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* 2. Mobile Responsive Card List (Optimized for handheld mobile devices) */}
      <div className="block sm:hidden space-y-3">
        {participants.map((p) => {
          const isCheckedIn = p.status === 'checked_in';
          const isCheckedOut = p.status === 'checked_out';

          return (
            <Card
              key={p.id}
              hudCorner
              className="p-4 bg-[#081023] border-slate-800 space-y-3 cursor-pointer active:bg-slate-800/50"
              onClick={() => onSelectParticipant(p)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">{p.fullName}</h4>
                  <p className="text-xs text-cyan-300 mt-0.5">{p.teamName || 'Individual'}</p>
                  <p className="text-[11px] text-slate-400 font-telemetry mt-0.5">{p.email}</p>
                </div>

                <div className="shrink-0">
                  {isCheckedIn && <Badge variant="success" withDot>CHECKED IN</Badge>}
                  {isCheckedOut && <Badge variant="info" withDot>CHECKED OUT</Badge>}
                  {!isCheckedIn && !isCheckedOut && <Badge variant="warning" withDot>NOT CHECKED IN</Badge>}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-telemetry text-slate-400">
                <div className="flex items-center gap-1 text-[11px]">
                  <span>Role:</span>
                  <span className="uppercase text-slate-200 font-semibold">{p.role || p.category}</span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectParticipant(p);
                  }}
                  leftIcon={<Eye className="w-3 h-3" />}
                >
                  View Profile
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowQr(p);
                  }}
                  leftIcon={<QrCode className="w-3 h-3" />}
                >
                  QR
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};
