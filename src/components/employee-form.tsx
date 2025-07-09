
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
import { type Employee, employeeFieldLabels } from '@/lib/employees';
import { useState, useEffect, useMemo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/context/ProjectContext';

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { branches } = useAuth();
  const { projects } = useProjects();
  const [generatedId, setGeneratedId] = useState('');

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {},
  });

  const formData = form.watch();
  const watchedWorkUnit = form.watch('workUnit');
  const watchedProjectName = form.watch('projectName');

  const availableProjects = useMemo(() => {
    if (!watchedWorkUnit) return [];
    return projects.filter(p => p.branchId === watchedWorkUnit);
  }, [projects, watchedWorkUnit]);

  useEffect(() => {
    if (!employee) {
      const newId = `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setGeneratedId(newId);
    }
  }, [employee]);

  useEffect(() => {
    if (watchedProjectName) {
        const selectedProject = projects.find(p => p.name === watchedProjectName);
        if (selectedProject) {
            form.setValue('rabNumber', selectedProject.rabNumber);
        }
    } else {
        form.setValue('rabNumber', '');
    }
  }, [watchedProjectName, projects, form]);

  useEffect(() => {
    if (watchedWorkUnit) {
        const selectedBranch = branches.find(b => b.id === watchedWorkUnit);
        if (selectedBranch) {
            form.setValue('workUnitName', selectedBranch.name);
        }
    }
  }, [watchedWorkUnit, branches, form]);

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
      ...employee,
      ...data,
      id: employee?.id || generatedId,
      dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : undefined,
      contractStartDate: data.contractStartDate ? format(data.contractStartDate, 'yyyy-MM-dd') : undefined,
      contractEndDate: data.contractEndDate ? format(data.contractEndDate, 'yyyy-MM-dd') : undefined,
    };
    onSave(finalData);
  };

  const handleReview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsConfirmOpen(true);
    }
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
                        
                        <div>
                            <Label>Work Unit</Label>
                            <Select onValueChange={(v) => { form.setValue('workUnit', v); form.setValue('projectName', ''); form.setValue('rabNumber', ''); }} value={form.watch('workUnit') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a work unit..."/></SelectTrigger>
                                <SelectContent>
                                    {branches.map(branch => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Project Name</Label>
                            <Select onValueChange={(v) => form.setValue('projectName', v)} value={form.watch('projectName') || ''} disabled={!watchedWorkUnit}>
                                <SelectTrigger><SelectValue placeholder="Select a project..."/></SelectTrigger>
                                <SelectContent>
                                    {availableProjects.map(project => (
                                        <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div><Label>RAB Number</Label><Input {...form.register('rabNumber')} readOnly /></div>

                        <div>
                        <Label>Portfolio</Label>
                        <Select onValueChange={(v) => form.setValue('portfolio', v as any)} value={form.watch('portfolio') || ''}>
                            <SelectTrigger><SelectValue placeholder="Select a portfolio..."/></SelectTrigger>
                            <SelectContent><SelectItem value="AEBT">AEBT</SelectItem><SelectItem value="others">Others</SelectItem></SelectContent>
                        </Select>
                        </div>
                        <div>
                        <Label>Sub-Portfolio</Label>
                        <Select onValueChange={(v) => form.setValue('subPortfolio', v as any)} value={form.watch('subPortfolio') || ''}>
                            <SelectTrigger><SelectValue placeholder="Select a sub-portfolio..."/></SelectTrigger>
                            <SelectContent><SelectItem value="IAPPM">IAPPM</SelectItem><SelectItem value="EBT">EBT</SelectItem></SelectContent>
                        </Select>
                        </div>
                        <div className="md:col-span-2"><Label>Competency</Label><Textarea {...form.register('competency')} /></div>
                    </div>
                )}
                {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Employee ID</Label><Input value={employee?.id || generatedId} readOnly /></div>
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
                        <Select onValueChange={(v) => form.setValue('gender', v as any)} value={form.watch('gender') || ''}>
                            <SelectTrigger><SelectValue placeholder="Select a gender..."/></SelectTrigger>
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
                        <Select onValueChange={(v) => form.setValue('employmentStatus', v as any)} value={form.watch('employmentStatus') || ''}>
                            <SelectTrigger><SelectValue placeholder="Select a status..."/></SelectTrigger>
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
                        <Select onValueChange={(v) => form.setValue('contractType', v as any)} value={form.watch('contractType') || ''}>
                            <SelectTrigger><SelectValue placeholder="Select a type..."/></SelectTrigger>
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
                    <Button type="button" onClick={handleReview}>Review Employee</Button>
                )}
            </CardFooter>
        </Card>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Employee Details</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please review the information below. If everything is correct, click "Confirm & Save".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <ScrollArea className="max-h-[60vh] rounded-md border p-4">
                    <div className="space-y-6">
                        {/* Step 1: Work & Project */}
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Work & Project</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.position}:</span> {formData.position || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.workUnitName}:</span> {formData.workUnitName || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.projectName}:</span> {formData.projectName || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.rabNumber}:</span> {formData.rabNumber || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.portfolio}:</span> {formData.portfolio || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.subPortfolio}:</span> {formData.subPortfolio || 'N/A'}</p>
                                <p className="md:col-span-2"><span className="font-medium text-muted-foreground">{employeeFieldLabels.competency}:</span> {formData.competency || 'N/A'}</p>
                            </div>
                        </div>
                        {/* Step 2: Personal Details */}
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.id}:</span> {employee?.id || generatedId}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.name}:</span> {formData.name || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.nationalId}:</span> {formData.nationalId || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.placeOfBirth}:</span> {formData.placeOfBirth || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.dateOfBirth}:</span> {formData.dateOfBirth ? format(formData.dateOfBirth, 'PPP') : 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.gender}:</span> {formData.gender || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.religion}:</span> {formData.religion || 'N/A'}</p>
                                <p className="md:col-span-2"><span className="font-medium text-muted-foreground">{employeeFieldLabels.address}:</span> {formData.address || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.email}:</span> {formData.email || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.phoneNumber}:</span> {formData.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>
                        {/* Step 3: Employment */}
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Employment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.employmentStatus}:</span> {formData.employmentStatus || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.bpjsHealth}:</span> {formData.bpjsHealth || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.bpjsEmployment}:</span> {formData.bpjsEmployment || 'N/A'}</p>
                            </div>
                        </div>
                        {/* Step 4: Contract */}
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Contract</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.contractType}:</span> {formData.contractType || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.contractNumber}:</span> {formData.contractNumber || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.contractStartDate}:</span> {formData.contractStartDate ? format(formData.contractStartDate, 'PPP') : 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.contractEndDate}:</span> {formData.contractEndDate ? format(formData.contractEndDate, 'PPP') : 'N/A'}</p>
                            </div>
                        </div>
                        {/* Step 5: Financial & Tax */}
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Financial & Tax</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.salary}:</span> {formData.salary ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(formData.salary) : 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.bankName}:</span> {formData.bankName || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.bankAccountNumber}:</span> {formData.bankAccountNumber || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.npwp}:</span> {formData.npwp || 'N/A'}</p>
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.ptkpStatus}:</span> {formData.ptkpStatus || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogCancel>Go Back & Edit</AlertDialogCancel>
                    <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>Confirm & Save</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
