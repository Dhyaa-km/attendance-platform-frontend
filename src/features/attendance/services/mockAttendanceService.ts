import { MOCK_ATTENDANCE_LOGS, MOCK_PARTICIPANTS } from '../../../mocks/mockData.ts';
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

class MockAttendanceService implements AttendanceService {
  async getRecords(): Promise<AttendanceRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...MOCK_ATTENDANCE_LOGS].sort(
      (a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)
    );
  }

  async getSummary(): Promise<AttendanceSummary> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const records = MOCK_ATTENDANCE_LOGS;
    const successfulRecords = records.filter((record) => record.result === 'success');

    return {
      totalCheckIns: successfulRecords.filter((record) => record.action === 'check-in').length,
      totalCheckOuts: successfulRecords.filter((record) => record.action === 'check-out').length,
      currentlyCheckedIn: MOCK_PARTICIPANTS.filter(
        (participant) => participant.status === 'checked_in'
      ).length,
      activityCount: records.length,
      latestActivityAt: records.reduce<string | null>(
        (latest, record) =>
          latest === null || Date.parse(record.timestamp) > Date.parse(latest)
            ? record.timestamp
            : latest,
        null
      ),
    };
  }
}

export const mockAttendanceService = new MockAttendanceService();
