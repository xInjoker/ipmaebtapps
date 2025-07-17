
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import type { Employee } from '@/lib/employees';
import { initialEmployees } from '@/lib/employees';

const COLLECTION_NAME = 'employees';
const LOCAL_STORAGE_KEY = 'employees';

// --- Local Storage Functions ---
export const saveToLocalStorage = (items: Employee[]) => {
    try {
        const data = JSON.stringify(items);
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch (error) {
        console.error("Error saving employees to localStorage", error);
    }
};

export const loadFromLocalStorage = (): Employee[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading employees from localStorage", error);
        return [];
    }
};

// --- Real-time listener ---
export const streamEmployees = (callback: (items: Employee[]) => void) => {
    const itemsCollection = collection(db, COLLECTION_NAME);
    return onSnapshot(itemsCollection, (snapshot) => {
        const items: Employee[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as unknown as Employee));
        callback(items);
    });
};

// --- CRUD Operations ---
export const addItem = async (itemData: Employee) => {
    const itemDoc = doc(db, COLLECTION_NAME, itemData.id);
    await updateDoc(itemDoc, itemData, { merge: true });
};

export const updateItem = async (id: string, itemData: Partial<Employee>) => {
    const itemDoc = doc(db, COLLECTION_NAME, id);
    await updateDoc(itemDoc, itemData);
};

export const deleteItem = async (id: string) => {
    const itemDoc = doc(db, COLLECTION_NAME, id);
    await deleteDoc(itemDoc);
};

// --- Data Seeding ---
export const seedInitialData = async () => {
    const itemsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(itemsCollection);

    if (snapshot.empty) {
        console.log("Seeding initial employees to Firestore...");
        const batch = writeBatch(db);
        initialEmployees.forEach((item, index) => {
            const id = `EMP-${String(index + 1).padStart(3, '0')}`;
            const docRef = doc(itemsCollection, id);
            batch.set(docRef, { ...item, id });
        });
        await batch.commit();
        console.log("Initial employees have been seeded.");
    }
};
