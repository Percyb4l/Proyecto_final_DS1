/**
 * Contexto global de autenticación.
 * Restaura sesión desde localStorage y expone login/logout y flags de rol.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: object) => Promise<void>;
  register: (data: object) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isDirector: boolean;
  isProfessor: boolean;
  isClient: boolean;
  isInternal: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      authApi.me().then((r) => setUser(r.data)).catch(() => localStorage.clear()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: object) => {
    const res = await authApi.login(data);
    localStorage.setItem('access', res.data.access);
    localStorage.setItem('refresh', res.data.refresh);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const register = async (data: object) => {
    const res = await authApi.register(data);
    localStorage.setItem('access', res.data.access);
    localStorage.setItem('refresh', res.data.refresh);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = () => { localStorage.clear(); setUser(null); };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAdmin: user?.role === 'admin',
      isDirector: user?.role === 'director',
      isProfessor: user?.role === 'professor',
      isClient: user?.role === 'client',
      isInternal: ['admin', 'director', 'professor'].includes(user?.role || ''),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth requiere AuthProvider');
  return ctx;
}
