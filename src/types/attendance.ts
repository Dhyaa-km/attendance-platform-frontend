import type { Participant } from './participant.ts';

export type AttendanceAction = 'check-in' | 'check-out';
export type AttendanceRecordResult = 'success' | 'already_processed' | 'invalid_code' | 'error';

export interface AttendanceRecord {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantRole?: string;
  qrCode: string;
  action: AttendanceAction;
  timestamp: string;
  result: AttendanceRecordResult;
  scannedByOrganizerId: string;
  scannedByOrganizerName: string;
  terminalId?: string;
  notes?: string;
}

export type VerificationStatus = 'success' | 'already_processed' | 'invalid_code' | 'error';

export interface ScanVerificationResult {
  status: VerificationStatus;
  action: AttendanceAction;
  message: string;
  explanation?: string;
  participant?: Participant;
  timestamp: string;
  rawCode: string;
  organizerName?: string;
  terminalId?: string;
}

export type CameraPermissionStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'no_camera'
  | 'error'
  | 'stopped';

export interface CameraDevice {
  id: string;
  label: string;
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
