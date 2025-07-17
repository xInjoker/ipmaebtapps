
'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction, useCallback, useMemo } from 'react';
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

  const addEmployee = useCallback((item: Employee) => {
    setEmployees(prev => [...prev, item]);
  }, []);
  
  const updateEmployee = useCallback((id: string, updatedItem: Employee) => {
    setEmployees(prev => prev.map(e => e.id === id ? updatedItem : e));
  }, []);
  
  const deleteEmployee = useCallback((id: string) => {
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
