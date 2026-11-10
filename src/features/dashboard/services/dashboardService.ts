import type { DashboardStats, AttendanceRecord } from '../../../types/attendance.ts';
import { apiClient } from '../../../lib/axios.ts';

export interface DashboardService {
  getStats(): Promise<DashboardStats>;
  getRecentActivity(limit?: number): Promise<AttendanceRecord[]>;
}

interface DashboardResponse {
  stats: DashboardStats;
  recentActivity: AttendanceRecord[];
}

let dashboardData: DashboardResponse | null = null;

async function loadDashboardData(limit = 5): Promise<DashboardResponse> {
  const response = await apiClient.get<{ data: DashboardResponse }>('/dashboard', {
    params: { limit },
  });
  dashboardData = response.data.data;
  return dashboardData;
}

export const dashboardService: DashboardService = {
  async getStats() {
    const data = dashboardData ?? (await loadDashboardData());
    return data.stats;
  },
  async getRecentActivity(limit = 5) {
    const data = await loadDashboardData(limit);
    return data.recentActivity;
  },
};
