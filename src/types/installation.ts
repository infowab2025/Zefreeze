export interface InstallationRequest {
  id: string;
  companyId: string;
  type: 'cold_storage' | 'vmc' | 'other';
  description: string;
  location: {
    address: string;
    additionalInfo?: string;
  };
  preferredDate: string;
  status: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
  technicianId?: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
  client?: {
    name: string;
    company: string;
  };
}

export interface TechnicianAvailability {
  id: string;
  name: string;
  email: string;
  phone: string;
  availability: {
    date: string;
    slots: string[];
  }[];
  expertise: string[];
  currentLoad: number;
}

export interface InstallationSchedule {
  id: string;
  requestId: string;
  technicianId: string;
  scheduledDate: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}