export interface TechnicianAvailabilityDay {
  date: string;
  available: boolean;
  slots: {
    morning: boolean;
    afternoon: boolean;
  };
}

export interface TechnicianDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'technician';
  active: boolean;
  department?: string;
  specialties?: string[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TechnicianSchedule {
  id: string;
  technicianId: string;
  date: string;
  slots: {
    morning: boolean;
    afternoon: boolean;
  };
  interventions?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    type: 'intervention' | 'installation' | 'maintenance';
    status: 'pending' | 'in_progress' | 'completed';
  }[];
}

export interface TechnicianFormData {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  active?: boolean;
  department?: string;
  specialties?: string[];
}