import { apiClient } from '../../../lib/axios.ts';
import type { Participant } from '../../../types/participant.ts';

export type ParticipantFilterStatus = 'all' | 'checked_in' | 'checked_out' | 'pending';
export interface ParticipantFilterParams {
  search?: string;
  status?: ParticipantFilterStatus;
}
export interface ParticipantCounts {
  all: number;
  checkedIn: number;
  checkedOut: number;
  pending: number;
}
export interface ParticipantImportResult {
  totalRows: number;
  imported: number;
  invalid: number;
  duplicates: number;
  columns: string[];
  errors: string[];
  participants: Participant[];
}
export interface ParticipantQrResult {
  data: Participant;
  qrCodeDataUrl: string;
}
export interface CreateParticipantInput {
  fullName: string;
  studentId?: string;
  email?: string;
  phone?: string;
  role: string;
}

interface ApiParticipant {
  id: string;
  fullName: string;
  studentId?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
  status: Participant['status'];
  token: string;
}

function mapParticipant(participant: ApiParticipant): Participant {
  return {
    id: participant.id,
    qrCode: participant.token,
    fullName: participant.fullName,
    studentId: participant.studentId ?? undefined,
    email: participant.email ?? '',
    phone: participant.phone ?? undefined,
    role: participant.role ?? 'participant',
    status: participant.status,
  };
}

export interface ParticipantService {
  getParticipants(filters?: ParticipantFilterParams): Promise<Participant[]>;
  getParticipantById(id: string): Promise<Participant | null>;
  getParticipantCounts(): Promise<ParticipantCounts>;
  importCsv(file: File): Promise<ParticipantImportResult>;
  getParticipantQr(id: string): Promise<ParticipantQrResult>;
  createParticipant(input: CreateParticipantInput): Promise<ParticipantQrResult>;
  updateParticipant(id: string, input: CreateParticipantInput): Promise<Participant>;
  deleteParticipant(id: string): Promise<void>;
}

/**
 * Active participant data service singleton.
 * Ready to be swapped with an API client when backend endpoints are deployed.
 */
export const participantService: ParticipantService = {
  async getParticipants(filters) {
    const response = await apiClient.get<{ data: ApiParticipant[] }>('/participants', {
      params: filters?.search ? { search: filters.search } : undefined,
    });
    const participants = response.data.data.map(mapParticipant);
    return participants.filter((participant) => {
      const matchesStatus = !filters?.status || filters.status === 'all' || participant.status === filters.status;
      return matchesStatus;
    });
  },
  async getParticipantById(id) {
    const participants = await this.getParticipants();
    return participants.find((participant) => participant.id === id) ?? null;
  },
  async getParticipantCounts() {
    const participants = await this.getParticipants();
    return {
      all: participants.length,
      checkedIn: participants.filter((participant) => participant.status === 'checked_in').length,
      checkedOut: participants.filter((participant) => participant.status === 'checked_out').length,
      pending: participants.filter((participant) => participant.status === 'pending').length,
    };
  },
  async importCsv(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ data: Omit<ParticipantImportResult, 'participants'> & { participants: ApiParticipant[] } }>(
      '/participants/import',
      formData,
    );
    return {
      ...response.data.data,
      participants: response.data.data.participants.map(mapParticipant),
    };
  },
  async getParticipantQr(id) {
    const response = await apiClient.get<{ data: ApiParticipant; qrCodeDataUrl: string }>(
      `/participants/${id}/qr`,
    );
    return {
      data: mapParticipant(response.data.data),
      qrCodeDataUrl: response.data.qrCodeDataUrl,
    };
  },
  async createParticipant(input) {
    const response = await apiClient.post<{ data: ApiParticipant; qrCodeDataUrl: string }>(
      '/participants',
      input,
    );
    return {
      data: mapParticipant(response.data.data),
      qrCodeDataUrl: response.data.qrCodeDataUrl,
    };
  },
  async updateParticipant(id, input) {
    const response = await apiClient.patch<{ data: ApiParticipant }>(`/participants/${id}`, input);
    return mapParticipant(response.data.data);
  },
  async deleteParticipant(id) {
    await apiClient.delete(`/participants/${id}`);
  },
};
