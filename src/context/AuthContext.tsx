import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { mockService } from '@/services/mockService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { full_name: string; email: string; phone: string; professional_registration: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'rescue-link-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const userId = JSON.parse(stored).userId;
        const found = mockService.getUserById(userId);
        if (found) setUser(found);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    const found = await mockService.login(email, _password);
    if (!found) {
      return { success: false, error: 'Invalid email or password. Please check your credentials.' };
    }
    if (found.status === 'pending') {
      return { success: false, error: 'pending' };
    }
    if (found.status === 'rejected') {
      return { success: false, error: 'Your application has been rejected. Contact support for assistance.' };
    }
    if (found.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Contact your administrator.' };
    }
    setUser(found);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: found.id }));
    return { success: true };
  };

  const register = async (data: { full_name: string; email: string; phone: string; professional_registration: string }) => {
    const existing = mockService.getUsers().find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    await mockService.registerParamedic(data);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'super_admin': return '/admin/dashboard';
    case 'health_partner': return '/hospital/dashboard';
    case 'paramedic': return '/dispatch/dashboard';
    default: return '/login';
  }
}
