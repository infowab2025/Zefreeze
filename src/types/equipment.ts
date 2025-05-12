export interface Equipment {
  id: string;
  name: string;
  type: 'cold_storage' | 'vmc' | 'other';
  brand: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: 'operational' | 'maintenance_needed' | 'out_of_service';
  location: {
    id: string;
    name: string;
    address: string;
  };
  specifications: {
    temperature?: {
      min: number;
      max: number;
      current?: number;
    };
    power?: number;
    dimensions?: {
      width: number;
      height: number;
      depth: number;
    };
  };
  maintenanceHistory: {
    id: string;
    date: string;
    type: 'repair' | 'maintenance' | 'inspection';
    technician: {
      id: string;
      name: string;
    };
    description: string;
    cost: number;
  }[];
}

export interface EquipmentFormData {
  name: string;
  type: Equipment['type'];
  brand: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  locationId: string;
  specifications: Equipment['specifications'];
}