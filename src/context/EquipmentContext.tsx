
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { type EquipmentItem, initialEquipment } from '@/lib/equipment';
import { fileToBase64 } from '@/lib/utils';

type EquipmentContextType = {
  equipmentList: EquipmentItem[];
  setEquipmentList: Dispatch<SetStateAction<EquipmentItem[]>>;
  isLoading: boolean;
  addEquipment: (item: Omit<EquipmentItem, 'id' | 'imageUrls' | 'documentUrls' | 'personnelCertificationUrls'> & { images: File[], documents: File[], personnelCerts: File[] }) => Promise<void>;
  updateEquipment: (id: string, item: EquipmentItem, newFiles: {newImages?: File[], newDocuments?: File[], newPersonnelCerts?: File[]}) => Promise<void>;
  getEquipmentById: (id: string) => EquipmentItem | undefined;
};

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(
      initialEquipment.map((e, index) => ({ ...e, id: `EQ-${String(index + 1).padStart(3, '0')}`}))
  );
  const [isLoading, setIsLoading] = useState(false);


  const addEquipment = useCallback(async (item: Omit<EquipmentItem, 'id' | 'imageUrls' | 'documentUrls' | 'personnelCertificationUrls'> & { images: File[], documents: File[], personnelCerts: File[] }) => {
    const newId = `EQ-${Date.now()}`;
    const { images, documents, personnelCerts, ...rest } = item;

    const [imageUrls, documentUrls, personnelCertificationUrls] = await Promise.all([
        Promise.all(images.map(file => fileToBase64(file) as Promise<string>)),
        Promise.all(documents.map(file => fileToBase64(file) as Promise<string>)),
        Promise.all(personnelCerts.map(file => fileToBase64(file) as Promise<string>)),
    ]);
    
    const newItem: EquipmentItem = { 
      ...rest, 
      id: newId,
      imageUrls,
      documentUrls,
      personnelCertificationUrls,
    };
    setEquipmentList(prev => [...prev, newItem]);
  }, []);
  
  const updateEquipment = useCallback(async (id: string, updatedItem: EquipmentItem, newFiles: {newImages?: File[], newDocuments?: File[], newPersonnelCerts?: File[]}) => {
    const [newImageUrls, newDocumentUrls, newCertUrls] = await Promise.all([
        Promise.all((newFiles.newImages || []).map(file => fileToBase64(file) as Promise<string>)),
        Promise.all((newFiles.newDocuments || []).map(file => fileToBase64(file) as Promise<string>)),
        Promise.all((newFiles.newPersonnelCerts || []).map(file => fileToBase64(file) as Promise<string>)),
    ]);

    const finalItem = {
        ...updatedItem,
        imageUrls: [...updatedItem.imageUrls, ...newImageUrls],
        documentUrls: [...updatedItem.documentUrls, ...newDocumentUrls],
        personnelCertificationUrls: [...updatedItem.personnelCertificationUrls, ...newCertUrls],
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
