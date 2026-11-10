import React, { useState, useEffect } from 'react';
import { MainScanningAction } from './components/MainScanningAction.tsx';
import { AttendanceStatCards } from './components/AttendanceStatCards.tsx';
import { EventOverviewCard } from './components/EventOverviewCard.tsx';
import { AttendanceProgress } from './components/AttendanceProgress.tsx';
import { RecentActivitySummary } from './components/RecentActivitySummary.tsx';
import { dashboardService } from './services/dashboardService.ts';
import type { DashboardStats, AttendanceRecord } from '../../types/attendance.ts';
import { Alert } from '../../components/ui/Alert.tsx';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalParticipants: 0,
    checkedInParticipants: 0,
    checkedOutParticipants: 0,
    notYetCheckedInParticipants: 0,
    attendancePercentage: 0,
    lastUpdated: new Date(0).toISOString(),
  });
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        if (isMounted) {
          setLoadError('Dashboard data could not be loaded from the backend.');
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {loadError && (
        <Alert type="warning" title="DASHBOARD REFRESH FAILED">
          {loadError}
        </Alert>
      )}

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
