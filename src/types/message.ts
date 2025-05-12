export interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    role: 'admin' | 'client' | 'technician';
  };
  recipient: {
    id: string;
    name: string;
    role: 'admin' | 'client' | 'technician';
  };
  subject: string;
  content: string;
  interventionId?: string;
  read: boolean;
  createdAt: string;
}

export interface MessageFormData {
  recipientId: string;
  subject: string;
  content: string;
  interventionId?: string;
}