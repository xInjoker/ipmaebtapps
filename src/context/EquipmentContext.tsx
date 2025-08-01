

'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { type EquipmentItem, type EquipmentDocument, initialEquipment } from '@/lib/equipment';
import { fileToBase64 } from '@/lib/utils';

type EquipmentContextType = {
  equipmentList: EquipmentItem[];
  setEquipmentList: Dispatch<SetStateAction<EquipmentItem[]>>;
  isLoading: boolean;
  addEquipment: (item: Omit<EquipmentItem, 'id' | 'imageUrls' | 'documentUrls'> & { images: File[], documents: File[], personnelCerts: File[] }) => Promise<void>;
  updateEquipment: (id: string, item: EquipmentItem, newFiles: {newImages?: File[], newDocuments?: File[], newPersonnelCerts?: File[]}) => Promise<void>;
  getEquipmentById: (id: string) => EquipmentItem | undefined;
};

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(
      initialEquipment.map((e, index) => ({ ...e, id: `EQ-${String(index + 1).padStart(3, '0')}`}))
  );
  const [isLoading, setIsLoading] = useState(false);


  const addEquipment = useCallback(async (item: Omit<EquipmentItem, 'id' | 'imageUrls' | 'documentUrls'> & { images: File[], documents: File[] }) => {
    const newId = `EQ-${Date.now()}`;
    const { images, documents, ...rest } = item;

    const imageUrls = await Promise.all(images.map(file => fileToBase64(file) as Promise<string>));

    const documentUrls: EquipmentDocument[] = await Promise.all(
        documents.map(async file => ({
            name: file.name,
            url: await fileToBase64(file) as string,
        }))
    );
    
    const newItem: EquipmentItem = { 
      ...rest, 
      id: newId,
      imageUrls,
      documentUrls,
    };
    setEquipmentList(prev => [...prev, newItem]);
  }, []);
  
  const updateEquipment = useCallback(async (id: string, updatedItem: EquipmentItem, newFiles: {newImages?: File[], newDocuments?: File[]}) => {
    const newImageUrls = await Promise.all((newFiles.newImages || []).map(file => fileToBase64(file) as Promise<string>));
    
    const newDocumentUrls: EquipmentDocument[] = await Promise.all(
        (newFiles.newDocuments || []).map(async file => ({
            name: file.name,
            url: await fileToBase64(file) as string,
        }))
    );

    const finalItem = {
        ...updatedItem,
        imageUrls: [...(updatedItem.imageUrls || []), ...newImageUrls],
        documentUrls: [...(updatedItem.documentUrls || []), ...newDocumentUrls],
    };

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
