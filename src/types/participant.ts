export type ParticipantCategory = 'hacker' | 'mentor' | 'judge' | 'organizer' | 'volunteer' | 'vip';

export type CheckInStatus = 'checked_in' | 'checked_out' | 'pending';

export interface Participant {
  id: string;
  qrCode: string;
  fullName: string;
  email: string;
  phone?: string;
  teamName?: string;
  category: ParticipantCategory;
  status: CheckInStatus;
  firstCheckInAt?: string;
  lastCheckInAt?: string;
  checkOutAt?: string;
  notes?: string;
}
