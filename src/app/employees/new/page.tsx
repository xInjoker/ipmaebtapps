
'use client';

import { useRouter } from 'next/navigation';
import { useEmployees } from '@/context/EmployeeContext';
import { useToast } from '@/hooks/use-toast';
import { type Employee } from '@/lib/employees';
import { EmployeeForm } from '@/components/employee-form';

export default function NewEmployeePage() {
  const router = useRouter();
  const { addEmployee } = useEmployees();
  const { toast } = useToast();

  const handleSave = async (data: Employee) => {
    await addEmployee(data);
    toast({ title: 'Employee Added', description: `${data.name} has been added to the system.` });
    setTimeout(() => router.push('/employees'), 500);
  };

  return <EmployeeForm onSave={handleSave} />;
}
