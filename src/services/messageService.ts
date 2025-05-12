import { api } from '../lib/axios';
import { Message, MessageFormData } from '../types/message';

export const messageService = {
  getAll: async () => {
    const response = await api.get<Message[]>('/messages');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Message>(`/messages/${id}`);
    return response.data;
  },

  create: async (data: MessageFormData) => {
    const response = await api.post<Message>('/messages', data);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch<Message>(`/messages/${id}/read`);
    return response.data;
  }
};