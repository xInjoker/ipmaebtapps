
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEmployees } from '@/context/EmployeeContext';
import { type Employee } from '@/lib/employees';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { EmployeeDetails } from '@/components/employee-details';


export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const { getEmployeeById } = useEmployees();
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (employeeId) {
      const item = getEmployeeById(employeeId);
      setEmployee(item || null);
    }
  }, [employeeId, getEmployeeById]);

  if (!employee) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Employee Not Found</h1>
        <p className="text-muted-foreground">The employee you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/employees">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Link>
        </Button>
      </div>
    );
  }

  return <EmployeeDetails employee={employee} />;
}
