

'use client';

import { useRouter } from 'next/navigation';
import { useEmployees } from '@/context/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { type Employee } from '@/lib/employees';
import { EmployeeForm, type EmployeeFormData } from '@/components/employee-form';
import { useCallback, useState } from 'react';
import { format } from 'date-fns';

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
    data: EmployeeFormData,
    newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }
  ) => {
    setIsSaving(true);
    try {
        const employeeData = {
          ...data,
          reportingManagerId: data.reportingManagerId || undefined,
          dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : undefined,
          contractStartDate: data.contractStartDate ? format(data.contractStartDate, 'yyyy-MM-dd') : undefined,
          contractEndDate: data.contractEndDate ? format(data.contractEndDate, 'yyyy-MM-dd') : undefined,
        };
        await addEmployee(employeeData, newDocs);
        toast({ title: 'Employee Added', description: `${data.name} has been added to the system.` });
        router.push('/employees');
    } catch (error) {
        if (error instanceof Error) {
          toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
        } else {
          toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not add the new employee.' });
        }
    } finally {
        setIsSaving(false);
    }
  }, [addEmployee, router, toast]);

  return <EmployeeForm onSave={handleSave} isLoading={isSaving} />;
}
