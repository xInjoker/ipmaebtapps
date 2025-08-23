

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
  if (!user) return false;
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
    // Public collections can be fetched immediately, as rules allow it.
    const unsubBranches = onSnapshot(collection(db, "branches"), (snapshot) => {
        const branchesData = snapshot.docs.map(doc => doc.data() as Branch);
        setBranches(branchesData.length > 0 ? branchesData : initialBranches);
    }, (error) => {
        console.error("Failed to fetch branches:", error);
        setBranches(initialBranches);
    });

    const unsubRoles = onSnapshot(collection(db, "roles"), (snapshot) => {
        const rolesData = snapshot.docs.map(doc => doc.data() as Role);
        setRoles(rolesData.length > 0 ? rolesData : initialRoles);
    }, (error) => {
        console.error("Failed to fetch roles:", error);
        setRoles(initialRoles);
    });
    
    return () => {
      unsubBranches();
      unsubRoles();
    };
  }, []);

  useEffect(() => {
    let userUnsub: Unsubscribe | null = null;
    let usersUnsub: Unsubscribe | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (userUnsub) userUnsub();
        if (usersUnsub) usersUnsub();

        if (firebaseUser) {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            
            userUnsub = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data() as User;
                    setUser(userData);
                    
                    if (checkUserPermission(userData, roles, 'manage-users')) {
                         usersUnsub = onSnapshot(collection(db, "users"), (snapshot) => {
                            const usersData = snapshot.docs.map(doc => doc.data() as User);
                            setUsers(usersData);
                        }, (error) => {
                             console.error("Failed to fetch all users:", error);
                        });
                    } else {
                        setUsers([userData]); 
                    }
                    setIsInitializing(false);
                } else {
                    console.warn("User document not found in Firestore. Logging out.");
                    signOut(auth);
                    setIsInitializing(false);
                }
            }, (error) => {
                console.error("Error listening to user document:", error);
                signOut(auth);
                setIsInitializing(false);
            });
        } else {
            setUser(null);
            setUsers([]);
            setIsInitializing(false);
        }
    });

    return () => {
        unsubscribeAuth();
        if (userUnsub) userUnsub();
        if (usersUnsub) usersUnsub();
    };
  }, [roles]);

  const login = useCallback(async (email: string, pass: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        router.push('/');
    } catch (error: any) {
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

    } catch (error: any) {
        let description = 'An unknown error occurred.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already registered. Please log in.';
        } else if (error.code === 'auth/weak-password') {
            description = 'The password is too weak. Please use at least 6 characters.';
        }
        toast({ variant: 'destructive', title: 'Registration Failed', description });
    }
  }, [router, toast]);

  const logout = useCallback(async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
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
        // Handle removal of signature
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
    } catch (error: any) {
        console.error("Password update failed:", error);
        if (error.code === 'auth/wrong-password') {
            throw new Error("The current password you entered is incorrect.");
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
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not add new role.' });
    }
  }, [toast]);

  const updateRole = useCallback(async (roleId: string, roleData: { name: string; permissions: Permission[] }) => {
    try {
        await updateDoc(doc(db, 'roles', roleId), roleData);
    } catch (error) {
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
    } catch(error) {
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
    isAuthenticated, user, users, roles, branches,
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
