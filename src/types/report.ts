export interface Report {
  id: string;
  interventionId: string;
  type: 'intervention' | 'haccp' | 'maintenance';
  technician: {
    id: string;
    name: string;
    signature?: string | null;
  };
  client: {
    id: string;
    name: string;
    signature?: string | null;
  };
  temperature?: {
    before?: number;
    after?: number;
  };
  photos: string[];
  notes: string;
  recommendations?: string;
  compliance?: {
    haccp: boolean;
    refrigerantLeak: boolean;
    frost: boolean;
    safetySystem?: boolean;
    cleaningProcedures?: boolean;
  };
  createdAt: string;
  signedAt?: string;
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
  pdfUrl?: string;
}

export interface ReportFormData {
  interventionId?: string;
  technicianId?: string;
  clientId?: string;
  type: Report['type'];
  temperature?: {
    before?: number;
    after?: number;
  };
  notes: string;
  recommendations?: string;
  compliance?: {
    haccp: boolean;
    refrigerantLeak: boolean;
    frost: boolean;
    safetySystem?: boolean;
    cleaningProcedures?: boolean;
  };
  photos?: File[] | string[];
  status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
  correctiveActions?: string;
  nextInspectionDate?: string;
}

export interface TemperatureLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentType: 'cold_storage' | 'vmc' | 'other';
  date: string;
  time: string;
  temperature: number;
  minThreshold: number;
  maxThreshold: number;
  isCompliant: boolean;
  notes?: string;
  technicianId: string;
  technicianName: string;
}

export interface FeasibilityReport {
  id: string;
  clientId: string;
  location: {
    address: string;
    additionalInfo?: string;
  };
  projectType: 'cold_storage' | 'vmc' | 'other';
  projectDescription: string;
  technicalConditions: {
    electricalSupply: boolean;
    waterSupply: boolean;
    spaceAvailability: boolean;
    accessConditions: boolean;
    structuralConstraints: boolean;
  };
  recommendations: string;
  estimatedCost?: number;
  estimatedDuration?: number;
  feasibilityScore: 'high' | 'medium' | 'low';
  notes?: string;
  photos?: string[];
  technicianId: string;
  createdAt: string;
}

export interface InstallationReport {
  id: string;
  interventionId?: string;
  equipmentId: string;
  installationType: 'cold_storage' | 'vmc' | 'other';
  workPerformed: string;
  partsReplaced?: string;
  temperature?: {
    before?: number;
    after: number;
  };
  notes: string;
  recommendations?: string;
  clientFeedback?: string;
  photos?: string[];
  technicianSignature: string | null;
  clientSignature: string | null;
  createdAt: string;
  signedAt?: string;
}

export interface MobileChecklist {
  interventionId: string;
  equipmentId: string;
  checksBefore: {
    visualInspection: boolean;
    temperatureCheck: boolean;
    noiseCheck: boolean;
    leakCheck: boolean;
    filterCheck: boolean;
  };
  checksAfter: {
    visualInspection: boolean;
    temperatureCheck: boolean;
    noiseCheck: boolean;
    leakCheck: boolean;
    filterCheck: boolean;
  };
  temperature: {
    before: number;
    after: number;
  };
  workPerformed: string;
  partsReplaced?: string;
  notes?: string;
  duration: number;
  photosBefore?: string[];
  photosAfter?: string[];
}