
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { type Employee, initialEmployees } from '@/lib/employees';

type EmployeeContextType = {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  isLoading: boolean;
  addEmployee: (item: Employee) => void;
  updateEmployee: (id: string, item: Employee) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(
    initialEmployees.map((e, index) => ({ ...e, id: `EMP-${String(index + 1).padStart(3, '0')}` }))
  );
  const [isLoading, setIsLoading] = useState(false);

  const addEmployee = (item: Employee) => {
    setEmployees(prev => [...prev, item]);
  };
  
  const updateEmployee = (id: string, updatedItem: Employee) => {
    setEmployees(prev => prev.map(e => e.id === id ? updatedItem : e));
  };
  
  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
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
