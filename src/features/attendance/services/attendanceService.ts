import type { AttendanceService } from './mockAttendanceService.ts';
import { mockAttendanceService } from './mockAttendanceService.ts';

export type { AttendanceService, AttendanceSummary } from './mockAttendanceService.ts';

export const attendanceService: AttendanceService = mockAttendanceService;
