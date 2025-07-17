
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import type { Inspector } from '@/lib/inspectors';
import { initialInspectors } from '@/lib/inspectors';

const COLLECTION_NAME = 'inspectors';
const LOCAL_STORAGE_KEY = 'inspectors';

// --- Local Storage Functions ---
export const saveToLocalStorage = (items: Inspector[]) => {
    try {
        const data = JSON.stringify(items);
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch (error) {
        console.error("Error saving inspectors to localStorage", error);
    }
};

export const loadFromLocalStorage = (): Inspector[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading inspectors from localStorage", error);
        return [];
    }
};

// --- Real-time listener ---
export const streamItems = (callback: (items: Inspector[]) => void) => {
    const itemsCollection = collection(db, COLLECTION_NAME);
    return onSnapshot(itemsCollection, (snapshot) => {
        const items: Inspector[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as unknown as Inspector));
        callback(items);
    });
};

// --- CRUD Operations ---
export const addItem = async (itemData: Inspector) => {
    const itemDoc = doc(db, COLLECTION_NAME, itemData.id);
    await updateDoc(itemDoc, itemData, { merge: true });
};

export const updateItem = async (id: string, itemData: Partial<Inspector>) => {
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
        console.log("Seeding initial inspectors to Firestore...");
        const batch = writeBatch(db);
        initialInspectors.forEach((item, index) => {
            const id = `INSP-${String(index + 1).padStart(3, '0')}`;
            const docRef = doc(itemsCollection, id);
            batch.set(docRef, { ...item, id });
        });
        await batch.commit();
        console.log("Initial inspectors have been seeded.");
    }
};
