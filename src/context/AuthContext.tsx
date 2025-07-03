'use client';

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { initialUsers, initialRoles, type User, type Role, type Permission, permissions, type Branch, initialBranches } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  roles: Role[];
  branches: Branch[];
  permissions: readonly Permission[];
  updateUser: (userId: number, data: Partial<User>) => void;
  updateUserRole: (userId: number, newRoleId: string) => void;
  addRole: (roleData: { name: string; permissions: Permission[] }) => void;
  updateRole: (roleId: string, roleData: { name: string; permissions: Permission[] }) => void;
  deleteRole: (roleId: string) => void;
  userHasPermission: (permission: Permission) => boolean;
  isHqUser: boolean;
  isInitializing: boolean;
  login: (email: string, pass: string) => void;
  register: (name: string, email: string, pass: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUserString = localStorage.getItem('user');
      if (storedUserString) {
        const userObject = JSON.parse(storedUserString);
        // Check for new schema with roleId to prevent issues with stale localStorage data
        if (userObject.roleId) {
          setUser(userObject);
        } else {
          // If roleId doesn't exist, it's an old schema. Force re-login.
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(initialUsers);
        localStorage.setItem('users', JSON.stringify(initialUsers));
      }

      const storedRoles = localStorage.getItem('roles');
      if (storedRoles) {
        setRoles(JSON.parse(storedRoles));
      } else {
        setRoles(initialRoles);
        localStorage.setItem('roles', JSON.stringify(initialRoles));
      }
      
      const storedBranches = localStorage.getItem('branches');
      if (storedBranches) {
        setBranches(JSON.parse(storedBranches));
      } else {
        setBranches(initialBranches);
        localStorage.setItem('branches', JSON.stringify(initialBranches));
      }

    } catch (error) {
      console.error('Failed to parse from localStorage', error);
      localStorage.removeItem('user');
      localStorage.removeItem('users');
      localStorage.removeItem('roles');
      localStorage.removeItem('branches');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = (email: string, pass: string) => {
    const allUsers = users.length > 0 ? users : initialUsers;
    const userToLogin = allUsers.find(u => u.email === email);

    if (userToLogin && pass) { 
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
        roleId: 'project-manager',
        branchId: 'branch-1', // Default new users to branch 1
        avatarUrl: `https://placehold.co/40x40.png`,
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const updateUser = (userId: number, data: Partial<User>) => {
    const updatedUsers = users.map(u => (u.id === userId ? { ...u, ...data } : u));
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    // If the updated user is the current user, update the user state as well
    if (user && user.id === userId) {
      const updatedCurrentUser = { ...user, ...data };
      setUser(updatedCurrentUser);
      localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
    }
  };

  const updateUserRole = (userId: number, newRoleId: string) => {
    updateUser(userId, { roleId: newRoleId });
  };

  const addRole = (roleData: { name: string; permissions: Permission[] }) => {
    const newRole: Role = {
      id: `custom-role-${Date.now()}`,
      name: roleData.name,
      permissions: roleData.permissions,
      isEditable: true,
    };
    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
  };

  const updateRole = (roleId: string, roleData: { name: string; permissions: Permission[] }) => {
    const updatedRoles = roles.map(r => r.id === roleId ? { ...r, ...roleData } : r);
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
  };

  const deleteRole = (roleId: string) => {
    const roleToDelete = roles.find(r => r.id === roleId);
    if (!roleToDelete || !roleToDelete.isEditable) {
      toast({ variant: 'destructive', title: 'Cannot delete this role.' });
      return;
    }

    const isRoleInUse = users.some(u => u.roleId === roleId);
    if (isRoleInUse) {
      toast({ variant: 'destructive', title: 'Cannot delete role', description: 'This role is currently assigned to one or more users.' });
      return;
    }

    const updatedRoles = roles.filter(r => r.id !== roleId);
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
  };

  const userHasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return true;
  }, [user]);

  const isAuthenticated = !isInitializing && !!user;
  const isHqUser = user?.branchId === 'hq';

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        user, 
        users, 
        roles,
        branches,
        permissions,
        updateUser,
        updateUserRole,
        addRole,
        updateRole,
        deleteRole,
        userHasPermission,
        isHqUser,
        isInitializing, 
        login, 
        register, 
        logout 
      }}
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
