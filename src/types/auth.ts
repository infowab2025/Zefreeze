export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'technician';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}