

'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEmployees } from '@/context/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { type Employee } from '@/lib/employees';
import { EmployeeForm } from '@/components/employee-form';
import { useEffect, useState, useCallback } from 'react';

type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const { getEmployeeById, updateEmployee } = useEmployees();
  const { toast } = useToast();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
  }, [employeeId, getEmployeeById, router, toast]);

  const handleSave = useCallback(async (
    data: Employee,
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
    ) => {
    if (employee) {
      setIsSaving(true);
      try {
        await updateEmployee(employee.id, data, newDocs);
        toast({ title: 'Employee Updated', description: `${data.name}'s details have been updated.` });
        router.push('/employees');
      } catch (error) {
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save changes.' });
      } finally {
        setIsSaving(false);
      }
    }
  }, [employee, router, toast, updateEmployee]);

  if (!employee) {
    return <div>Loading...</div>;
  }

  return <EmployeeForm employee={employee} onSave={handleSave} isLoading={isSaving} />;
}
