'use client';

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';
import { useRouter } from 'next/navigation';
import { initialUsers, type User, type UserRole } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  updateUserRole: (userId: number, newRole: UserRole) => void;
  isInitializing: boolean;
  login: (email: string, pass: string) => void;
  register: (name: string, email: string, pass: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(initialUsers);
        localStorage.setItem('users', JSON.stringify(initialUsers));
      }
    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('user');
      localStorage.removeItem('users');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = (email: string, pass: string) => {
    // Mock login logic, find user by email from the managed list
    const userToLogin = users.find(u => u.email === email);

    if (userToLogin && pass) { // In real app, you'd check password hash
      localStorage.setItem('user', JSON.stringify(userToLogin));
      setUser(userToLogin);
      router.push('/');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    }
  };
  
  const register = (name: string, email: string, pass: string) => {
    if (users.some(u => u.email === email)) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "A user with this email already exists.",
      });
      return;
    }

    const newUser: User = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        role: 'project-manager', // New users are project managers by default
        avatarUrl: `https://placehold.co/40x40.png`,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // In a real app you'd store the password hash.
    // For this mock, we just log them in after registration.
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const updateUserRole = (userId: number, newRole: UserRole) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const isAuthenticated = !isInitializing && !!user;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, users, updateUserRole, isInitializing, login, register, logout }}
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
