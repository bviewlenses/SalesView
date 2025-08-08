export type UserRole = 'admin' | 'distributor' | 'retailer' | 'sales';

export interface User {
  id: string;
  userId: string; // Login ID like admin001, dist_north_01
  password: string; // We'll hash this in real implementation
  displayName: string;
  email: string;
  role: UserRole;
  companyId: string;
  distributorId?: string;
  territoryId?: string;
  storeId?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}