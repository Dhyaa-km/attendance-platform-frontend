import type { Organizer } from '../types/auth.ts';
import type { Participant } from '../types/participant.ts';
import type { AttendanceRecord } from '../types/attendance.ts';

export const MOCK_ORGANIZERS: Organizer[] = [
  {
    id: 'org-algiers-01',
    name: 'Amina Mansouri',
    email: 'lead@spaceapps-algiers.dz',
    role: 'lead_organizer',
    callsign: 'FLIGHT-LEAD',
    badgeId: 'NASA-ALG-01',
  },
  {
    id: 'org-algiers-02',
    name: 'Karim Bouzid',
    email: 'tech@spaceapps-algiers.dz',
    role: 'technical_lead',
    callsign: 'RADAR-01',
    badgeId: 'NASA-ALG-02',
  },
  {
    id: 'org-algiers-03',
    name: 'Yasmine Hadj',
    email: 'ops@spaceapps-algiers.dz',
    role: 'scanner_operator',
    callsign: 'SCAN-DELTA',
    badgeId: 'NASA-ALG-03',
  },
];

export const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: 'part-01',
    fullName: 'Yacine Brahimi',
    email: 'yacine@algiers-spaceapps.dz',
    teamName: 'Orbital Voyagers',
    category: 'hacker',
    qrCode: 'ALG26-HCK-001',
    status: 'checked_in',
    firstCheckInAt: '2026-10-08T08:45:12Z',
  },
  {
    id: 'part-02',
    fullName: 'Sara Meziane',
    email: 'sara@algiers-spaceapps.dz',
    teamName: 'Lunar Bloom',
    category: 'hacker',
    qrCode: 'ALG26-HCK-002',
    status: 'checked_in',
    firstCheckInAt: '2026-10-08T09:02:40Z',
  },
  {
    id: 'part-03',
    fullName: 'Dr. Sofiane Hamadi',
    email: 'sofiane@mentor.dz',
    teamName: 'Astrophysics Mentorship',
    category: 'mentor',
    qrCode: 'ALG26-MTR-001',
    status: 'checked_in',
    firstCheckInAt: '2026-10-08T08:15:00Z',
  },
  {
    id: 'part-04',
    fullName: 'Amine Khelif',
    email: 'amine@algiers-spaceapps.dz',
    teamName: 'Deep Space AI',
    category: 'hacker',
    qrCode: 'ALG26-HCK-003',
    status: 'pending',
  },
  {
    id: 'part-05',
    fullName: 'Nadia Bensaada',
    email: 'nadia@space-jury.dz',
    teamName: 'Evaluation Panel',
    category: 'judge',
    qrCode: 'ALG26-JDG-001',
    status: 'pending',
  },
];

export const MOCK_ATTENDANCE_LOGS: AttendanceRecord[] = [
  {
    id: 'att-01',
    participantId: 'part-02',
    participantName: 'Sara Meziane',
    qrCode: 'ALG26-HCK-002',
    action: 'check-in',
    timestamp: '2026-10-08T09:02:40Z',
    scannedByOrganizerId: 'org-algiers-01',
    scannedByOrganizerName: 'Amina Mansouri',
    terminalId: 'GATE-01',
  },
  {
    id: 'att-02',
    participantId: 'part-01',
    participantName: 'Yacine Brahimi',
    qrCode: 'ALG26-HCK-001',
    action: 'check-in',
    timestamp: '2026-10-08T08:45:12Z',
    scannedByOrganizerId: 'org-algiers-03',
    scannedByOrganizerName: 'Yasmine Hadj',
    terminalId: 'GATE-03',
  },
  {
    id: 'att-03',
    participantId: 'part-03',
    participantName: 'Dr. Sofiane Hamadi',
    qrCode: 'ALG26-MTR-001',
    action: 'check-in',
    timestamp: '2026-10-08T08:15:00Z',
    scannedByOrganizerId: 'org-algiers-02',
    scannedByOrganizerName: 'Karim Bouzid',
    terminalId: 'GATE-02',
  },
];
