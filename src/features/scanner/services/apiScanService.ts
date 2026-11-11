import { apiClient } from "../../../lib/axios.ts";
import type { ScanService } from "./scanService.ts";
import type { ScanVerificationResult } from "../../../types/attendance.ts";
import type { Participant } from "../../../types/participant.ts";

function mapParticipant(participant: Record<string, unknown>): Participant {
  return {
    id: String(participant.id),
    fullName: String(participant.fullName ?? ""),
    email: String(participant.email ?? ""),
    phone: typeof participant.phone === "string" ? participant.phone : undefined,
    role: String(participant.role ?? "participant"),
    status: participant.status as Participant["status"],
    qrCode: String(participant.qrCode ?? participant.token ?? ""),
  };
}

function mapResult(result: ScanVerificationResult): ScanVerificationResult {
  return result.participant
    ? { ...result, participant: mapParticipant(result.participant as unknown as Record<string, unknown>) }
    : result;
}

export const apiScanService: ScanService = {
  async verifyAndProcessCode(qrCode, _mode, organizerId, organizerName) {
    try {
      const response = await apiClient.post<ScanVerificationResult>("/attendance/scan", {
        token: qrCode,
        mode: "AUTO",
        organizerId,
        organizerName,
      });
      return mapResult(response.data);
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (error as {
          response?: { data?: ScanVerificationResult };
        }).response;
        if (response?.data) return mapResult(response.data);
      }

      throw error;
    }
  },
};
