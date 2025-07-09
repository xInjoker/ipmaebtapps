
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEmployees } from '@/context/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { type Employee } from '@/lib/employees';
import { EmployeeForm } from '@/components/employee-form';
import { useEffect, useState } from 'react';

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const { getEmployeeById, updateEmployee } = useEmployees();
  const { toast } = useToast();
  
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const employeeId = params.id as string;
    if (employeeId) {
      const item = getEmployeeById(employeeId);
      if (item) {
        setEmployee(item);
      } else {
        toast({
            variant: 'destructive',
            title: 'Employee Not Found',
            description: 'Could not find the employee you were looking for.'
        });
        router.push('/employees');
      }
    }
  }, [params.id, getEmployeeById, router, toast]);

  const handleSave = (data: Employee) => {
    if (employee) {
      updateEmployee(employee.id, data);
      toast({ title: 'Employee Updated', description: `${data.name}'s details have been updated.` });
      router.push('/employees');
    }
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return <EmployeeForm employee={employee} onSave={handleSave} />;
}
