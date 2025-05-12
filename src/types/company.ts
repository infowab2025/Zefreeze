export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  stats?: {
    equipmentCount: number;
    userCount: number;
    interventionCount: number;
  };
  equipment?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    lastMaintenance: string;
  }>;
  users?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>;
  interventions?: Array<{
    id: string;
    type: string;
    status: string;
    date: string;
    technician: string;
  }>;
}