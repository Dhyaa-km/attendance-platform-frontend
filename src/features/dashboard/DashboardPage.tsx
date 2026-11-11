import React, { useState, useEffect } from 'react';
import { MainScanningAction } from './components/MainScanningAction.tsx';
import { AttendanceStatCards } from './components/AttendanceStatCards.tsx';
import { AttendanceProgress } from './components/AttendanceProgress.tsx';
import { RecentActivitySummary } from './components/RecentActivitySummary.tsx';
import { dashboardService } from './services/dashboardService.ts';
import type { DashboardStats, AttendanceRecord } from '../../types/attendance.ts';
import { Alert } from '../../components/ui/Alert.tsx';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button.tsx';
import { APP_ROUTES } from '../../utils/constants.ts';
import { UserPlus } from 'lucide-react';

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MainScanningAction />
        <Link to={APP_ROUTES.ADMIN_ORGANIZERS}>
          <Button variant="secondary" leftIcon={<UserPlus className="w-4 h-4" />}>
            Add organizer
          </Button>
        </Link>
      </div>

      {/* 2. Key Attendance Statistics (Internally Consistent Metrics) */}
      <AttendanceStatCards stats={stats} />

      <div className="space-y-6">
          <AttendanceProgress stats={stats} />
          <RecentActivitySummary records={recentRecords} />
      </div>
    </div>
  );
};
