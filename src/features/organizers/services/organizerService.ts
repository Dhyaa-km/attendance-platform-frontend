import { apiClient } from '../../../lib/axios.ts';

export interface ManagedOrganizer {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface OrganizerInput {
  name: string;
  email: string;
  password: string;
}

export const organizerService = {
  async list(): Promise<ManagedOrganizer[]> {
    const response = await apiClient.get<{ data: ManagedOrganizer[] }>('/v1/organizers');
    return response.data.data;
  },
  async create(input: OrganizerInput): Promise<void> {
    await apiClient.post('/v1/organizers', input);
  },
  async update(id: string, input: { name: string; email: string; isActive: boolean }): Promise<void> {
    await apiClient.patch(`/v1/organizers/${id}`, input);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/v1/organizers/${id}`);
  },
};
