import { api } from '../lib/axios';
import { Intervention, InterventionFormData } from '../types/intervention';

export const interventionService = {
  getAll: async () => {
    const response = await api.get<Intervention[]>('/interventions');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Intervention>(`/interventions/${id}`);
    return response.data;
  },

  create: async (data: InterventionFormData) => {
    const response = await api.post<Intervention>('/interventions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<InterventionFormData>) => {
    const response = await api.patch<Intervention>(`/interventions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/interventions/${id}`);
  }
};