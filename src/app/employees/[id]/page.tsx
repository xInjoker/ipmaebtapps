
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEmployees } from '@/context/EmployeeContext';
import { type Employee } from '@/lib/employees';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  Home,
  Briefcase,
  Building,
  FileText,
  Calendar,
  CircleDollarSign,
  Wallet,
  Landmark,
  Shield,
  HeartPulse,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getEmployeeStatusVariant } from '@/lib/utils';
import { employeeFieldLabels } from '@/lib/employees';

function DetailItem({ icon: Icon, label, value, iconColor }: { icon: React.ElementType, label: string, value: React.ReactNode, iconColor: string }) {
    if (!value && typeof value !== 'number') return null;
    const bgColor = `${iconColor}1A`; // Adds ~10% opacity
    return (
        <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: bgColor }}>
                <Icon className="h-5 w-5" style={{ color: iconColor }} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="font-medium">{value}</div>
            </div>
        </div>
    );
}

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  const { getEmployeeById } = useEmployees();
  const { userHasPermission } = useAuth();
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

  const iconColors = ['#0D5EA6', '#0ABAB5', '#00C897', '#FFA955', '#FFD63A', '#FFBE98'];
  let personalColorIndex = 0;
  let workColorIndex = 0;
  let financialColorIndex = 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="icon">
                <Link href="/employees">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to Employees</span>
                </Link>
              </Button>
              <div className="space-y-1.5">
                <CardTitle>{employee.name}</CardTitle>
                <CardDescription>
                  {employee.position} &bull; <Badge variant={getEmployeeStatusVariant(employee.employmentStatus)}>{employee.employmentStatus}</Badge>
                </CardDescription>
              </div>
            </div>
            {userHasPermission('manage-employees') && (
              <Button asChild>
                <Link href={`/employees/${employee.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Employee
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <DetailItem icon={User} label={employeeFieldLabels.nationalId} value={employee.nationalId} iconColor={iconColors[personalColorIndex++ % iconColors.length]} />
                <DetailItem icon={Calendar} label="Birth Date & Place" value={employee.placeOfBirth && employee.dateOfBirth ? `${employee.placeOfBirth}, ${format(new Date(employee.dateOfBirth), 'PPP')}` : (employee.placeOfBirth || (employee.dateOfBirth && format(new Date(employee.dateOfBirth), 'PPP')))} iconColor={iconColors[personalColorIndex++ % iconColors.length]} />
                <DetailItem icon={User} label={employeeFieldLabels.gender} value={employee.gender} iconColor={iconColors[personalColorIndex++ % iconColors.length]} />
                <DetailItem icon={HeartPulse} label={employeeFieldLabels.religion} value={employee.religion} iconColor={iconColors[personalColorIndex++ % iconColors.length]} />
                <Separator />
                 <DetailItem icon={Mail} label={employeeFieldLabels.email} value={employee.email} iconColor={iconColors[personalColorIndex++ % iconColors.length]} />
                 <DetailItem icon={Phone} label={employeeFieldLabels.phoneNumber} value={employee.phoneNumber} iconColor={iconColors[personalColorIndex++ % iconColors.length]} />
                 <DetailItem icon={Home} label={employeeFieldLabels.address} value={employee.address} iconColor={iconColors[personalColorIndex++ % iconColors.length]} />
            </CardContent>
        </Card>
         <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Work, Project & Contract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <DetailItem icon={Briefcase} label={employeeFieldLabels.position} value={employee.position} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={Building} label={employeeFieldLabels.workUnitName} value={employee.workUnitName} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={FileText} label={employeeFieldLabels.projectName} value={employee.projectName} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={FileText} label={employeeFieldLabels.rabNumber} value={employee.rabNumber} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={FileText} label={employeeFieldLabels.portfolio} value={employee.portfolio} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={FileText} label={employeeFieldLabels.subPortfolio} value={employee.subPortfolio} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                    </div>
                     <div className="space-y-4">
                        <DetailItem icon={Shield} label={employeeFieldLabels.contractType} value={employee.contractType} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={FileText} label={employeeFieldLabels.contractNumber} value={employee.contractNumber} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={Calendar} label={employeeFieldLabels.contractStartDate} value={employee.contractStartDate ? format(new Date(employee.contractStartDate), 'PPP') : null} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                        <DetailItem icon={Calendar} label={employeeFieldLabels.contractEndDate} value={employee.contractEndDate ? format(new Date(employee.contractEndDate), 'PPP') : null} iconColor={iconColors[workColorIndex++ % iconColors.length]} />
                    </div>
                </div>
                <Separator className="my-4"/>
                <div>
                  <h4 className="font-medium mb-2">Competency</h4>
                  <p className="text-sm text-muted-foreground">{employee.competency || 'No competency details provided.'}</p>
                </div>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Financial & Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailItem icon={CircleDollarSign} label={employeeFieldLabels.salary} value={employee.salary ? formatCurrency(employee.salary) : null} iconColor={iconColors[financialColorIndex++ % iconColors.length]} />
            <DetailItem icon={Landmark} label="Bank" value={employee.bankName && employee.bankAccountNumber ? `${employee.bankName} - ${employee.bankAccountNumber}` : (employee.bankName || employee.bankAccountNumber)} iconColor={iconColors[financialColorIndex++ % iconColors.length]} />
            <DetailItem icon={Wallet} label={employeeFieldLabels.npwp} value={employee.npwp} iconColor={iconColors[financialColorIndex++ % iconColors.length]} />
            <DetailItem icon={User} label={employeeFieldLabels.ptkpStatus} value={employee.ptkpStatus} iconColor={iconColors[financialColorIndex++ % iconColors.length]} />
            <DetailItem icon={HeartPulse} label={employeeFieldLabels.bpjsHealth} value={employee.bpjsHealth} iconColor={iconColors[financialColorIndex++ % iconColors.length]} />
            <DetailItem icon={HeartPulse} label={employeeFieldLabels.bpjsEmployment} value={employee.bpjsEmployment} iconColor={iconColors[financialColorIndex++ % iconColors.length]} />
        </CardContent>
      </Card>
    </div>
  );
}
