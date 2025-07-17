
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { type EquipmentItem } from '@/lib/equipment';
import * as equipmentService from '@/services/equipmentService';
import { useAuth } from './AuthContext';

type EquipmentContextType = {
  equipmentList: EquipmentItem[];
  setEquipmentList: Dispatch<SetStateAction<EquipmentItem[]>>;
  isLoading: boolean;
  addEquipment: (item: Omit<EquipmentItem, 'id'>) => Promise<void>;
  updateEquipment: (id: string, item: EquipmentItem) => Promise<void>;
  getEquipmentById: (id: string) => EquipmentItem | undefined;
};

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitializing: isAuthInitializing } = useAuth();

  useEffect(() => {
    if (isAuthInitializing) return;

    const localData = equipmentService.loadFromLocalStorage();
    if (localData.length > 0) {
      setEquipmentList(localData);
      setIsLoading(false);
    }

    const unsubscribe = equipmentService.streamItems((fetchedItems) => {
        if (fetchedItems.length === 0 && localData.length === 0) {
            equipmentService.seedInitialData();
        } else {
            setEquipmentList(fetchedItems);
            equipmentService.saveToLocalStorage(fetchedItems);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthInitializing]);


  const addEquipment = async (item: Omit<EquipmentItem, 'id'>) => {
    const newId = `EQ-${Date.now()}`;
    const newItem = { 
      ...item, 
      id: newId,
      assignedPersonnelIds: item.assignedPersonnelIds || [],
      personnelCertificationUrls: item.personnelCertificationUrls || [],
    };
    await equipmentService.addItem(newItem);
  };
  
  const updateEquipment = async (id: string, updatedItem: EquipmentItem) => {
    await equipmentService.updateItem(id, updatedItem);
  };
  
  const getEquipmentById = (id: string) => {
    return equipmentList.find(item => item.id === id);
  };

  return (
    <EquipmentContext.Provider value={{ equipmentList, setEquipmentList, isLoading, addEquipment, updateEquipment, getEquipmentById }}>
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
