
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo, useEffect } from 'react';
import { type Employee, initialEmployees } from '@/lib/employees';
import type { InspectorDocument } from '@/lib/inspectors';
import { fileToBase64 } from '@/lib/utils';
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';


const db = getFirestore(app);

type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

type EmployeeContextType = {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  isLoading: boolean;
  addEmployee: (item: Partial<Omit<Employee, 'id'>>, newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }) => Promise<void>;
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
        if (data.length > 0) {
            setEmployees(data);
        } else {
            // If the database is empty, load the initial hardcoded data.
            // This is useful for first-time setup or demos.
            // You might want to remove this for a production-only environment.
            console.warn("No employees found in Firestore, falling back to initial data.");
            setEmployees(initialEmployees.map((e, i) => ({ ...e, id: `EMP-${i + 1}` })));
        }
      } catch (error) {
        console.error("Error fetching employees from Firestore: ", error);
        // Fallback to initial data on error
        setEmployees(initialEmployees.map((e, i) => ({ ...e, id: `EMP-${i + 1}` })));
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const addEmployee = useCallback(async (
    item: Partial<Omit<Employee, 'id'>>,
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
  ) => {
    const { newCvFile, newQualifications, newOtherDocs } = newDocs;
    const newId = `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const cvUrl = newCvFile ? await uploadFile(newCvFile, `employees/${newId}/cv/${newCvFile.name}`) : undefined;
    
    const qualifications: InspectorDocument[] = await Promise.all(
        newQualifications.map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `employees/${newId}/qualifications/${doc.file.name}`),
            expirationDate: doc.expirationDate,
        }))
    );

    const otherDocuments: InspectorDocument[] = await Promise.all(
        newOtherDocs.map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `employees/${newId}/other/${doc.file.name}`),
        }))
    );

    const newItem: Employee = { ...item, id: newId, cvUrl, qualifications, otherDocuments } as Employee;
    
    // Sanitize object before sending to Firestore
    const sanitizedItem = JSON.parse(JSON.stringify(newItem, (key, value) => 
        value === undefined ? null : value
    ));

    await setDoc(doc(db, 'employees', newId), sanitizedItem);
    setEmployees(prev => [...prev, sanitizedItem]);
  }, []);
  
  const updateEmployee = useCallback(async (
    id: string, 
    updatedItem: Employee,
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
    ) => {
    const { newCvFile, newQualifications, newOtherDocs } = newDocs;

    let newCvUrl = updatedItem.cvUrl;
    if (newCvFile) {
        newCvUrl = await uploadFile(newCvFile, `employees/${id}/cv/${newCvFile.name}`);
    }

    const addedQualifications: InspectorDocument[] = await Promise.all(
        (newQualifications || []).map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `employees/${id}/qualifications/${doc.file.name}`),
            expirationDate: doc.expirationDate,
        }))
    );

    const addedOtherDocuments: InspectorDocument[] = await Promise.all(
        (newOtherDocs || []).map(async doc => ({
            name: doc.file.name,
            url: await uploadFile(doc.file, `employees/${id}/other/${doc.file.name}`),
        }))
    );

    const finalItem: Employee = {
        ...updatedItem,
        cvUrl: newCvUrl,
        qualifications: [...(updatedItem.qualifications || []), ...addedQualifications],
        otherDocuments: [...(updatedItem.otherDocuments || []), ...addedOtherDocuments],
    };
    
    // Sanitize object before sending to Firestore
    const sanitizedItem = JSON.parse(JSON.stringify(finalItem, (key, value) => 
        value === undefined ? null : value
    ));

    await updateDoc(doc(db, 'employees', id), sanitizedItem);
    setEmployees(prev => prev.map(e => e.id === id ? sanitizedItem : e));
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
