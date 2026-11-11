import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  FilterX,
  LogIn,
  LogOut,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Card, CardContent } from '../../components/ui/Card.tsx';
import { Dialog } from '../../components/ui/Dialog.tsx';
import { Input } from '../../components/ui/Input.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table.tsx';
import { attendanceService, type AttendanceSummary } from './services/attendanceService.ts';
import type { AttendanceAction, AttendanceRecord } from '../../types/attendance.ts';

type ActionFilter = 'all' | AttendanceAction;
type SortOrder = 'newest' | 'oldest' | 'participant';

const PAGE_SIZE = 8;
const EVENT_TIME_ZONE = 'Africa/Algiers';

function formatAttendanceDate(timestamp: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(timestamp));
}

function formatAttendanceTime(timestamp: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(timestamp));
}

function formatCalendarDate(timestamp: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: EVENT_TIME_ZONE,
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function escapeCsv(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

const EMPTY_SUMMARY: AttendanceSummary = {
  totalCheckIns: 0,
  totalCheckOuts: 0,
  currentlyCheckedIn: 0,
  activityCount: 0,
  latestActivityAt: null,
};

interface AttendanceRecordDetailsProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

const AttendanceRecordDetails: React.FC<AttendanceRecordDetailsProps> = ({
  record,
  onClose,
}) => (
  <Dialog
    isOpen={record !== null}
    onClose={onClose}
    title="Attendance record details"
    description="Individual event record from the Algiers operations log."
    maxWidth="md"
    hudCorner
  >
    {record && (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#081023] p-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              record.action === 'check-in'
                ? 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                : 'border-sky-500/30 bg-sky-950/40 text-sky-300'
            }`}
          >
            {record.action === 'check-in' ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-white">{record.participantName}</h4>
              <Badge variant={record.action === 'check-in' ? 'success' : 'info'} withDot>
                {record.action === 'check-in' ? 'CHECK-IN' : 'CHECK-OUT'}
              </Badge>
            </div>
            <p className="mt-1 break-all text-xs text-slate-400">{record.participantEmail}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-[#070e20] p-3">
            <dt className="text-[10px] font-telemetry uppercase text-slate-400">Participant ID</dt>
            <dd className="mt-1 break-all text-xs text-slate-200">{record.participantId}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#070e20] p-3">
            <dt className="text-[10px] font-telemetry uppercase text-slate-400">Category / Badge</dt>
            <dd className="mt-1 text-xs text-slate-200">
              {record.participantRole || 'Participant'} · {record.qrCode}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#070e20] p-3">
            <dt className="text-[10px] font-telemetry uppercase text-slate-400">Timestamp (Algiers)</dt>
            <dd className="mt-1 text-xs text-slate-200">
              {formatAttendanceDate(record.timestamp)} at {formatAttendanceTime(record.timestamp)}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#070e20] p-3">
            <dt className="text-[10px] font-telemetry uppercase text-slate-400">Organizer responsible</dt>
            <dd className="mt-1 text-xs text-slate-200">{record.scannedByOrganizerName}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-[#070e20] p-3 sm:col-span-2">
            <dt className="text-[10px] font-telemetry uppercase text-slate-400">Record result</dt>
            <dd className="mt-1">
              <Badge
                variant={record.result === 'success' ? 'success' : 'warning'}
                withDot
              >
                {record.result.replaceAll('_', ' ').toUpperCase()}
              </Badge>
            </dd>
          </div>
        </dl>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close details</Button>
        </div>
      </div>
    )}
  </Dialog>
);

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<ActionFilter>('all');
  const [organizerFilter, setOrganizerFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAttendance() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [loadedRecords, loadedSummary] = await Promise.all([
          attendanceService.getRecords(),
          attendanceService.getSummary(),
        ]);
        if (isMounted) {
          setRecords(loadedRecords);
          setSummary(loadedSummary);
        }
      } catch {
        if (isMounted) {
          setLoadError('Attendance history could not be loaded. Please try again.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAttendance();
    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  const organizers = useMemo(
    () =>
      [...new Map(records.map((record) => [
        record.scannedByOrganizerId,
        record.scannedByOrganizerName,
      ])).entries()].sort((a, b) => a[1].localeCompare(b[1])),
    [records]
  );

  const hasInvalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const matching = records.filter((record) => {
      const matchesAction = actionFilter === 'all' || record.action === actionFilter;
      const matchesSearch =
        !query ||
        record.participantName.toLocaleLowerCase().includes(query) ||
        record.participantEmail.toLocaleLowerCase().includes(query);
      const recordDate = formatCalendarDate(record.timestamp);
      const matchesFrom = !fromDate || recordDate >= fromDate;
      const matchesTo = !toDate || recordDate <= toDate;
      const matchesOrganizer =
        organizerFilter === 'all' || record.scannedByOrganizerId === organizerFilter;
      return matchesAction && matchesSearch && matchesFrom && matchesTo && matchesOrganizer;
    });

    return matching.sort((a, b) => {
      if (sortOrder === 'participant') {
        return a.participantName.localeCompare(b.participantName) ||
          Date.parse(b.timestamp) - Date.parse(a.timestamp);
      }
      const chronologicalOrder = Date.parse(a.timestamp) - Date.parse(b.timestamp);
      return sortOrder === 'newest' ? -chronologicalOrder : chronologicalOrder;
    });
  }, [records, actionFilter, searchQuery, fromDate, toDate, organizerFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pageRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActiveFilters =
    Boolean(searchQuery || fromDate || toDate) || actionFilter !== 'all' || organizerFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setOrganizerFilter('all');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const exportCsv = () => {
    const headers = [
      'Participant name',
      'Participant email',
      'Action',
      'Date (Algiers)',
      'Time (Algiers)',
      'Organizer',
      'Result',
    ];
    const rows = filteredRecords.map((record) => [
      record.participantName,
      record.participantEmail,
      record.action === 'check-in' ? 'CHECK_IN' : 'CHECK_OUT',
      formatAttendanceDate(record.timestamp),
      formatAttendanceTime(record.timestamp),
      record.scannedByOrganizerName,
      record.result.toUpperCase(),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const downloadUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'attendance-history.csv';
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    window.setTimeout(() => {
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  };

  const summaryCards = [
    {
      label: 'Total check-ins',
      value: summary.totalCheckIns,
      detail: 'Successful entry actions',
      icon: <LogIn className="h-5 w-5" />,
      color: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/30',
    },
    {
      label: 'Total check-outs',
      value: summary.totalCheckOuts,
      detail: 'Successful exit actions',
      icon: <LogOut className="h-5 w-5" />,
      color: 'text-sky-300 border-sky-500/30 bg-sky-950/30',
    },
    {
      label: 'Currently checked in',
      value: summary.currentlyCheckedIn,
      detail: 'Participants on site',
      icon: <Users className="h-5 w-5" />,
      color: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/30',
    },
    {
      label: 'Attendance activity',
      value: summary.activityCount,
      detail: summary.latestActivityAt
        ? `Latest · ${formatAttendanceDate(summary.latestActivityAt)} ${formatAttendanceTime(summary.latestActivityAt)}`
        : 'No activity recorded yet',
      icon: <Activity className="h-5 w-5" />,
      color: 'text-blue-300 border-blue-500/30 bg-blue-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/40 bg-blue-600/20 text-blue-400">
              <ClipboardCheck className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Attendance history</h1>
            <Badge variant="telemetry">{summary.activityCount} RECORDS</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Individual check-in and check-out actions recorded by event organizers.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={exportCsv}
          disabled={filteredRecords.length === 0 || isLoading}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Export filtered CSV
        </Button>
      </div>

      <section aria-label="Attendance summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label} hudCorner className="bg-[#0b1328]/90">
            <CardContent className="flex min-h-28 items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-[11px] font-telemetry uppercase tracking-wider text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-3xl font-bold font-telemetry text-white">{item.value}</p>
                <p className="mt-1 text-[11px] text-slate-400">{item.detail}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.color}`}>
                {item.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card hudCorner className="bg-[#0b1328]/90">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Search className="h-4 w-4 text-cyan-400" />
            <h2>Filter attendance records</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Input
              id="attendance-search"
              label="Participant"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Name or email"
              leftIcon={<Search className="h-4 w-4" />}
            />
            <div className="space-y-1.5">
              <label htmlFor="attendance-action" className="block text-xs font-medium text-slate-300">
                Action
              </label>
              <select
                id="attendance-action"
                value={actionFilter}
                onChange={(event) => {
                  setActionFilter(event.target.value as ActionFilter);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700/80 bg-[#080f21] px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All actions</option>
                <option value="check-in">Check-in</option>
                <option value="check-out">Check-out</option>
              </select>
            </div>
            <Input
              id="attendance-from"
              label="From date"
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<CalendarDays className="h-4 w-4" />}
            />
            <Input
              id="attendance-to"
              label="To date"
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<CalendarDays className="h-4 w-4" />}
            />
            <div className="space-y-1.5">
              <label htmlFor="attendance-organizer" className="block text-xs font-medium text-slate-300">
                Organizer
              </label>
              <select
                id="attendance-organizer"
                value={organizerFilter}
                onChange={(event) => {
                  setOrganizerFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-slate-700/80 bg-[#080f21] px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All organizers</option>
                {organizers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 border-t border-slate-800/70 pt-3 sm:flex-row sm:items-end">
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <label htmlFor="attendance-sort" className="block text-xs font-medium text-slate-300">
                  Sort by
                </label>
                <select
                  id="attendance-sort"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                  className="rounded-lg border border-slate-700/80 bg-[#080f21] px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="participant">Participant name</option>
                </select>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  leftIcon={<FilterX className="h-4 w-4" />}
                >
                  Clear filters
                </Button>
              )}
            </div>
            <p aria-live="polite" className="text-xs text-slate-400">
              Showing <span className="font-semibold text-cyan-300">{filteredRecords.length}</span> of {records.length} records
            </p>
          </div>
          {hasInvalidDateRange && (
            <p role="alert" className="text-xs text-amber-300">The start date must be on or before the end date.</p>
          )}
        </CardContent>
      </Card>

      {loadError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between">
          <span>{loadError}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoadAttempt((attempt) => attempt + 1)}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry loading
          </Button>
        </div>
      )}

      {isLoading ? (
        <Card hudCorner className="p-10 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="mt-3 text-xs font-telemetry uppercase tracking-wider text-slate-400">
            Loading attendance history…
          </p>
        </Card>
      ) : hasInvalidDateRange ? null : filteredRecords.length === 0 ? (
        <Card hudCorner className="p-10 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-500" />
          <h2 className="mt-3 font-semibold text-white">No attendance records found</h2>
          <p className="mt-1 text-xs text-slate-400">
            {hasActiveFilters ? 'Try adjusting or clearing the selected filters.' : 'Attendance actions will appear here when recorded.'}
          </p>
          {hasActiveFilters && (
            <Button className="mt-4" variant="secondary" size="sm" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </Card>
      ) : (
        <Card hudCorner className="overflow-hidden border-slate-800/80 bg-[#081023]/90">
          <div className="hidden overflow-x-auto sm:block">
            <Table className="min-w-[1050px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Participant name</TableHead>
                  <TableHead>Participant email</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time (Algiers)</TableHead>
                  <TableHead>Organizer responsible</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <p className="text-sm font-semibold text-slate-100">{record.participantName}</p>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">{record.participantEmail}</TableCell>
                    <TableCell>
                      <ActionBadge action={record.action} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-slate-300">
                      {formatAttendanceDate(record.timestamp)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-telemetry text-xs text-cyan-300">
                      <Clock3 className="mr-1.5 inline h-3.5 w-3.5 text-slate-500" />
                      {formatAttendanceTime(record.timestamp)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">{record.scannedByOrganizerName}</TableCell>
                    <TableCell><ResultBadge result={record.result} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="xs" onClick={() => setSelectedRecord(record)}>
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 p-3 sm:hidden">
            {pageRecords.map((record) => (
              <article key={record.id} className="rounded-xl border border-slate-800 bg-[#070e20] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-white">{record.participantName}</h2>
                    <p className="mt-0.5 break-all text-xs text-slate-400">{record.participantEmail}</p>
                  </div>
                  <ActionBadge action={record.action} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
                  <span>{formatAttendanceDate(record.timestamp)}</span>
                  <span className="font-telemetry text-cyan-300">{formatAttendanceTime(record.timestamp)}</span>
                  <ResultBadge result={record.result} />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-xs text-slate-400">{record.scannedByOrganizerName}</span>
                  <Button variant="ghost" size="xs" onClick={() => setSelectedRecord(record)}>
                    Inspect record
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-800/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              Page {currentPage} of {totalPages} · {PAGE_SIZE} records per page
            </p>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                rightIcon={<ChevronRight className="h-4 w-4" />}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!isLoading && summary.activityCount > 0 && (
        <p className="flex items-center gap-2 px-1 text-xs text-slate-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          {summary.activityCount} attendance operations recorded · all timestamps shown in Africa/Algiers time (UTC+1).
        </p>
      )}

      <AttendanceRecordDetails
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};

const ActionBadge: React.FC<{ action: AttendanceAction }> = ({ action }) => (
  <Badge variant={action === 'check-in' ? 'success' : 'info'} withDot className="whitespace-nowrap">
    {action === 'check-in' ? 'CHECK-IN' : 'CHECK-OUT'}
  </Badge>
);

const ResultBadge: React.FC<{ result: AttendanceRecord['result'] }> = ({ result }) => (
  <Badge variant={result === 'success' ? 'success' : 'warning'} withDot>
    {result.replaceAll('_', ' ').toUpperCase()}
  </Badge>
);
