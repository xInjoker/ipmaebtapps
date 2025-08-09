
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback, useEffect } from 'react';
import { type Tender } from '@/lib/tenders';
import { fileToBase64 } from '@/lib/utils';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';


const db = getFirestore(app);

type AddTenderData = Omit<Tender, 'id' | 'documentUrls'> & { documents: File[] };
type UpdateTenderData = Omit<Tender, 'documentUrls'> & { newDocuments?: File[] } & { documentUrls?: string[] };


type TenderContextType = {
  tenders: Tender[];
  setTenders: Dispatch<SetStateAction<Tender[]>>;
  isLoading: boolean;
  addTender: (item: AddTenderData) => Promise<void>;
  updateTender: (id: string, item: UpdateTenderData) => Promise<void>;
  deleteTender: (id: string) => Promise<void>;
  getTenderById: (id: string) => Tender | undefined;
};

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export function TenderProvider({ children }: { children: ReactNode }) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTenders = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'tenders'));
        const data = querySnapshot.docs.map(doc => doc.data() as Tender);
        setTenders(data);
      } catch (error) {
        console.error("Error fetching tenders from Firestore: ", error);
      } finally {
          setIsLoading(false);
      }
    };
    fetchTenders();
  }, []);

  const addTender = useCallback(async (item: AddTenderData) => {
    const newId = `TND-${Date.now()}`;
    const { documents, ...rest } = item;
    const documentUrls = await Promise.all(
        (documents || []).map(file => uploadFile(file, `tenders/${newId}/${file.name}`))
    );
    
    const newTender = { ...rest, id: newId, documentUrls };
    
    await setDoc(doc(db, 'tenders', newId), newTender);
    setTenders(prev => [...prev, newTender]);
  }, []);

  const updateTender = useCallback(async (id: string, updatedItem: UpdateTenderData) => {
    const { newDocuments, ...rest } = updatedItem;
    
    const existingTender = tenders.find(t => t.id === id);
    if (!existingTender) return;

    const newDocumentUrls = await Promise.all(
        (newDocuments || []).map(file => uploadFile(file, `tenders/${id}/${file.name}`))
    );

    const finalItem: Tender = {
        ...(rest as Tender),
        documentUrls: [...(rest.documentUrls || []), ...newDocumentUrls],
    };

    await updateDoc(doc(db, 'tenders', id), finalItem);
    setTenders(prev => prev.map(t => t.id === id ? finalItem : t));
  }, [tenders]);

  const deleteTender = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'tenders', id));
    setTenders(prev => prev.filter(item => item.id !== id));
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
    deleteTender,
    getTenderById,
  }), [tenders, isLoading, addTender, updateTender, deleteTender, getTenderById]);

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
