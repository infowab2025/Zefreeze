export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'technician' | 'client';
  active: boolean;
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    address: string;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    language: string;
    timezone: string;
  };
}

export interface UserFormData {
  name: string;
  email: string;
  phone?: string;
  role: User['role'];
  password?: string;
  companyId?: string;
  preferences?: User['preferences'];
}