
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialEquipment, type EquipmentItem } from '@/lib/equipment';

type EquipmentContextType = {
  equipmentList: EquipmentItem[];
  setEquipmentList: Dispatch<SetStateAction<EquipmentItem[]>>;
  addEquipment: (item: Omit<EquipmentItem, 'id'>) => void;
  updateEquipment: (id: string, item: EquipmentItem) => void;
  getEquipmentById: (id: string) => EquipmentItem | undefined;
};

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(initialEquipment);

  const addEquipment = (item: Omit<EquipmentItem, 'id'>) => {
    const newId = `EQ-${String(equipmentList.length + 1).padStart(3, '0')}`;
    const newItem = { 
      ...item, 
      id: newId,
      assignedPersonnelIds: item.assignedPersonnelIds || [],
      personnelCertificationUrls: item.personnelCertificationUrls || [],
    };
    setEquipmentList(prev => [...prev, newItem]);
  };
  
  const updateEquipment = (id: string, updatedItem: EquipmentItem) => {
    setEquipmentList(prev => prev.map(item => item.id === id ? updatedItem : item));
  };
  
  const getEquipmentById = (id: string) => {
    return equipmentList.find(item => item.id === id);
  };

  return (
    <EquipmentContext.Provider value={{ equipmentList, setEquipmentList, addEquipment, updateEquipment, getEquipmentById }}>
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
