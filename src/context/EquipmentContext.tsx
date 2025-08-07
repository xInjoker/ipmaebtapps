
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type EquipmentItem, type EquipmentDocument } from '@/lib/equipment';
import { uploadFile } from '@/lib/storage';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type EquipmentContextType = {
  equipmentList: EquipmentItem[];
  setEquipmentList: Dispatch<SetStateAction<EquipmentItem[]>>;
  isLoading: boolean;
  addEquipment: (item: Omit<EquipmentItem, 'id' | 'imageUrls' | 'documentUrls'> & { images: File[], documents: File[] }) => Promise<void>;
  updateEquipment: (id: string, item: EquipmentItem, newFiles: {newImages?: File[], newDocuments?: File[]}) => Promise<void>;
  getEquipmentById: (id: string) => EquipmentItem | undefined;
};

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
  
  const updateEquipment = useCallback(async (id: string, updatedItem: EquipmentItem, newFiles: {newImages?: File[], newDocuments?: File[]}) => {
    const newImageUrls = await Promise.all(
      (newFiles.newImages || []).map(file => uploadFile(file, `equipment/${id}/${file.name}`))
    );
    
    const newDocumentUrls: EquipmentDocument[] = await Promise.all(
        (newFiles.newDocuments || []).map(async file => ({
            name: file.name,
            url: await uploadFile(file, `equipment/${id}/docs/${file.name}`),
        }))
    );

    const finalItem = {
        ...updatedItem,
        imageUrls: [...(updatedItem.imageUrls || []), ...newImageUrls],
        documentUrls: [...(updatedItem.documentUrls || []), ...newDocumentUrls],
    };
    
    await updateDoc(doc(db, 'equipment', id), finalItem);
    setEquipmentList(prev => prev.map(item => item.id === id ? finalItem : item));
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
    getEquipmentById,
  }), [equipmentList, isLoading, addEquipment, updateEquipment, getEquipmentById]);

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
