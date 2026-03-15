import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, UserType } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    username: string;
    userType: UserType;
    location?: string;
    phone?: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  refreshMe: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<User, 'name' | 'username' | 'email' | 'location' | 'phone'>>) => Promise<{ ok: boolean; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  requestPasswordReset: (identifier: string) => Promise<{ ok: boolean; message?: string; resetToken?: string | null; resetLink?: string | null }>;
  switchRole: (targetRole: UserType) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      try {
        const response = await api.me();
        setUser(response.user);
      } catch {
        localStorage.removeItem('authToken');
        setUser(null);
      }
    };

    bootstrap();
  }, []);

  const register = async (payload: {
    email: string;
    password: string;
    name: string;
    username: string;
    userType: UserType;
    location?: string;
    phone?: string;
  }): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await api.register(payload);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: (error as Error).message || 'Registration failed' };
    }
  };

  const login = async (identifier: string, password: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await api.login({ identifier, password });
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: (error as Error).message || 'Login failed' };
    }
  };

  const refreshMe = async () => {
    const response = await api.me();
    setUser(response.user);
  };

  const updateProfile = async (payload: Partial<Pick<User, 'name' | 'username' | 'email' | 'location' | 'phone'>>): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await api.updateProfile(payload);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: (error as Error).message || 'Could not update profile' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      await api.changePassword({ currentPassword, newPassword });
      return { ok: true };
    } catch (error) {
      return { ok: false, message: (error as Error).message || 'Could not change password' };
    }
  };

  const requestPasswordReset = async (identifier: string): Promise<{ ok: boolean; message?: string; resetToken?: string | null; resetLink?: string | null }> => {
    try {
      const response = await api.requestPasswordReset(identifier);
      return { ok: true, message: response.message, resetToken: response.resetToken, resetLink: response.resetLink };
    } catch (error) {
      return { ok: false, message: (error as Error).message || 'Could not submit reset request' };
    }
  };

  const switchRole = async (targetRole: UserType): Promise<{ ok: boolean; message?: string }> => {
    try {
      const response = await api.switchRole(targetRole);
      localStorage.setItem('authToken', response.token);
      setUser(response.user);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: (error as Error).message || 'Could not switch account role' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, refreshMe, updateProfile, changePassword, requestPasswordReset, switchRole, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}