
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialInspectors, type Inspector } from '@/lib/inspectors';

type InspectorContextType = {
  inspectors: Inspector[];
  setInspectors: Dispatch<SetStateAction<Inspector[]>>;
  addInspector: (item: Omit<Inspector, 'id'>) => void;
  updateInspector: (id: string, item: Inspector) => void;
  getInspectorById: (id: string) => Inspector | undefined;
};

const InspectorContext = createContext<InspectorContextType | undefined>(undefined);

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [inspectors, setInspectors] = useState<Inspector[]>(initialInspectors);

  const addInspector = (item: Omit<Inspector, 'id'>) => {
    const newId = `INSP-${String(inspectors.length + 1).padStart(3, '0')}`;
    const newItem = { ...item, id: newId };
    setInspectors(prev => [...prev, newItem]);
  };
  
  const updateInspector = (id: string, updatedItem: Inspector) => {
    setInspectors(prev => prev.map(item => item.id === id ? updatedItem : item));
  };
  
  const getInspectorById = (id:string) => {
    return inspectors.find(item => item.id === id);
  };

  return (
    <InspectorContext.Provider value={{ inspectors, setInspectors, addInspector, updateInspector, getInspectorById }}>
      {children}
    </InspectorContext.Provider>
  );
}

export function useInspectors() {
  const context = useContext(InspectorContext);
  if (context === undefined) {
    throw new Error('useInspectors must be used within an InspectorProvider');
  }
  return context;
}
