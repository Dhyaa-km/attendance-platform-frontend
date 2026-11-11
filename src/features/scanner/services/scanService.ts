import { apiScanService } from './apiScanService.ts';
import type { AttendanceAction, ScanVerificationResult } from '../../../types/attendance.ts';

export interface ScanService {
  verifyAndProcessCode(
    qrCode: string,
    mode: AttendanceAction,
    organizerId: string,
    organizerName: string,
  ): Promise<ScanVerificationResult>;
}

/**
 * Active scanner verification service backed by the local API.
 */
export const scanService: ScanService = apiScanService;
