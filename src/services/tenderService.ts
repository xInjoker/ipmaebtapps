
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import type { Tender } from '@/lib/tenders';
import { initialTenders } from '@/lib/tenders';

const COLLECTION_NAME = 'tenders';
const LOCAL_STORAGE_KEY = 'tenders';

// --- Local Storage Functions ---
export const saveToLocalStorage = (items: Tender[]) => {
    try {
        const data = JSON.stringify(items);
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch (error) {
        console.error("Error saving tenders to localStorage", error);
    }
};

export const loadFromLocalStorage = (): Tender[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading tenders from localStorage", error);
        return [];
    }
};

// --- Real-time listener ---
export const streamItems = (callback: (items: Tender[]) => void) => {
    const itemsCollection = collection(db, COLLECTION_NAME);
    return onSnapshot(itemsCollection, (snapshot) => {
        const items: Tender[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as unknown as Tender));
        callback(items);
    });
};

// --- CRUD Operations ---
export const addItem = async (itemData: Tender) => {
    const itemDoc = doc(db, COLLECTION_NAME, itemData.id);
    await updateDoc(itemDoc, itemData, { merge: true });
};

export const updateItem = async (id: string, itemData: Partial<Tender>) => {
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
        console.log("Seeding initial tenders to Firestore...");
        const batch = writeBatch(db);
        initialTenders.forEach((item, index) => {
            const id = `TND-${String(index + 1).padStart(3, '0')}`;
            const docRef = doc(itemsCollection, id);
            batch.set(docRef, { ...item, id });
        });
        await batch.commit();
        console.log("Initial tenders have been seeded.");
    }
};
