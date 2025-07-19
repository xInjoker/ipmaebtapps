
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback } from 'react';
import { type Tender, type TenderStatus, initialTenders } from '@/lib/tenders';
import { formatCurrencyMillions } from '@/lib/utils';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';

type TenderContextType = {
  tenders: Tender[];
  setTenders: Dispatch<SetStateAction<Tender[]>>;
  isLoading: boolean;
  addTender: (item: Tender) => void;
  updateTender: (id: string, item: Tender) => void;
  getTenderById: (id: string) => Tender | undefined;
};

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export function TenderProvider({ children }: { children: ReactNode }) {
  const [tenders, setTenders] = useState<Tender[]>(
    initialTenders.map((t, index) => ({...t, id: `TND-${String(index + 1).padStart(3, '0')}`}))
  );
  const [isLoading, setIsLoading] = useState(false);

  const addTender = useCallback((item: Tender) => {
    setTenders(prev => [...prev, item]);
  }, []);

  const updateTender = useCallback((id: string, updatedItem: Tender) => {
    setTenders(prev => prev.map(t => t.id === id ? updatedItem : t));
  }, []);

  const getTenderById = useCallback((id: string) => {
    return tenders.find(item => item.id === id);
  }, [tenders]);
  

  const contextValue = useMemo(() => ({
    tenders,
    setTenders,
    isLoading,
    addTender,
    updateTender,
    getTenderById,
  }), [tenders, isLoading, addTender, updateTender, getTenderById]);

  return (
    <TenderContext.Provider value={contextValue}>
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
