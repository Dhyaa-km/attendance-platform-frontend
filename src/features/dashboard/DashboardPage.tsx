import React, { useState, useEffect } from 'react';
import { MainScanningAction } from './components/MainScanningAction.tsx';
import { AttendanceStatCards } from './components/AttendanceStatCards.tsx';
import { EventOverviewCard } from './components/EventOverviewCard.tsx';
import { AttendanceProgress } from './components/AttendanceProgress.tsx';
import { RecentActivitySummary } from './components/RecentActivitySummary.tsx';
import { dashboardService } from './services/dashboardService.ts';
import type { DashboardStats, AttendanceRecord } from '../../types/attendance.ts';
import { MOCK_DASHBOARD_STATS, MOCK_ATTENDANCE_LOGS } from '../../mocks/mockData.ts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(MOCK_DASHBOARD_STATS);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE_LOGS.slice(0, 5));

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [loadedStats, loadedRecords] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(5),
        ]);

        if (isMounted) {
          setStats(loadedStats);
          setRecentRecords(loadedRecords);
        }
      } catch {
        // Fallback to initial mock data on error
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Main Scanning Action - Most Prominent Element */}
      <MainScanningAction />

      {/* 2. Key Attendance Statistics (Internally Consistent Metrics) */}
      <AttendanceStatCards stats={stats} />

      {/* 3. Operational Sections: Progress, Recent Check-Ins & Event Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Progress Bar & Recent Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceProgress stats={stats} />
          <RecentActivitySummary records={recentRecords} />
        </div>

        {/* Right 1 Column: Event Overview & Verified Location Information */}
        <div className="space-y-6">
          <EventOverviewCard />
        </div>
      </div>
    </div>
  );
};
