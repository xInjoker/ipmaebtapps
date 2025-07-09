
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type Employee } from '@/lib/employees';
import { useState, useEffect } from 'react';

const employeeSchema = z.object({
  // Step 1: Work & Project
  position: z.string().optional(),
  workUnit: z.string().optional(),
  workUnitName: z.string().optional(),
  portfolio: z.enum(['AEBT', 'others']).optional(),
  subPortfolio: z.enum(['IAPPM', 'EBT']).optional(),
  projectName: z.string().optional(),
  rabNumber: z.string().optional(),
  competency: z.string().optional(),
  
  // Step 2: Personal Details
  name: z.string().optional(),
  nationalId: z.string().optional(),
  placeOfBirth: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['Male', 'Female']).optional(),
  religion: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().optional(),

  // Step 3: Employment
  employmentStatus: z.enum(['Active', 'Inactive', 'On Leave']).optional(),
  bpjsHealth: z.string().optional(),
  bpjsEmployment: z.string().optional(),

  // Step 4: Contract
  contractType: z.enum(['Full-time', 'Part-time', 'Contract']).optional(),
  contractNumber: z.string().optional(),
  contractStartDate: z.date().optional(),
  contractEndDate: z.date().optional(),

  // Step 5: Financial & Tax
  salary: z.coerce.number().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  npwp: z.string().optional(),
  ptkpStatus: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (data: Employee) => void;
}

const steps = [
  { id: 1, name: 'Work & Project' },
  { id: 2, name: 'Personal Details' },
  { id: 3, name: 'Employment' },
  { id: 4, name: 'Contract' },
  { id: 5, name: 'Financial & Tax' },
];

