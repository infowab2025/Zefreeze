export interface Intervention {
  id: string;
  type: 'repair' | 'maintenance' | 'installation' | 'audit';
  category: 'cold_storage' | 'vmc' | 'haccp';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  client: {
    id: string;
    name: string;
    address: string;
  };
  technician?: {
    id: string;
    name: string;
  };
  scheduledDate?: string;
  completedDate?: string;
  description: string;
  temperature?: {
    before?: number;
    after?: number;
  };
  photos?: string[];
  report?: {
    id: string;
    url: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InterventionFormData {
  type: Intervention['type'];
  category: Intervention['category'];
  priority: Intervention['priority'];
  description: string;
  scheduledDate?: string;
  clientId: string;
  technicianId?: string;
}