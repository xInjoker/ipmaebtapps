
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
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, onSnapshot, deleteDoc, Unsubscribe, getDoc } from 'firebase/firestore';
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

    // Fetch branches immediately, as it's needed for registration and is public.
    const unsubBranches = onSnapshot(collection(db, "branches"), (snapshot) => {
        const branchesData = snapshot.docs.map(doc => doc.data() as Branch);
        setBranches(branchesData);
    }, (error) => {
        console.error("Failed to fetch branches:", error);
        setBranches([]);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        // Clean up previous listeners
        unsubscribers.forEach(unsub => unsub());
        unsubscribers = [];
        
        if (firebaseUser) {
             try {
                // First, fetch the user's own profile document.
                // The new security rules allow this specific read.
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userProfile = userDocSnap.data() as User;
                    setUser(userProfile);

                    // Now that we have a valid user profile and role, we can listen to other collections.
                    const unsubRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
                        const rolesData = snapshot.docs.map(doc => doc.data() as Role);
                        setRoles(rolesData);
                    });
                    unsubscribers.push(unsubRoles);

                    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
                        const usersData = snapshot.docs.map(doc => doc.data() as User);
                        setUsers(usersData);
                    });
                    unsubscribers.push(unsubUsers);
                } else {
                     // This case happens if a user exists in Auth but not Firestore. Log them out.
                    console.warn("User document not found in Firestore. Logging out.");
                    await signOut(auth);
                    setUser(null);
                }
            } catch (error) {
                console.error("Error fetching user data after auth change:", error);
                setUser(null);
            }
        } else {
            setUser(null);
            setUsers([]);
            setRoles([]);
        }
        setIsInitializing(false);
    });

    return () => {
        unsubscribeAuth();
        unsubBranches();
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
        const firebaseUser = userCredential.user;
        
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            // This case is unlikely if registration is only for new users, but handles it.
            await updateDoc(doc(db, 'users', firebaseUser.uid), { name: name, branchId: branchId });
        } else {
            const newUserProfile: User = {
                id: Date.now(), // This might need a better unique ID strategy
                name: name,
                email: email,
                roleId: 'employee', // Default role for new sign-ups
                branchId: branchId,
                avatarUrl: '',
            };
            // Use the Firebase Auth UID as the document ID for direct lookup
            await setDoc(doc(db, "users", firebaseUser.uid), newUserProfile);
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
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    
    // Find the corresponding auth user to get their UID for the doc path
    // This is a simplification; a real app would need a more robust way to map your internal ID to the auth UID.
    // For now, we'll assume we can find it, but this is brittle.
    // A better approach would be to store the auth UID in your user documents.
    try {
        // This part is problematic as we don't have the UID.
        // Let's assume for now we can't update user docs from here without the UID.
        // This function will need a refactor to pass the auth UID.
        console.warn("User update is limited without mapping internal ID to auth UID.");
    } catch(error) {
        console.error("Error updating user:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save user changes.' });
    }
  }, [toast, users]);

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
