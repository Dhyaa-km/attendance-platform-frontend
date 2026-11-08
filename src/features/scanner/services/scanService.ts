import type { ScanService } from './mockScanService.ts';
import { mockScanService } from './mockScanService.ts';

export type { ScanService };

/**
 * Active scanner verification service.
 * In future backend deployment, replace mockScanService with real apiScanService.
 */
export const scanService: ScanService = mockScanService;
