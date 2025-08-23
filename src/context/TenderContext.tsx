
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback, useEffect } from 'react';
import { type Tender, type TenderStatus } from '@/lib/tenders';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { uploadFile, deleteFileByUrl } from '@/lib/storage';
import { useAuth } from './AuthContext';

const db = getFirestore(app);

type AddTenderData = Omit<Tender, 'id' | 'documentUrls'> & { documents: File[] };
type UpdateTenderData = Partial<Omit<Tender, 'id'>> & { newDocuments?: File[] };


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
  const { user, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing || !user) {
        setIsLoading(true);
        setTenders([]);
        return;
    };
    
    const fetchTenders = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'tenders'));
        const data = querySnapshot.docs.map(doc => doc.data() as Tender);
        setTenders(data);
      } catch (error: unknown) {
        console.error("Error fetching tenders from Firestore: ", {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
          userId: user?.uid,
        });
        setTenders([]); // Ensure tenders is an empty array on error
      } finally {
          setIsLoading(false);
      }
    };
    fetchTenders();
  }, [user, isInitializing]);

  const addTender = useCallback(async (item: AddTenderData) => {
    const newId = `TND-${Date.now()}`;
    const { documents, ...rest } = item;
    const documentUrls = await Promise.all(
        (documents || []).map(file => uploadFile(file, `tenders/${newId}/${file.name}`))
    );
    
    const newTender: Tender = { ...rest, id: newId, documentUrls };
    
    // Sanitize object to convert undefined to null before sending to Firestore
    const sanitizedTender = JSON.parse(JSON.stringify(newTender, (key, value) => {
        return value === undefined ? null : value;
    }));

    await setDoc(doc(db, 'tenders', newId), sanitizedTender);
    setTenders(prev => [...prev, sanitizedTender]);
  }, []);

  const updateTender = useCallback(async (id: string, updatedItem: UpdateTenderData) => {
    const { newDocuments, ...rest } = updatedItem;
    
    const existingTender = tenders.find(t => t.id === id);
    if (!existingTender) return;

    const newDocumentUrls = await Promise.all(
        (newDocuments || []).map(file => uploadFile(file, `tenders/${id}/${file.name}`))
    );

    const finalItem: Tender = {
        ...existingTender,
        ...rest,
        documentUrls: [...(rest.documentUrls || existingTender.documentUrls || []), ...newDocumentUrls],
    };

    // Sanitize object to convert undefined to null
    const sanitizedItem = JSON.parse(JSON.stringify(finalItem, (key, value) => {
        return value === undefined ? null : value;
    }));

    await updateDoc(doc(db, 'tenders', id), sanitizedItem);
    setTenders(prev => prev.map(t => t.id === id ? sanitizedItem : t));
  }, [tenders]);

  const deleteTender = useCallback(async (id: string) => {
    // First, get the document to retrieve the file URLs
    const tenderDocRef = doc(db, 'tenders', id);
    try {
        const docSnap = await getDoc(tenderDocRef);
        if (docSnap.exists()) {
            const tenderData = docSnap.data() as Tender;
            const urlsToDelete = tenderData.documentUrls || [];

            // Delete all associated files from Storage
            if (urlsToDelete.length > 0) {
                await Promise.all(urlsToDelete.map(url => deleteFileByUrl(url)));
            }
        }
        
        // After attempting to delete files, delete the Firestore document
        await deleteDoc(tenderDocRef);

        // Update local state
        setTenders(prev => prev.filter(item => item.id !== id));

    } catch (error: unknown) {
        console.error("Error deleting tender and associated files: ", {
          error: error instanceof Error ? error.message : 'Unknown error',
          tenderId: id,
        });
    }
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
