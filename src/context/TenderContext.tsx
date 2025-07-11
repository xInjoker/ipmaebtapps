
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialTenders, type Tender } from '@/lib/tenders';

type TenderContextType = {
  tenders: Tender[];
  setTenders: Dispatch<SetStateAction<Tender[]>>;
  addTender: (item: Tender) => void;
};

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export function TenderProvider({ children }: { children: ReactNode }) {
  const [tenders, setTenders] = useState<Tender[]>(initialTenders);

  const addTender = (item: Tender) => {
    setTenders(prev => [...prev, item]);
  };
  
  return (
    <TenderContext.Provider value={{ tenders, setTenders, addTender }}>
      {children}
    </TenderContext.Provider>
  );
}

export function useTenders() {
  const context = useContext(TenderContext);
  if (context === undefined) {
    throw new Error('useTenders must be used within a TenderProvider');
  }
  return context;
}
