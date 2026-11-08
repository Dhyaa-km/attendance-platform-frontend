import type { AttendanceAction, ScanVerificationResult } from '../../../types/attendance.ts';
import { MOCK_PARTICIPANTS, MOCK_ATTENDANCE_LOGS, MOCK_DASHBOARD_STATS } from '../../../mocks/mockData.ts';
import { formatTime } from '../../../utils/formatters.ts';

export interface ScanService {
  verifyAndProcessCode(
    qrCode: string,
    mode: AttendanceAction,
    organizerId: string,
    organizerName: string
  ): Promise<ScanVerificationResult>;
}

class MockScanService implements ScanService {
  async verifyAndProcessCode(
    rawCode: string,
    mode: AttendanceAction,
    organizerId: string,
    organizerName: string
  ): Promise<ScanVerificationResult> {
    // Simulate realistic operational verification latency (200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    const cleanCode = rawCode.trim().toUpperCase();
    const nowIso = new Date().toISOString();

    // 1. Check if participant exists with this QR code
    const participantIndex = MOCK_PARTICIPANTS.findIndex(
      (p) => p.qrCode.toUpperCase() === cleanCode
    );

    if (participantIndex === -1) {
      return {
        status: 'invalid_code',
        action: mode,
        message: 'Invalid QR Code',
        explanation: `Badge "${cleanCode}" is not registered in the NASA Space Apps Algiers 2026 database. Please check participant credential or contact Helpdesk.`,
        rawCode: cleanCode,
        timestamp: nowIso,
        organizerName,
        terminalId: 'GATE-01',
      };
    }

    const participant = MOCK_PARTICIPANTS[participantIndex];

    // 2. Check for duplicate scan / already processed state
    if (mode === 'check-in' && participant.status === 'checked_in') {
      const lastTime = participant.firstCheckInAt ? formatTime(participant.firstCheckInAt) : 'earlier today';
      return {
        status: 'already_processed',
        action: mode,
        message: 'Already Checked In',
        explanation: `${participant.fullName} was already checked in at ${lastTime}. Duplicate check-in was ignored.`,
        participant: { ...participant },
        rawCode: cleanCode,
        timestamp: nowIso,
        organizerName,
        terminalId: 'GATE-01',
      };
    }

    if (mode === 'check-out' && participant.status === 'checked_out') {
      const lastTime = participant.checkOutAt ? formatTime(participant.checkOutAt) : 'earlier';
      return {
        status: 'already_processed',
        action: mode,
        message: 'Already Checked Out',
        explanation: `${participant.fullName} was already checked out at ${lastTime}.`,
        participant: { ...participant },
        rawCode: cleanCode,
        timestamp: nowIso,
        organizerName,
        terminalId: 'GATE-01',
      };
    }

    // 3. Process valid check-in / check-out
    if (mode === 'check-in') {
      participant.status = 'checked_in';
      if (!participant.firstCheckInAt) {
        participant.firstCheckInAt = nowIso;
      }
      participant.lastCheckInAt = nowIso;

      // Update dashboard telemetry metrics
      MOCK_DASHBOARD_STATS.checkedInParticipants += 1;
      if (MOCK_DASHBOARD_STATS.notYetCheckedInParticipants > 0) {
        MOCK_DASHBOARD_STATS.notYetCheckedInParticipants -= 1;
      }
    } else {
      participant.status = 'checked_out';
      participant.checkOutAt = nowIso;

      // Update dashboard telemetry metrics
      MOCK_DASHBOARD_STATS.checkedOutParticipants += 1;
      if (MOCK_DASHBOARD_STATS.checkedInParticipants > 0) {
        MOCK_DASHBOARD_STATS.checkedInParticipants -= 1;
      }
    }

    // Calculate updated percentage
    MOCK_DASHBOARD_STATS.attendancePercentage = Number(
      (
        ((MOCK_DASHBOARD_STATS.checkedInParticipants + MOCK_DASHBOARD_STATS.checkedOutParticipants) /
          MOCK_DASHBOARD_STATS.totalParticipants) *
        100
      ).toFixed(1)
    );

    // 4. Log attendance record
    const newRecord = {
      id: `att-${Date.now()}`,
      participantId: participant.id,
      participantName: participant.fullName,
      participantCategory: participant.category,
      qrCode: cleanCode,
      action: mode,
      timestamp: nowIso,
      scannedByOrganizerId: organizerId,
      scannedByOrganizerName: organizerName,
      terminalId: 'GATE-01',
    };

    MOCK_ATTENDANCE_LOGS.unshift(newRecord);

    return {
      status: 'success',
      action: mode,
      message: mode === 'check-in' ? 'Check-In Confirmed' : 'Check-Out Confirmed',
      explanation: `${participant.fullName} (${participant.category.toUpperCase()}) was successfully verified and recorded.`,
      participant: { ...participant },
      rawCode: cleanCode,
      timestamp: nowIso,
      organizerName,
      terminalId: 'GATE-01',
    };
  }
}

export const mockScanService = new MockScanService();
