export type CheckInStatus = 'checked_in' | 'checked_out' | 'pending';

export interface Participant {
  id: string;
  qrCode: string;
  fullName: string;
  studentId?: string;
  email: string;
  phone?: string;
  teamName?: string;
  role: string;
  status: CheckInStatus;
  firstCheckInAt?: string;
  lastCheckInAt?: string;
  checkOutAt?: string;
  notes?: string;
}
