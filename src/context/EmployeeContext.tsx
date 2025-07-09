
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { initialEmployees, type Employee } from '@/lib/employees';

type EmployeeContextType = {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  addEmployee: (item: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, item: Employee) => void;
  deleteEmployee: (id: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  const addEmployee = (item: Omit<Employee, 'id'>) => {
    const newId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const newItem = { ...item, id: newId };
    setEmployees(prev => [...prev, newItem]);
  };
  
  const updateEmployee = (id: string, updatedItem: Employee) => {
    setEmployees(prev => prev.map(item => item.id === id ? updatedItem : item));
  };
  
  const deleteEmployee = (id: string) => {
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
