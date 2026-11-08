import type { Participant } from '../../../types/participant.ts';
import { MOCK_PARTICIPANTS } from '../../../mocks/mockData.ts';

export type ParticipantFilterStatus = 'all' | 'checked_in' | 'checked_out' | 'pending';

export interface ParticipantFilterParams {
  search?: string;
  status?: ParticipantFilterStatus;
  category?: string;
}

export interface ParticipantCounts {
  all: number;
  checkedIn: number;
  checkedOut: number;
  pending: number;
}

export interface ParticipantService {
  getParticipants(filters?: ParticipantFilterParams): Promise<Participant[]>;
  getParticipantById(id: string): Promise<Participant | null>;
  getParticipantCounts(): Promise<ParticipantCounts>;
}

class MockParticipantService implements ParticipantService {
  async getParticipants(filters?: ParticipantFilterParams): Promise<Participant[]> {
    // Simulate brief network latency (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));

    let results = [...MOCK_PARTICIPANTS];

    // Filter by attendance status
    if (filters?.status && filters.status !== 'all') {
      results = results.filter((p) => p.status === filters.status);
    }

    // Filter by category if provided
    if (filters?.category && filters.category !== 'all') {
      results = results.filter((p) => p.category.toLowerCase() === filters.category?.toLowerCase());
    }

    // Filter by search query (full name, email, or QR code)
    if (filters?.search && filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.fullName.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query) ||
          p.qrCode.toLowerCase().includes(query) ||
          (p.teamName && p.teamName.toLowerCase().includes(query))
      );
    }

    return results;
  }

  async getParticipantById(id: string): Promise<Participant | null> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const participant = MOCK_PARTICIPANTS.find((p) => p.id === id);
    return participant ? { ...participant } : null;
  }

  async getParticipantCounts(): Promise<ParticipantCounts> {
    const all = MOCK_PARTICIPANTS.length;
    const checkedIn = MOCK_PARTICIPANTS.filter((p) => p.status === 'checked_in').length;
    const checkedOut = MOCK_PARTICIPANTS.filter((p) => p.status === 'checked_out').length;
    const pending = MOCK_PARTICIPANTS.filter((p) => p.status === 'pending').length;

    return { all, checkedIn, checkedOut, pending };
  }
}

export const mockParticipantService = new MockParticipantService();
