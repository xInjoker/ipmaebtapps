
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
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      // Roles
      const storedRolesString = localStorage.getItem('roles');
      let loadedRoles: Role[] = storedRolesString ? JSON.parse(storedRolesString) : initialRoles;

      // Ensure default roles exist, preserving custom roles.
      initialRoles.forEach(initialRole => {
        if (!loadedRoles.some(loadedRole => loadedRole.id === initialRole.id)) {
          loadedRoles.push(initialRole);
        }
      });
      setRoles(loadedRoles);
      localStorage.setItem('roles', JSON.stringify(loadedRoles));
      
      const validRoleIds = new Set(loadedRoles.map(r => r.id));

      // Users
      const storedUsersString = localStorage.getItem('users');
      let loadedUsers: User[] = storedUsersString ? JSON.parse(storedUsersString) : initialUsers;
      
      let usersDataWasUpdated = false;
      const validatedUsers = loadedUsers.map(u => {
        if (!validRoleIds.has(u.roleId)) {
          usersDataWasUpdated = true;
          return { ...u, roleId: 'staff' };
        }
        return u;
      });

      if (usersDataWasUpdated) {
        localStorage.setItem('users', JSON.stringify(validatedUsers));
      }
      setUsers(validatedUsers);

      // Current User
      const storedUserString = localStorage.getItem('user');
      if (storedUserString) {
        let userObject: User = JSON.parse(storedUserString);
        if (!validRoleIds.has(userObject.roleId)) {
          userObject.roleId = 'staff';
          localStorage.setItem('user', JSON.stringify(userObject));
        }
        setUser(userObject);
      }

      // Branches
      const storedBranchesString = localStorage.getItem('branches');
      if (storedBranchesString) {
          setBranches(JSON.parse(storedBranchesString));
      } else {
          setBranches(initialBranches);
          localStorage.setItem('branches', JSON.stringify(initialBranches));
      }

    } catch (error) {
      console.error('Failed to initialize from localStorage', error);
      // Reset to defaults on parsing error
      localStorage.setItem('roles', JSON.stringify(initialRoles));
      setRoles(initialRoles);
      localStorage.setItem('users', JSON.stringify(initialUsers));
      setUsers(initialUsers);
      localStorage.removeItem('user');
      setUser(null);
      localStorage.setItem('branches', JSON.stringify(initialBranches));
      setBranches(initialBranches);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = (email: string, pass: string) => {
    const allUsers = users.length > 0 ? users : initialUsers;
    const userToLogin = allUsers.find((u) => u.email === email);

    if (userToLogin && pass) {
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
