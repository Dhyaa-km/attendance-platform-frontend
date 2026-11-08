import type {
  ParticipantService,
  ParticipantFilterParams,
  ParticipantFilterStatus,
  ParticipantCounts,
} from './mockParticipantService.ts';
import { mockParticipantService } from './mockParticipantService.ts';

export type {
  ParticipantService,
  ParticipantFilterParams,
  ParticipantFilterStatus,
  ParticipantCounts,
};

/**
 * Active participant data service singleton.
 * Ready to be swapped with an API client when backend endpoints are deployed.
 */
export const participantService: ParticipantService = mockParticipantService;
