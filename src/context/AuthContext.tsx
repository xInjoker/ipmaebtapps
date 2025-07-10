
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

const DATA_VERSION = '1.5';

const loadRoles = (): Role[] => {
  const storedRolesString = localStorage.getItem('roles');
  const freshInitialRoles = initialRoles;
  const initialRoleMap = new Map(freshInitialRoles.map(r => [r.id, r]));

  let storedRoles: Role[] = [];
  if (storedRolesString) {
    try {
      storedRoles = JSON.parse(storedRolesString);
    } catch {
      storedRoles = [];
    }
  }

  const customRoles = storedRoles.filter(r => !initialRoleMap.has(r.id));
  const finalRoles = [...freshInitialRoles, ...customRoles];
  localStorage.setItem('roles', JSON.stringify(finalRoles));
  return finalRoles;
};

const loadUsers = (validRoleIds: Set<string>): User[] => {
  const storedUsersString = localStorage.getItem('users');
  let loadedUsers: User[] = initialUsers;
  if (storedUsersString) {
    try {
      loadedUsers = JSON.parse(storedUsersString);
    } catch {
      loadedUsers = initialUsers;
    }
  }

  let usersDataWasUpdated = false;
  const validatedUsers = loadedUsers.map(u => {
    if (!validRoleIds.has(u.roleId)) {
      usersDataWasUpdated = true;
      return { ...u, roleId: 'staff' };
    }
    return u;
  });

  if (usersDataWasUpdated || !storedUsersString) {
    localStorage.setItem('users', JSON.stringify(validatedUsers));
  }
  return validatedUsers;
};

const loadCurrentUser = (validatedUsers: User[]): User | null => {
  const storedUserString = localStorage.getItem('user');
  if (!storedUserString) return null;

  try {
    const userObject: User = JSON.parse(storedUserString);
    const currentUserFromValidatedList = validatedUsers.find(u => u.id === userObject.id);

    if (currentUserFromValidatedList) {
      if (JSON.stringify(userObject) !== JSON.stringify(currentUserFromValidatedList)) {
        localStorage.setItem('user', JSON.stringify(currentUserFromValidatedList));
      }
      return currentUserFromValidatedList;
    }
  } catch {
    // Corrupted user data in storage
  }

  localStorage.removeItem('user');
  return null;
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const initializeData = useCallback(() => {
    setIsInitializing(true);
    try {
      const storedVersion = localStorage.getItem('dataVersion');
      if (storedVersion !== DATA_VERSION) {
        localStorage.removeItem('user');
        localStorage.removeItem('users');
        localStorage.removeItem('roles');
        localStorage.setItem('dataVersion', DATA_VERSION);
      }
      
      const loadedRoles = loadRoles();
      setRoles(loadedRoles);
      
      const validRoleIds = new Set(loadedRoles.map(r => r.id));
      const loadedUsers = loadUsers(validRoleIds);
      setUsers(loadedUsers);

      const currentUser = loadCurrentUser(loadedUsers);
      setUser(currentUser);
      
      setBranches(initialBranches);
  
    } catch (error) {
      console.error('Failed to initialize from localStorage. Resetting to defaults.', error);
      localStorage.setItem('roles', JSON.stringify(initialRoles));
      setRoles(initialRoles);
      localStorage.setItem('users', JSON.stringify(initialUsers));
      setUsers(initialUsers);
      setBranches(initialBranches);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

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
    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, ...data } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
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

  const updateRole = (
    roleId: string,
    roleData: { name: string; permissions: Permission[] }
  ) => {
    const updatedRoles = roles.map((r) =>
      r.id === roleId ? { ...r, ...roleData } : r
    );
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
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

    const updatedRoles = roles.filter((r) => r.id !== roleId);
    setRoles(updatedRoles);
    localStorage.setItem('roles', JSON.stringify(updatedRoles));
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
