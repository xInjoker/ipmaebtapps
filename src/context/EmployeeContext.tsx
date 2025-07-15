
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialEmployees, type Employee } from '@/lib/employees';

type EmployeeContextType = {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  addEmployee: (item: Employee) => Promise<void>;
  updateEmployee: (id: string, item: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const addEmployee = async (item: Employee) => {
    // In a real app, this would be an API call to a Firestore service.
    // For now, we simulate async behavior.
    await new Promise(resolve => setTimeout(resolve, 500));
    setEmployees(prev => [...prev, item]);
  };
  
  const updateEmployee = async (id: string, updatedItem: Employee) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setEmployees(prev => prev.map(item => item.id === id ? updatedItem : item));
  };
  
  const deleteEmployee = async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setEmployees(prev => prev.filter(item => item.id !== id));
  };
  
  const getEmployeeById = (id: string) => {
    return employees.find(item => item.id === id);
  };

  return (
    <EmployeeContext.Provider value={{ employees, setEmployees, addEmployee, updateEmployee, deleteEmployee, getEmployeeById }}>
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
