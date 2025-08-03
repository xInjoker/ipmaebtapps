

'use client';

import { useRouter } from 'next/navigation';
import { useEmployees } from '@/context/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { type Employee } from '@/lib/employees';
import { EmployeeForm } from '@/components/employee-form';
import { useCallback } from 'react';
import type { InspectorDocument } from '@/lib/inspectors';

type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

export default function NewEmployeePage() {
  const router = useRouter();
  const { addEmployee } = useEmployees();
  const { toast } = useToast();

  const handleSave = useCallback(async (
    data: Employee,
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
  ) => {
    await addEmployee(data, newDocs);
    toast({ title: 'Employee Added', description: `${data.name} has been added to the system.` });
    setTimeout(() => router.push('/employees'), 500);
  }, [addEmployee, router, toast]);

  return <EmployeeForm onSave={handleSave} />;
}
