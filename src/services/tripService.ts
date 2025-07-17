
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import type { TripRequest } from '@/lib/trips';
import { initialTrips } from '@/lib/trips';

const COLLECTION_NAME = 'trips';
const LOCAL_STORAGE_KEY = 'trips';

// --- Local Storage Functions ---
export const saveToLocalStorage = (items: TripRequest[]) => {
    try {
        const data = JSON.stringify(items);
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch (error) {
        console.error("Error saving trips to localStorage", error);
    }
};

export const loadFromLocalStorage = (): TripRequest[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading trips from localStorage", error);
        return [];
    }
};

// --- Real-time listener ---
export const streamItems = (callback: (items: TripRequest[]) => void) => {
    const itemsCollection = collection(db, COLLECTION_NAME);
    return onSnapshot(itemsCollection, (snapshot) => {
        const items: TripRequest[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as unknown as TripRequest));
        callback(items);
    });
};

// --- CRUD Operations ---
export const addItem = async (itemData: TripRequest) => {
    const itemDoc = doc(db, COLLECTION_NAME, itemData.id);
    await updateDoc(itemDoc, itemData, { merge: true });
};

export const updateItem = async (id: string, itemData: Partial<TripRequest>) => {
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
        console.log("Seeding initial trips to Firestore...");
        const batch = writeBatch(db);
        initialTrips.forEach((item, index) => {
            const id = `TRIP-${String(index + 1).padStart(3, '0')}`;
            const docRef = doc(itemsCollection, id);
            batch.set(docRef, { ...item, id });
        });
        await batch.commit();
        console.log("Initial trips have been seeded.");
    }
};
