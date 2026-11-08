import type { Participant } from './participant.ts';

export type AttendanceAction = 'check-in' | 'check-out';

export interface AttendanceRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantCategory?: string;
  qrCode: string;
  action: AttendanceAction;
  timestamp: string;
  scannedByOrganizerId: string;
  scannedByOrganizerName: string;
  terminalId?: string;
  notes?: string;
}

export type ScanStatus = 'idle' | 'scanning' | 'success' | 'already_checked_in' | 'invalid_code' | 'error';

export interface ScanResult {
  status: ScanStatus;
  message: string;
  participant?: Participant;
  timestamp: string;
  rawCode?: string;
}

export interface DashboardStats {
  totalParticipants: number;
  checkedInParticipants: number;
  checkedOutParticipants: number;
  notYetCheckedInParticipants: number;
  attendancePercentage: number;
  lastUpdated: string;
}

export interface AttendanceTelemetry {
  totalRegistered: number;
  totalCheckedIn: number;
  currentlyPresent: number;
  totalCheckedOut: number;
  attendanceRate: number;
  recentScans: AttendanceRecord[];
}
