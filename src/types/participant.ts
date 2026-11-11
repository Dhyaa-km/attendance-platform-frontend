export type ParticipantCategory = 'hacker' | 'mentor' | 'judge' | 'organizer' | 'volunteer' | 'vip';

export type CheckInStatus = 'checked_in' | 'checked_out' | 'pending';

export interface Participant {
  id: string;
  qrCode: string;
  fullName: string;
  studentId?: string;
  email: string;
  phone?: string;
  teamName?: string;
  category: ParticipantCategory;
  role?: string;
  status: CheckInStatus;
  firstCheckInAt?: string;
  lastCheckInAt?: string;
  checkOutAt?: string;
  notes?: string;
}
