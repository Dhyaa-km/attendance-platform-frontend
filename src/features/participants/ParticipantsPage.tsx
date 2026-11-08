import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table.tsx';
import { MOCK_PARTICIPANTS } from '../../mocks/mockData.ts';
import { Users, Search, Upload, Filter, QrCode } from 'lucide-react';

export const ParticipantsPage: React.FC = () => {
  const [search, setSearch] = useState<string>('');

  const filtered = MOCK_PARTICIPANTS.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.qrCode.toLowerCase().includes(search.toLowerCase()) ||
      p.teamName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>Participants Roster</span>
            </h1>
            <Badge variant="telemetry">{filtered.length} TOTAL</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Participant registry imported from NASA Space Apps Challenge CSV list.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
            CSV Import
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by participant name, QR code, or team..."
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <Button variant="outline" size="md" leftIcon={<Filter className="w-4 h-4" />}>
              Filter Role
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants Table */}
      <Card hudCorner>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participant</TableHead>
              <TableHead>Role / Team</TableHead>
              <TableHead>QR Ticket Code</TableHead>
              <TableHead>Check-In Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium text-slate-100">{p.fullName}</div>
                  <div className="text-xs text-slate-400">{p.email}</div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                    {p.category}
                  </div>
                  <div className="text-xs text-slate-400">{p.teamName || '—'}</div>
                </TableCell>
                <TableCell>
                  <span className="font-telemetry text-xs px-2 py-0.5 rounded bg-[#091228] border border-blue-900/40 text-cyan-300">
                    {p.qrCode}
                  </span>
                </TableCell>
                <TableCell>
                  {p.status === 'checked_in' ? (
                    <Badge variant="success" withDot>
                      CHECKED IN
                    </Badge>
                  ) : (
                    <Badge variant="warning" withDot>
                      PENDING
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="xs" leftIcon={<QrCode className="w-3.5 h-3.5" />}>
                    View QR
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
