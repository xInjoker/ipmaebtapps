
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useEffect } from 'react';
import { type Employee } from '@/lib/employees';
import * as employeeService from '@/services/employeeService';
import { useAuth } from './AuthContext';

type EmployeeContextType = {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  isLoading: boolean;
  addEmployee: (item: Employee) => Promise<void>;
  updateEmployee: (id: string, item: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isInitializing: isAuthInitializing } = useAuth();

  useEffect(() => {
    if (isAuthInitializing) return;

    const localData = employeeService.loadFromLocalStorage();
    if (localData.length > 0) {
        setEmployees(localData);
        setIsLoading(false);
    }

    const unsubscribe = employeeService.streamEmployees((fetchedItems) => {
        if (fetchedItems.length === 0 && localData.length === 0) {
            employeeService.seedInitialData();
        } else {
            setEmployees(fetchedItems);
            employeeService.saveToLocalStorage(fetchedItems);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthInitializing]);


  const addEmployee = async (item: Employee) => {
    await employeeService.addItem(item);
  };
  
  const updateEmployee = async (id: string, updatedItem: Employee) => {
    await employeeService.updateItem(id, updatedItem);
  };
  
  const deleteEmployee = async (id: string) => {
    await employeeService.deleteItem(id);
  };
  
  const getEmployeeById = (id: string) => {
    return employees.find(item => item.id === id);
  };

  return (
    <EmployeeContext.Provider value={{ employees, setEmployees, isLoading, addEmployee, updateEmployee, deleteEmployee, getEmployeeById }}>
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
