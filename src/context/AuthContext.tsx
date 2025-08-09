
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
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, onSnapshot, deleteDoc, Unsubscribe } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase'; 

const db = getFirestore(app);
const auth = getAuth(app);

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  roles: Role[];
  branches: Branch[];
  permissions: readonly Permission[];
  updateUser: (userId: number, data: Partial<User>) => Promise<void>;
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
    setIsInitializing(true);
    let unsubscribers: Unsubscribe[] = [];

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        unsubscribers.forEach(unsub => unsub());
        unsubscribers = [];

        if (firebaseUser) {
            const unsubRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
                const rolesData = snapshot.docs.map(doc => doc.data() as Role);
                setRoles(rolesData);
            });
            unsubscribers.push(unsubRoles);

            const unsubBranches = onSnapshot(collection(db, "branches"), (snapshot) => {
                const branchesData = snapshot.docs.map(doc => doc.data() as Branch);
                setBranches(branchesData);
            });
            unsubscribers.push(unsubBranches);

            const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
                const usersData = snapshot.docs.map(doc => doc.data() as User);
                setUsers(usersData);
                const userProfile = usersData.find(u => u.email === firebaseUser.email);
                setUser(userProfile || null);
            });
            unsubscribers.push(unsubUsers);
            
        } else {
            setUser(null);
            setUsers([]);
            setRoles([]);
            setBranches([]);
        }
        setIsInitializing(false);
    });

    return () => {
        unsubscribeAuth();
        unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        router.push('/');
    } catch (error) {
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
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        
        // After creating the auth user, check if a profile already exists in Firestore.
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          // If a seeded user exists, just link the auth account to it by ensuring the name is up-to-date.
          // In a real-world scenario, you might do more here, but for this app, this is sufficient.
          await updateDoc(doc(db, 'users', String(existingUser.id)), { name: name, branchId: branchId });
        } else {
          // If it's a completely new user not in our seeded list.
          const newUserId = Date.now(); // Simple ID generation
          const newUserProfile: User = {
            id: newUserId,
            name: name,
            email: email,
            roleId: 'employee', // Default role for new sign-ups
            branchId: branchId,
            avatarUrl: '',
          };
          await setDoc(doc(db, "users", String(newUserId)), newUserProfile);
        }

        router.push('/');
    } catch (error: any) {
        console.error("Registration error:", error);
        if (error.code === 'auth/email-already-in-use') {
             toast({ variant: 'destructive', title: 'Registration Failed', description: 'This email is already registered. Please log in.' });
        } else {
             toast({ variant: 'destructive', title: 'Registration Failed', description: 'Could not create your account.' });
        }
    }
  }, [router, toast, users]);

  const logout = useCallback(async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Logout error:", error);
        toast({ variant: 'destructive', title: 'Logout Failed', description: 'There was an issue signing out.' });
    }
  }, [router, toast]);

  const updateUser = useCallback(async (userId: number, data: Partial<User>) => {
    try {
        await updateDoc(doc(db, 'users', String(userId)), data);
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
    } catch (error) {
        console.error("Error adding role:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add new role.' });
    }
  }, [toast]);

  const updateRole = useCallback(async (roleId: string, roleData: { name: string; permissions: Permission[] }) => {
    try {
        await updateDoc(doc(db, 'roles', roleId), roleData);
    } catch (error) {
        console.error("Error updating role:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update role.' });
    }
  }, [toast]);

  const deleteRole = useCallback(async (roleId: string) => {
    try {
        await deleteDoc(doc(db, 'roles', roleId));
    } catch(error) {
         console.error("Error deleting role:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete role.' });
    }
  }, [toast]);

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
