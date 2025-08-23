

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
  initialBranches,
  initialRoles,
} from '@/lib/users';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, onSnapshot, deleteDoc, Unsubscribe, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User as FirebaseUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';


const db = getFirestore(app);
const auth = getAuth(app);

// This function is now a pure helper function outside the component.
const checkUserPermission = (
  user: User | null,
  roles: Role[],
  permission: Permission
): boolean => {
  if (!user || !roles || roles.length === 0) return false;
  const userRole = roles.find((r) => r.id === user.roleId);
  if (!userRole) return false;
  if (userRole.id === 'super-admin') return true;
  return userRole.permissions.includes(permission);
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  users: User[];
  roles: Role[];
  branches: Branch[];
  permissions: readonly Permission[];
  updateUser: (uid: string, data: Partial<User>, newSignatureFile?: File | null) => Promise<void>;
  updatePassword: (currentPass: string, newPass: string) => Promise<void>;
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
    const fetchInitialData = async () => {
        try {
            const rolesSnapshot = await getDocs(collection(db, "roles"));
            const rolesData = rolesSnapshot.docs.map(doc => doc.data() as Role);
            setRoles(rolesData.length > 0 ? rolesData : initialRoles);

            const branchesSnapshot = await getDocs(collection(db, "branches"));
            const branchesData = branchesSnapshot.docs.map(doc => doc.data() as Branch);
            setBranches(branchesData.length > 0 ? branchesData : initialBranches);
        } catch (error) {
            console.error("Failed to fetch initial roles/branches:", error);
            setRoles(initialRoles);
            setBranches(initialBranches);
        }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    let userUnsub: Unsubscribe | undefined;
    let usersUnsub: Unsubscribe | undefined;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
        userUnsub?.();
        usersUnsub?.();

        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            userUnsub = onSnapshot(userDocRef, (userDoc) => {
                if (userDoc.exists()) {
                    setUser(userDoc.data() as User);
                } else {
                     signOut(auth);
                }
                // We know the auth state now, so we can stop initializing.
                setIsInitializing(false);
            }, () => {
                signOut(auth);
                setIsInitializing(false);
            });
            
            usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
                setUsers(snapshot.docs.map(d => d.data() as User));
            });

        } else {
            setUser(null);
            setUsers([]);
            setIsInitializing(false);
        }
    });

    return () => {
        authUnsub();
        userUnsub?.();
        usersUnsub?.();
    };
}, []);

  const login = useCallback(async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        router.push('/');
    } catch (error: unknown) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid email or password.',
        });
         if (error instanceof Error) {
            console.error("Login failed:", {
                error: error.message,
                email: email,
                timestamp: new Date().toISOString(),
            });
        }
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
        
        const newUserProfile: User = {
            uid: firebaseUser.uid,
            name,
            email,
            roleId: 'employee',
            branchId,
            avatarUrl: '',
            assignedProjectIds: [],
            status: 'Pending Approval',
        };

        await setDoc(doc(db, "users", firebaseUser.uid), newUserProfile);
        router.push('/');

    } catch (error: unknown) {
        let description = 'An unknown error occurred.';
        if (error instanceof Error) {
           if ('code' in error) {
                const firebaseError = error as { code: string };
                if (firebaseError.code === 'auth/email-already-in-use') {
                    description = 'This email is already registered. Please log in.';
                } else if (firebaseError.code === 'auth/weak-password') {
                    description = 'The password is too weak. Please use at least 6 characters.';
                }
           }
        }
        toast({ variant: 'destructive', title: 'Registration Failed', description });
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error: unknown) {
        toast({ variant: 'destructive', title: 'Logout Failed', description: 'There was an issue signing out.' });
    }
  }, [router, toast]);

  const updateUser = useCallback(async (uid: string, data: Partial<User>, newSignatureFile?: File | null) => {
    if (!uid) {
        console.error("updateUser called with invalid UID.");
        return;
    }

    const updateData: Partial<User> = { ...data };

    if (newSignatureFile) {
        const signatureUrl = await uploadFile(newSignatureFile, `signatures/${uid}/${newSignatureFile.name}`);
        updateData.signatureUrl = signatureUrl;
    } else if (data.signatureUrl === '') {
        updateData.signatureUrl = '';
    }

    try {
        await updateDoc(doc(db, 'users', uid), updateData);
    } catch(error) {
        console.error("Failed to update user:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save user changes.' });
    }
  }, [toast]);
  
  const updatePassword = useCallback(async (currentPass: string, newPass: string) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user is currently signed in.");
    }
    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPass);
    try {
        await reauthenticateWithCredential(firebaseUser, credential);
        await firebaseUpdatePassword(firebaseUser, newPass);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Password update failed:", {
                error: error.message,
                timestamp: new Date().toISOString(),
                userId: firebaseUser.uid,
            });
            if ('code' in error && (error as {code: string}).code === 'auth/wrong-password') {
                throw new Error("The current password you entered is incorrect.");
            }
        }
        throw new Error("Failed to update password. Please try again later.");
    }
  }, []);

  const addRole = useCallback(async (roleData: { name: string; permissions: Permission[] }) => {
    const newRoleRef = doc(collection(db, 'roles'));
    const newRole: Role = {
      id: newRoleRef.id,
      name: roleData.name,
      permissions: roleData.permissions,
      isEditable: true,
    };
    try {
        await setDoc(newRoleRef, newRole);
    } catch (error: unknown) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add new role.' });
    }
  }, [toast]);

  const updateRole = useCallback(async (roleId: string, roleData: { name: string; permissions: Permission[] }) => {
    try {
        await updateDoc(doc(db, 'roles', roleId), roleData);
    } catch (error: unknown) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update role.' });
    }
  }, [toast]);

  const deleteRole = useCallback(async (roleId: string) => {
    if (users.some(u => u.roleId === roleId)) {
      toast({ variant: 'destructive', title: 'Cannot Delete Role', description: 'This role is still assigned to one or more users.' });
      return;
    }
    try {
        await deleteDoc(doc(db, 'roles', roleId));
    } catch(error: unknown) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete role.' });
    }
  }, [toast, users]);

  const userHasPermission = useCallback(
    (permission: Permission): boolean => {
      return checkUserPermission(user, roles, permission);
    },
    [user, roles]
  );
  
  const isAuthenticated = !isInitializing && !!user;
  const isHqUser = user?.branchId === 'kantor-pusat';

  const contextValue = useMemo(() => ({
    isAuthenticated, user, users, roles, branches, permissions,
    updateUser, updatePassword, addRole, updateRole, deleteRole,
    userHasPermission, isHqUser, isInitializing, login, register, logout,
  }), [
    isAuthenticated, user, users, roles, branches, permissions,
    updateUser, updatePassword, addRole, updateRole, deleteRole, 
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
