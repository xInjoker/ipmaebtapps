
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type Employee } from '@/lib/employees';
import type { InspectorDocument } from '@/lib/inspectors';
import { fileToBase64 } from '@/lib/utils';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

type EmployeeContextType = {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  isLoading: boolean;
  addEmployee: (item: Employee, newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }) => Promise<void>;
  updateEmployee: (id: string, item: Employee, newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        const data = querySnapshot.docs.map(doc => doc.data() as Employee);
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees from Firestore: ", error);
      }
      setIsLoading(false);
    };
    fetchEmployees();
  }, []);

  const addEmployee = useCallback(async (
    item: Employee,
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
  ) => {
    const { newCvFile, newQualifications, newOtherDocs } = newDocs;

    const cvUrl = newCvFile ? await fileToBase64(newCvFile) as string : undefined;
    
    const qualifications: InspectorDocument[] = await Promise.all(
        newQualifications.map(async doc => ({
            name: doc.file.name,
            url: await fileToBase64(doc.file) as string,
            expirationDate: doc.expirationDate,
        }))
    );

    const otherDocuments: InspectorDocument[] = await Promise.all(
        newOtherDocs.map(async doc => ({
            name: doc.file.name,
            url: await fileToBase64(doc.file) as string,
        }))
    );

    const newItem = { ...item, cvUrl, qualifications, otherDocuments };
    await setDoc(doc(db, 'employees', newItem.id), newItem);
    setEmployees(prev => [...prev, newItem]);
  }, []);
  
  const updateEmployee = useCallback(async (
    id: string, 
    updatedItem: Employee,
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
    ) => {
    const { newCvFile, newQualifications, newOtherDocs } = newDocs;

    let newCvUrl = updatedItem.cvUrl;
    if (newCvFile) {
        newCvUrl = await fileToBase64(newCvFile) as string;
    }

    const addedQualifications: InspectorDocument[] = await Promise.all(
        (newQualifications || []).map(async doc => ({
            name: doc.file.name,
            url: await fileToBase64(doc.file) as string,
            expirationDate: doc.expirationDate,
        }))
    );

    const addedOtherDocuments: InspectorDocument[] = await Promise.all(
        (newOtherDocs || []).map(async doc => ({
            name: doc.file.name,
            url: await fileToBase64(doc.file) as string,
        }))
    );

    const finalItem = {
        ...updatedItem,
        cvUrl: newCvUrl,
        qualifications: [...(updatedItem.qualifications || []), ...addedQualifications],
        otherDocuments: [...(updatedItem.otherDocuments || []), ...addedOtherDocuments],
    };
    
    await updateDoc(doc(db, 'employees', id), finalItem);
    setEmployees(prev => prev.map(e => e.id === id ? finalItem : e));
  }, []);
  
  const deleteEmployee = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'employees', id));
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);
  
  const getEmployeeById = useCallback((id: string) => {
    return employees.find(item => item.id === id);
  }, [employees]);

  const contextValue = useMemo(() => ({
    employees,
    setEmployees,
    isLoading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
  }), [employees, isLoading, addEmployee, updateEmployee, deleteEmployee, getEmployeeById]);

  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
}
