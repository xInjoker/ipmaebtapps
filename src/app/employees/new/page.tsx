

'use client';

import { useRouter } from 'next/navigation';
import { useEmployees } from '@/context/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { type Employee } from '@/lib/employees';
import { EmployeeForm } from '@/components/employee-form';
import { useCallback, useState } from 'react';

type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

export default function NewEmployeePage() {
  const router = useRouter();
  const { addEmployee } = useEmployees();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async (
    data: Omit<Employee, 'id'>, // Data from form won't have an ID
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
  ) => {
    setIsSaving(true);
    try {
        await addEmployee(data, newDocs);
        toast({ title: 'Employee Added', description: `${data.name} has been added to the system.` });
        setTimeout(() => router.push('/employees'), 500);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not add the new employee.' });
    } finally {
        setIsSaving(false);
    }
  }, [addEmployee, router, toast]);

  return <EmployeeForm onSave={handleSave as any} isLoading={isSaving} />;
}
