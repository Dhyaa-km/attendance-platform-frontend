import type { ScanService } from './mockScanService.ts';
import { apiScanService } from './apiScanService.ts';

export type { ScanService };

/**
 * Active scanner verification service backed by the local API.
 */
export const scanService: ScanService = apiScanService;
