import { apiClient } from '../../../lib/axios.ts';
import type { AttendanceRecord } from '../../../types/attendance.ts';

export interface AttendanceSummary {
  totalCheckIns: number;
  totalCheckOuts: number;
  currentlyCheckedIn: number;
  activityCount: number;
  latestActivityAt: string | null;
}

export interface AttendanceService {
  getRecords(): Promise<AttendanceRecord[]>;
  getSummary(): Promise<AttendanceSummary>;
}

interface AttendanceResponse {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

let cachedData: AttendanceResponse | null = null;

async function loadAttendance(): Promise<AttendanceResponse> {
  const response = await apiClient.get<{ data: AttendanceResponse }>('/attendance/history');
  cachedData = response.data.data;
  return cachedData;
}

export const attendanceService: AttendanceService = {
  async getRecords() {
    const data = await loadAttendance();
    return data.records;
  },
  async getSummary() {
    const data = cachedData ?? (await loadAttendance());
    return data.summary;
  },
};