export function EmployeeForm({ employee, onSave }: EmployeeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        ...employee,
        dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth) : undefined,
        contractStartDate: employee.contractStartDate ? new Date(employee.contractStartDate) : undefined,
        contractEndDate: employee.contractEndDate ? new Date(employee.contractEndDate) : undefined,
        salary: employee.salary || 0,
      });
    } else {
      form.reset({});
    }
    setCurrentStep(0);
  }, [employee, form]);
  
  const onSubmit = (data: EmployeeFormData) => {
    const finalData: Employee = {
      ...employee, // Keep existing fields like ID
      ...data,
      id: employee?.id || `EMP-${Date.now()}`,
      dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : undefined,
      contractStartDate: data.contractStartDate ? format(data.contractStartDate, 'yyyy-MM-dd') : undefined,
      contractEndDate: data.contractEndDate ? format(data.contractEndDate, 'yyyy-MM-dd') : undefined,
    };
    onSave(finalData);
  };

  const nextStep = () => setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  
  const pageTitle = employee ? 'Edit Employee' : 'Add New Employee';
  const pageDescription = employee ? `Update details for ${employee.name}` : 'Fill in the details for the new employee.';


  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/employees">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Employees</span>
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>
      </div>
        <Card>
            <CardHeader>
                {/* Progress Indicator */}
                <div className="flex justify-between items-center px-4 py-2">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2",
                                currentStep > index ? "bg-primary text-primary-foreground border-primary" :
                                currentStep === index ? "border-primary" : "border-muted-foreground"
                            )}>
                                {step.id}
                            </div>
                            <p className={cn(
                                "ml-2 text-sm",
                                currentStep === index ? "font-semibold text-primary" : "text-muted-foreground"
                            )}>
                                {step.name}
                            </p>
                            {index < steps.length - 1 && <div className="flex-1 h-px bg-border ml-4 w-16" />}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <form id="employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Position</Label><Input {...form.register('position')} /></div>
                        <div><Label>Work Unit</Label><Input {...form.register('workUnit')} /></div>
                        <div><Label>Work Unit Name</Label><Input {...form.register('workUnitName')} /></div>
                        <div><Label>Project Name</Label><Input {...form.register('projectName')} /></div>
                        <div><Label>RAB Number</Label><Input {...form.register('rabNumber')} /></div>
                        <div>
                        <Label>Portfolio</Label>
                        <Select onValueChange={(v) => form.setValue('portfolio', v as any)} defaultValue={form.getValues('portfolio')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="AEBT">AEBT</SelectItem><SelectItem value="others">Others</SelectItem></SelectContent>
                        </Select>
                        </div>
                        <div>
                        <Label>Sub-Portfolio</Label>
                        <Select onValueChange={(v) => form.setValue('subPortfolio', v as any)} defaultValue={form.getValues('subPortfolio')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="IAPPM">IAPPM</SelectItem><SelectItem value="EBT">EBT</SelectItem></SelectContent>
                        </Select>
                        </div>
                        <div className="md:col-span-2"><Label>Competency</Label><Textarea {...form.register('competency')} /></div>
                    </div>
                )}
                {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Full Name</Label><Input {...form.register('name')} /></div>
                        <div><Label>National ID (KTP)</Label><Input {...form.register('nationalId')} /></div>
                        <div><Label>Place of Birth</Label><Input {...form.register('placeOfBirth')} /></div>
                        <div>
                            <Label>Date of Birth</Label>
                            <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch('dateOfBirth') && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{form.watch('dateOfBirth') ? format(form.watch('dateOfBirth')!, 'PPP') : <span>Pick a date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('dateOfBirth')} onSelect={(d) => form.setValue('dateOfBirth', d)} initialFocus /></PopoverContent></Popover>
                        </div>
                        <div>
                        <Label>Gender</Label>
                        <Select onValueChange={(v) => form.setValue('gender', v as any)} defaultValue={form.getValues('gender')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                        </Select>
                        </div>
                        <div><Label>Religion</Label><Input {...form.register('religion')} /></div>
                        <div className="md:col-span-2"><Label>Address</Label><Textarea {...form.register('address')} /></div>
                        <div><Label>Email</Label><Input type="email" {...form.register('email')} /></div>
                        <div><Label>Phone Number</Label><Input {...form.register('phoneNumber')} /></div>
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <Label>Employment Status</Label>
                        <Select onValueChange={(v) => form.setValue('employmentStatus', v as any)} defaultValue={form.getValues('employmentStatus')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="On Leave">On Leave</SelectItem></SelectContent>
                        </Select>
                        </div>
                        <div><Label>BPJS Health Number</Label><Input {...form.register('bpjsHealth')} /></div>
                        <div><Label>BPJS Employment Number</Label><Input {...form.register('bpjsEmployment')} /></div>
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <Label>Contract Type</Label>
                        <Select onValueChange={(v) => form.setValue('contractType', v as any)} defaultValue={form.getValues('contractType')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Full-time">Full-time</SelectItem><SelectItem value="Part-time">Part-time</SelectItem><SelectItem value="Contract">Contract</SelectItem></SelectContent>
                        </Select>
                        </div>
                        <div><Label>Contract Number</Label><Input {...form.register('contractNumber')} /></div>
                        <div>
                            <Label>Contract Start Date</Label>
                            <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch('contractStartDate') && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{form.watch('contractStartDate') ? format(form.watch('contractStartDate')!, 'PPP') : <span>Pick a date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('contractStartDate')} onSelect={(d) => form.setValue('contractStartDate', d)} initialFocus /></PopoverContent></Popover>
                        </div>
                        <div>
                            <Label>Contract End Date</Label>
                            <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch('contractEndDate') && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{form.watch('contractEndDate') ? format(form.watch('contractEndDate')!, 'PPP') : <span>Pick a date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('contractEndDate')} onSelect={(d) => form.setValue('contractEndDate', d)} initialFocus /></PopoverContent></Popover>
                        </div>
                    </div>
                )}
                {currentStep === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Salary</Label><Input type="number" {...form.register('salary')} /></div>
                        <div><Label>Bank Name</Label><Input {...form.register('bankName')} /></div>
                        <div><Label>Bank Account Number</Label><Input {...form.register('bankAccountNumber')} /></div>
                        <div><Label>NPWP Number</Label><Input {...form.register('npwp')} /></div>
                        <div><Label>PTKP Status</Label><Input {...form.register('ptkpStatus')} /></div>
                    </div>
                )}
                </form>
            </CardContent>
            <CardFooter className="flex justify-between pt-4 border-t">
                <Button variant="outline" type="button" onClick={prevStep} disabled={currentStep === 0}>
                    <ChevronLeft className="mr-2 h-4 w-4"/> Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                        Next <ChevronRight className="ml-2 h-4 w-4"/>
                    </Button>
                ) : (
                    <Button type="submit" form="employee-form">Save Employee</Button>
                )}
            </CardFooter>
        </Card>
    </div>
  );
}
