'use client';

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isInitializing: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      localStorage.removeItem('user');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = (email: string, pass: string) => {
    // Mock login logic
    if (email && pass) {
      const userData = { name: 'Project Manager', email };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      router.push('/');
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const isAuthenticated = !isInitializing && !!user;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isInitializing, login, logout }}
    >
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
