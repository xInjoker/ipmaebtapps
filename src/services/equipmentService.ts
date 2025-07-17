
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, writeBatch, addDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import type { EquipmentItem } from '@/lib/equipment';
import { initialEquipment } from '@/lib/equipment';

const COLLECTION_NAME = 'equipment';
const LOCAL_STORAGE_KEY = 'equipment';

// --- Local Storage Functions ---
export const saveToLocalStorage = (items: EquipmentItem[]) => {
    try {
        const data = JSON.stringify(items);
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch (error) {
        console.error("Error saving equipment to localStorage", error);
    }
};

export const loadFromLocalStorage = (): EquipmentItem[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading equipment from localStorage", error);
        return [];
    }
};

// --- Real-time listener ---
export const streamItems = (callback: (items: EquipmentItem[]) => void) => {
    const itemsCollection = collection(db, COLLECTION_NAME);
    return onSnapshot(itemsCollection, (snapshot) => {
        const items: EquipmentItem[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as unknown as EquipmentItem));
        callback(items);
    });
};

// --- CRUD Operations ---
export const addItem = async (itemData: EquipmentItem) => {
    const itemDoc = doc(db, COLLECTION_NAME, itemData.id);
    await updateDoc(itemDoc, itemData, { merge: true });
};

export const updateItem = async (id: string, itemData: Partial<EquipmentItem>) => {
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
        console.log("Seeding initial equipment to Firestore...");
        const batch = writeBatch(db);
        initialEquipment.forEach((item, index) => {
            const id = `EQ-${String(index + 1).padStart(3, '0')}`;
            const docRef = doc(itemsCollection, id);
            batch.set(docRef, { ...item, id });
        });
        await batch.commit();
        console.log("Initial equipment has been seeded.");
    }
};
