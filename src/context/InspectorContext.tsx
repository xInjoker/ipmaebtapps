
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useMemo, useCallback, useEffect } from 'react';
import { type Inspector, type InspectorDocument } from '@/lib/inspectors';
import { getDocumentStatus, fileToBase64 } from '@/lib/utils';
import { Users2, BadgeCheck, Clock, XCircle } from 'lucide-react';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';

const db = getFirestore(app);

type InspectorStats = {
    total: number;
    validCerts: number;
    expiringSoon: number;
    expired: number;
};

type InspectorContextType = {
  inspectors: Inspector[];
  setInspectors: Dispatch<SetStateAction<Inspector[]>>;
  isLoading: boolean;
  addInspector: (item: Omit<Inspector, 'id'|'cvUrl'|'qualifications'|'otherDocuments'> & { cvFile: File | null; qualifications: {file: File, expirationDate?: string}[]; otherDocuments: {file: File, expirationDate?: string}[]}) => Promise<void>;
  updateInspector: (id: string, item: Inspector, newFiles: { newCvFile?: File | null, newQualifications?: {file: File, expirationDate?: string}[], newOtherDocs?: {file: File, expirationDate?: string}[] }) => Promise<void>;
  deleteInspector: (id: string) => Promise<void>;
  getInspectorById: (id: string) => Inspector | undefined;
  inspectorStats: InspectorStats;
  widgetData: { title: string; value: string; description: string; icon: React.ElementType; iconColor: string; shapeColor: string; }[];
};

const InspectorContext = createContext<InspectorContextType | undefined>(undefined);

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInspectors = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'inspectors'));
        const data = querySnapshot.docs.map(doc => doc.data() as Inspector);
        setInspectors(data);
      } catch (error) {
        console.error("Error fetching inspectors from Firestore: ", error);
      }
      setIsLoading(false);
    };
    fetchInspectors();
  }, []);

  const addInspector = useCallback(async (item: Omit<Inspector, 'id'|'cvUrl'|'qualifications'|'otherDocuments'> & { cvFile: File | null; qualifications: {file: File, expirationDate?: string}[]; otherDocuments: {file: File, expirationDate?: string}[]}) => {
    const { cvFile, qualifications: newQuals, otherDocuments: newOthers, ...rest } = item;
    const newId = `INSP-${Date.now()}`;
    
    const cvUrl = cvFile ? await uploadFile(cvFile, `inspectors/${newId}/cv/${cvFile.name}`) : '';
    
    const qualifications: InspectorDocument[] = await Promise.all(
        newQuals.map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `inspectors/${newId}/qualifications/${doc.file.name}`),
            expirationDate: doc.expirationDate,
        }))
    );

    const otherDocuments: InspectorDocument[] = await Promise.all(
        newOthers.map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `inspectors/${newId}/other/${doc.file.name}`),
            expirationDate: doc.expirationDate,
        }))
    );

    const newItem = { ...rest, id: newId, cvUrl, qualifications, otherDocuments };
    
    const sanitizedItem = JSON.parse(JSON.stringify(newItem, (key, value) => 
        value === undefined ? null : value
    ));

    await setDoc(doc(db, 'inspectors', newItem.id), sanitizedItem);
    setInspectors(prev => [...prev, sanitizedItem]);
  }, []);
  
  const updateInspector = useCallback(async (id: string, updatedItem: Inspector, newFiles: { newCvFile?: File | null, newQualifications?: {file: File, expirationDate?: string}[], newOtherDocs?: {file: File, expirationDate?: string}[] }) => {
    let newCvUrl = updatedItem.cvUrl;
    if (newFiles.newCvFile) {
        newCvUrl = await uploadFile(newFiles.newCvFile, `inspectors/${id}/cv/${newFiles.newCvFile.name}`);
    }

    const newQualifications: InspectorDocument[] = await Promise.all(
        (newFiles.newQualifications || []).map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `inspectors/${id}/qualifications/${doc.file.name}`),
            expirationDate: doc.expirationDate,
        }))
    );

    const newOtherDocuments: InspectorDocument[] = await Promise.all(
        (newFiles.newOtherDocs || []).map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `inspectors/${id}/other/${doc.file.name}`),
            expirationDate: doc.expirationDate,
        }))
    );

    const finalItem = {
        ...updatedItem,
        cvUrl: newCvUrl,
        qualifications: [...updatedItem.qualifications, ...newQualifications],
        otherDocuments: [...updatedItem.otherDocuments, ...newOtherDocuments],
    };

    const sanitizedItem = JSON.parse(JSON.stringify(finalItem, (key, value) => 
        value === undefined ? null : value
    ));

    await updateDoc(doc(db, 'inspectors', id), sanitizedItem);
    setInspectors(prev => prev.map(i => i.id === id ? sanitizedItem : i));
  }, []);

  const deleteInspector = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'inspectors', id));
    setInspectors(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const getInspectorById = useCallback((id:string) => {
    return inspectors.find(item => item.id === id);
  }, [inspectors]);
  
  const inspectorStats = useMemo(() => {
    const total = inspectors.length;
    let validCerts = 0;
    const inspectorHasExpiringCert = new Set<string>();
    const inspectorHasExpiredCert = new Set<string>();

    inspectors.forEach(inspector => {
        const allDocs = [...inspector.qualifications, ...inspector.otherDocuments];
        let hasExpiring = false;
        let hasExpired = false;

        allDocs.forEach(doc => {
            const status = getDocumentStatus(doc.expirationDate);
            if (status.variant !== 'destructive') {
                validCerts++;
            }

            if (status.variant === 'destructive') {
                hasExpired = true;
            } else if (status.variant === 'yellow') {
                hasExpiring = true;
            }
        });

        if (hasExpired) {
            inspectorHasExpiredCert.add(inspector.id);
        } else if (hasExpiring) {
            inspectorHasExpiringCert.add(inspector.id);
        }
    });

    return { 
        total, 
        validCerts,
        expiringSoon: inspectorHasExpiringCert.size,
        expired: inspectorHasExpiredCert.size
    };
  }, [inspectors]);

  const widgetData = useMemo(() => [
    { title: 'Total Inspectors', value: `${inspectorStats.total}`, description: 'inspectors in the database', icon: Users2, iconColor: 'text-blue-500', shapeColor: 'text-blue-500/10' },
    { title: 'Total Valid Certificates', value: `${inspectorStats.validCerts}`, description: 'certificates are currently valid', icon: BadgeCheck, iconColor: 'text-green-500', shapeColor: 'text-green-500/10' },
    { title: 'Expiring Certificates', value: `${inspectorStats.expiringSoon}`, description: 'inspectors with certs expiring soon', icon: Clock, iconColor: 'text-amber-500', shapeColor: 'text-amber-500/10' },
    { title: 'Expired Certificates', value: `${inspectorStats.expired}`, description: 'inspectors with expired certs', icon: XCircle, iconColor: 'text-rose-500', shapeColor: 'text-rose-500/10' },
  ], [inspectorStats]);

  const contextValue = useMemo(() => ({
    inspectors,
    setInspectors,
    isLoading,
    addInspector,
    updateInspector,
    deleteInspector,
    getInspectorById,
    inspectorStats,
    widgetData,
  }), [inspectors, isLoading, addInspector, updateInspector, deleteInspector, getInspectorById, inspectorStats, widgetData]);

  return (
    <InspectorContext.Provider value={contextValue}>
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
