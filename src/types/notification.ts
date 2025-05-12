export interface Notification {
  id: string;
  type: 'maintenance' | 'alert' | 'message' | 'system' | 'installation';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: string;
  metadata?: {
    equipmentId?: string;
    interventionId?: string;
    messageId?: string;
    requestId?: string;
    technicianId?: string;
    scheduledDate?: string;
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  maintenance: boolean;
  alerts: boolean;
  messages: boolean;
  system: boolean;
}