export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
