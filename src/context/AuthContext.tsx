
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
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
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
    
    // Set up listeners for real-time updates
    const unsubRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
        const rolesData = snapshot.docs.map(doc => doc.data() as Role);
        setRoles(rolesData.length > 0 ? rolesData : initialRoles);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => doc.data() as User);
        setUsers(usersData.length > 0 ? usersData : initialUsers);
    });

    const unsubBranches = onSnapshot(collection(db, "branches"), (snapshot) => {
        const branchesData = snapshot.docs.map(doc => doc.data() as Branch);
        setBranches(branchesData.length > 0 ? branchesData : initialBranches);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            // Find the corresponding user profile in our `users` collection
            const userProfile = (await getDocs(collection(db, "users"))).docs
                .map(doc => doc.data() as User)
                .find(u => u.email === firebaseUser.email);
            
            if (userProfile) {
                setUser(userProfile);
            } else {
                // This case might happen if a user exists in Auth but not Firestore
                setUser(null); 
            }
        } else {
            setUser(null);
        }
        setIsInitializing(false);
    });

    // Cleanup function
    return () => {
        unsubRoles();
        unsubUsers();
        unsubBranches();
        unsubscribeAuth();
    };
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // onAuthStateChanged will handle setting the user state
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
    if (users.some((u) => u.email === email)) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'A user with this email already exists.' });
      return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
        const newUser: User = { id: newId, name, email, roleId: 'staff', branchId, avatarUrl: '' };

        // We use the Firebase UID as the document ID in Firestore for security
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        // The onAuthStateChanged listener will handle setting the user state.
        router.push('/');
    } catch (error) {
        console.error("Registration error:", error);
        toast({ variant: 'destructive', title: 'Registration Failed', description: 'Could not create your account.' });
    }
  }, [users, router, toast]);

  const logout = useCallback(async () => {
    try {
        await signOut(auth);
        // onAuthStateChanged will handle setting the user state to null
        router.push('/login');
    } catch (error) {
        console.error("Logout error:", error);
        toast({ variant: 'destructive', title: 'Logout Failed', description: 'There was an issue signing out.' });
    }
  }, [router, toast]);

  const updateUser = useCallback(async (userId: number, data: Partial<User>) => {
    // Note: Finding the document by a field other than the ID is not ideal.
    // This should be refactored to use the Firebase UID as the primary key.
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    try {
        // This is a placeholder for finding the correct Firestore document.
        // A real implementation would query by 'id' field if not using UID as doc ID.
        // For now, this won't work without knowing the Firestore document ID.
        console.warn("updateUser requires a proper Firestore query to find the document to update.");
        // await updateDoc(doc(db, 'users', String(userId)), data);
    } catch(error) {
        console.error("Error updating user:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save user changes.' });
    }
  }, [users, toast]);

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
    // Implement Firestore delete logic here if needed
    console.warn("Firestore delete for roles not implemented yet.");
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
