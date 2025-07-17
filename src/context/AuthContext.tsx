
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
import {
  initialUsers,
  initialRoles,
  type User,
  type Role,
  type Permission,
  permissions,
  type Branch,
  initialBranches,
} from '@/lib/users';
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
  updateRole: (
    roleId: string,
    roleData: { name: string; permissions: Permission[] }
  ) => void;
  deleteRole: (roleId: string) => void;
  userHasPermission: (permission: Permission) => boolean;
  isHqUser: boolean;
  isInitializing: boolean;
  login: (email: string, pass: string) => void;
  register: (name: string, email: string, pass: string, branchId: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This effect is for client-side hydration and checking session
    try {
      const storedUserString = localStorage.getItem('user');
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        // Basic validation: Check if user from storage exists in our "DB"
        if(users.some(u => u.id === storedUser.id)) {
            setUser(storedUser);
        } else {
            localStorage.removeItem('user');
        }
      }
    } catch (error) {
        console.error("Failed to load user from localStorage", error);
        localStorage.removeItem('user');
    }
    setIsInitializing(false);
  }, [users]);


  const login = (email: string, pass: string) => {
    const userToLogin = users.find((u) => u.email === email);

    if (userToLogin && pass) { // Dummy password check
      const userRoleExists = roles.some(r => r.id === userToLogin.roleId);
      if (!userRoleExists) {
        userToLogin.roleId = 'staff';
      }
      
      localStorage.setItem('user', JSON.stringify(userToLogin));
      setUser(userToLogin);
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
    }
  };

  const register = (name: string, email: string, pass: string, branchId: string) => {
     if (!branchId) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Please select an office location.',
      });
      return;
    }
    
    if (users.some((u) => u.email === email)) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'A user with this email already exists.',
      });
      return;
    }

    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
      name,
      email,
      roleId: 'staff',
      branchId: branchId,
      avatarUrl: '',
    };

    setUsers(prev => [...prev, newUser]);
    
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
    setUsers((currentUsers) =>
      currentUsers.map((u) =>
        u.id === userId ? { ...u, ...data } : u
      )
    );
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
    setRoles(prev => [...prev, newRole]);
  };

  const updateRole = (
    roleId: string,
    roleData: { name: string; permissions: Permission[] }
  ) => {
    setRoles(prev => prev.map((r) =>
      r.id === roleId ? { ...r, ...roleData } : r
    ));
  };

  const deleteRole = (roleId: string) => {
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (!roleToDelete || !roleToDelete.isEditable) {
      toast({ variant: 'destructive', title: 'Cannot delete this role.' });
      return;
    }

    const isRoleInUse = users.some((u) => u.roleId === roleId);
    if (isRoleInUse) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete role',
        description: 'This role is currently assigned to one or more users.',
      });
      return;
    }
    setRoles(prev => prev.filter((r) => r.id !== roleId));
  };

  const userHasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) {
        return false;
      }
      const userRole = roles.find((r) => r.id === user.roleId);
      if (!userRole) {
        return false;
      }
      if (userRole.id === 'super-admin') {
        return true;
      }
      return userRole.permissions.includes(permission);
    },
    [user, roles]
  );

  const isAuthenticated = !isInitializing && !!user;
  const isHqUser = user?.branchId === 'kantor-pusat';

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
        logout,
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
