

'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback } from 'react';
import { type Tender, type TenderStatus, initialTenders } from '@/lib/tenders';
import { formatCurrencyMillions } from '@/lib/utils';
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { fileToBase64 } from '@/lib/utils';

type AddTenderData = Omit<Tender, 'id' | 'documentUrls'> & { documents: File[] };
type UpdateTenderData = Omit<Tender, 'documentUrls'> & { newDocuments?: File[] };

type TenderContextType = {
  tenders: Tender[];
  setTenders: Dispatch<SetStateAction<Tender[]>>;
  isLoading: boolean;
  addTender: (item: AddTenderData) => Promise<void>;
  updateTender: (id: string, item: UpdateTenderData) => Promise<void>;
  getTenderById: (id: string) => Tender | undefined;
};

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export function TenderProvider({ children }: { children: ReactNode }) {
  const [tenders, setTenders] = useState<Tender[]>(
    initialTenders.map((t, index) => ({...t, id: `TND-${String(index + 1).padStart(3, '0')}`}))
  );
  const [isLoading, setIsLoading] = useState(false);

  const addTender = useCallback(async (item: AddTenderData) => {
    const { documents, ...rest } = item;
    const documentUrls = await Promise.all(
        (documents || []).map(file => fileToBase64(file) as Promise<string>)
    );
    const newTender = {
        ...rest,
        id: `TND-${Date.now()}`,
        documentUrls,
    };
    setTenders(prev => [...prev, newTender]);
  }, []);

  const updateTender = useCallback(async (id: string, updatedItem: UpdateTenderData) => {
    const { newDocuments, ...rest } = updatedItem;
    
    const existingTender = tenders.find(t => t.id === id);
    if (!existingTender) return;

    const newDocumentUrls = await Promise.all(
        (newDocuments || []).map(file => fileToBase64(file) as Promise<string>)
    );

    const finalItem: Tender = {
        ...rest,
        documentUrls: [...(existingTender.documentUrls || []), ...newDocumentUrls],
    };

    setTenders(prev => prev.map(t => t.id === id ? finalItem : t));
  }, [tenders]);

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
