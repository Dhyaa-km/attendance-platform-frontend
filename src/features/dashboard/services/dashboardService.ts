import type { DashboardStats, AttendanceRecord } from '../../../types/attendance.ts';
import { MOCK_DASHBOARD_STATS, MOCK_ATTENDANCE_LOGS } from '../../../mocks/mockData.ts';

export interface DashboardService {
  getStats(): Promise<DashboardStats>;
  getRecentActivity(limit?: number): Promise<AttendanceRecord[]>;
}

/**
 * Mock Dashboard Service
 * Provides typed telemetry statistics and recent check-in events.
 * Ready to be swapped with an API client when backend endpoints are deployed.
 */
class MockDashboardService implements DashboardService {
  async getStats(): Promise<DashboardStats> {
    // Return typed mock telemetry
    return Promise.resolve({ ...MOCK_DASHBOARD_STATS });
  }

  async getRecentActivity(limit = 5): Promise<AttendanceRecord[]> {
    return Promise.resolve(MOCK_ATTENDANCE_LOGS.slice(0, limit));
  }
}

export const dashboardService: DashboardService = new MockDashboardService();
