
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type EquipmentItem, type EquipmentDocument } from '@/lib/equipment';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { uploadFile, deleteFileByUrl } from '@/lib/storage';
import { useAuth } from './AuthContext';

const db = getFirestore(app);

type EquipmentContextType = {
  equipmentList: EquipmentItem[];
  setEquipmentList: Dispatch<SetStateAction<EquipmentItem[]>>;
  isLoading: boolean;
  addEquipment: (item: Omit<EquipmentItem, 'id' | 'imageUrls' | 'documentUrls'> & { images: File[], documents: File[] }) => Promise<void>;
  updateEquipment: (id: string, item: EquipmentItem, newFiles: {newImages?: File[], newDocuments?: File[]}) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  getEquipmentById: (id: string) => EquipmentItem | undefined;
};

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing || !user) {
        setIsLoading(true);
        return;
    };

    const fetchEquipment = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'equipment'));
        const data = querySnapshot.docs.map(doc => doc.data() as EquipmentItem);
        setEquipmentList(data);
      } catch (error) {
        console.error("Error fetching equipment from Firestore: ", error);
      }
      setIsLoading(false);
    };
    fetchEquipment();
  }, [user, isInitializing]);

  const addEquipment = useCallback(async (item: Omit<EquipmentItem, 'id' | 'imageUrls' | 'documentUrls'> & { images: File[], documents: File[] }) => {
    const newId = `EQ-${Date.now()}`;
    const { images, documents, ...rest } = item;

    const imageUrls = await Promise.all(
        images.map(file => uploadFile(file, `equipment/${newId}/${file.name}`))
    );

    const documentUrls: EquipmentDocument[] = await Promise.all(
        documents.map(async file => ({
            name: file.name,
            url: await uploadFile(file, `equipment/${newId}/docs/${file.name}`),
        }))
    );
    
    const newItem: EquipmentItem = { 
      ...rest, 
      id: newId,
      imageUrls,
      documentUrls,
    };
    await setDoc(doc(db, 'equipment', newId), newItem);
    setEquipmentList(prev => [...prev, newItem]);
  }, []);
  
  const updateEquipment = useCallback(async (id: string, updatedItemData: EquipmentItem, newFiles: { newImages?: File[], newDocuments?: File[] }) => {
    // 1. Upload new images and get their URLs
    const newImageUrls = await Promise.all(
      (newFiles.newImages || []).map(file => uploadFile(file, `equipment/${id}/${file.name}`))
    );
  
    // 2. Upload new documents and get their URLs and names
    const newDocumentUrls: EquipmentDocument[] = await Promise.all(
      (newFiles.newDocuments || []).map(async file => ({
        name: file.name,
        url: await uploadFile(file, `equipment/${id}/docs/${file.name}`),
      }))
    );
  
    // 3. Combine existing data from updatedItemData with new file URLs
    const finalItem: EquipmentItem = {
      ...updatedItemData,
      imageUrls: [...(updatedItemData.imageUrls || []), ...newImageUrls],
      documentUrls: [...(updatedItemData.documentUrls || []), ...newDocumentUrls],
    };
  
    // 4. Update Firestore and local state
    await updateDoc(doc(db, 'equipment', id), finalItem);
    setEquipmentList(prev => prev.map(item => item.id === id ? finalItem : item));
  }, []);

  const deleteEquipment = useCallback(async (id: string) => {
    const equipmentDocRef = doc(db, 'equipment', id);
    try {
        const docSnap = await getDoc(equipmentDocRef);
        if (docSnap.exists()) {
            const equipmentData = docSnap.data() as EquipmentItem;
            const urlsToDelete = [
                ...(equipmentData.imageUrls || []),
                ...(equipmentData.documentUrls || []).map(doc => doc.url)
            ];
            
            if (urlsToDelete.length > 0) {
                await Promise.all(urlsToDelete.map(url => deleteFileByUrl(url)));
            }
        }

        await deleteDoc(equipmentDocRef);
        setEquipmentList(prev => prev.filter(item => item.id !== id));
    } catch (error) {
        console.error("Error deleting equipment:", error);
    }
  }, []);
  
  const getEquipmentById = useCallback((id: string) => {
    return equipmentList.find(item => item.id === id);
  }, [equipmentList]);

  const contextValue = useMemo(() => ({
    equipmentList,
    setEquipmentList,
    isLoading,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    getEquipmentById,
  }), [equipmentList, isLoading, addEquipment, updateEquipment, deleteEquipment, getEquipmentById]);

  return (
    <EquipmentContext.Provider value={contextValue}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
}
