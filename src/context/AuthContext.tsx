
'use client';

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  type User,
  type Role,
  type Permission,
  permissions,
  type Branch,
  initialUsers,
  initialRoles,
  initialBranches,
} from '@/lib/users';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Assuming you have a firebase initialization file

const db = getFirestore(app);

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
    // This effect now only checks for a logged-in user in localStorage.
    // It no longer fetches from Firestore, avoiding the race condition on an empty DB.
    setIsInitializing(true);
    try {
        const storedUserString = localStorage.getItem('user');
        if (storedUserString) {
            const storedUser = JSON.parse(storedUserString);
            // We use the initialUsers list for validation here as the DB might be empty.
            if (initialUsers.some(u => u.id === storedUser.id)) {
                setUser(storedUser);
            } else {
                localStorage.removeItem('user');
            }
        }
    } catch (error) {
        console.error("Error reading from localStorage", error);
        localStorage.removeItem('user');
    } finally {
        setIsInitializing(false);
    }
  }, []);

  const login = useCallback((email: string, pass: string) => {
    // Use the hardcoded initialUsers for login check.
    const userToLogin = initialUsers.find((u) => u.email === email);

    if (userToLogin && userToLogin.password === pass) { 
      localStorage.setItem('user', JSON.stringify(userToLogin));
      setUser(userToLogin);
      setUsers(initialUsers); // Ensure users state is populated
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
    }
  }, [router, toast]);

  const register = useCallback(async (name: string, email: string, pass: string, branchId: string) => {
     if (!branchId) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'Please select an office location.' });
      return;
    }
    // Check against the current state of users (which may be updated from DB later)
    if (users.some((u) => u.email === email)) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'A user with this email already exists.' });
      return;
    }

    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser: User = { id: newId, name, email, password: pass, roleId: 'staff', branchId, avatarUrl: '' };

    try {
        await setDoc(doc(db, 'users', String(newId)), newUser);
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        router.push('/');
    } catch (error) {
        console.error("Registration error:", error);
        toast({ variant: 'destructive', title: 'Registration Failed', description: 'Could not save user to the database.' });
    }
  }, [users, router, toast]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback(async (userId: number, data: Partial<User>) => {
    try {
        await updateDoc(doc(db, 'users', String(userId)), data);
        setUsers((currentUsers) =>
          currentUsers.map((u) => (u.id === userId ? { ...u, ...data } : u))
        );
        setUser((currentUser) => {
            if (currentUser && currentUser.id === userId) {
                const updatedCurrentUser = { ...currentUser, ...data };
                localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
                return updatedCurrentUser;
            }
            return currentUser;
        });
    } catch(error) {
        console.error("Error updating user:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save user changes.' });
    }
  }, [toast]);

  const updateUserRole = useCallback((userId: number, newRoleId: string) => {
    updateUser(userId, { roleId: newRoleId });
  }, [updateUser]);

  const addRole = useCallback(async (roleData: { name: string; permissions: Permission[] }) => {
    const newRole: Role = {
      id: `custom-role-${Date.now()}`,
      name: roleData.name,
      permissions: roleData.permissions,
      isEditable: true,
    };
    try {
        await setDoc(doc(db, 'roles', newRole.id), newRole);
        setRoles(prev => [...prev, newRole]);
    } catch (error) {
        console.error("Error adding role:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add new role.' });
    }
  }, [toast]);

  const updateRole = useCallback(async (roleId: string, roleData: { name: string; permissions: Permission[] }) => {
    try {
        await updateDoc(doc(db, 'roles', roleId), roleData);
        setRoles(prev => prev.map((r) => r.id === roleId ? { ...r, ...roleData } : r));
    } catch (error) {
        console.error("Error updating role:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update role.' });
    }
  }, [toast]);

  const deleteRole = useCallback((roleId: string) => {
    // Implement Firestore delete logic here if needed
    console.warn("Firestore delete for roles not implemented yet.");
    setRoles(prev => prev.filter((r) => r.id !== roleId));
  }, []);

  const userHasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      const userRole = roles.find((r) => r.id === user.roleId);
      if (!userRole) return false;
      if (userRole.id === 'super-admin') return true;
      return userRole.permissions.includes(permission);
    }, [user, roles]
  );

  const isAuthenticated = !isInitializing && !!user;
  const isHqUser = user?.branchId === 'kantor-pusat';

  const contextValue = useMemo(() => ({
    isAuthenticated, user, users, roles, branches, permissions,
    updateUser, updateUserRole, addRole, updateRole, deleteRole,
    userHasPermission, isHqUser, isInitializing, login, register, logout,
  }), [
    isAuthenticated, user, users, roles, branches,
    updateUser, updateUserRole, addRole, updateRole, deleteRole, 
    userHasPermission, isHqUser, isInitializing, login, register, logout
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
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
