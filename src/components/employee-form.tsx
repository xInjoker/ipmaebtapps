

'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type Employee, employeeFieldLabels, genders, employmentStatuses, contractTypes, portfolios, subPortfolios, religions } from '@/lib/employees';
import { useState, useEffect, useCallback } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { EmployeeFormStep1 } from './employee-form-step1';
import { EmployeeFormStep2 } from './employee-form-step2';
import { EmployeeFormStep3 } from './employee-form-step3';
import { EmployeeFormStep4 } from './employee-form-step4';
import { EmployeeFormStep5 } from './employee-form-step5';
import { EmployeeFormStep6 } from './employee-form-step6';


const employeeSchema = z.object({
  // Step 1: Work & Project
  reportingManagerId: z.string().optional().nullable(),
  position: z.string().min(1, { message: "Position is required." }),
  workUnit: z.string().min(1, { message: "Branch is required." }),
  workUnitName: z.string().optional(),
  portfolio: z.enum(portfolios).optional(),
  subPortfolio: z.enum(subPortfolios).optional(),
  projectName: z.string().optional(),
  rabNumber: z.string().optional(),
  competency: z.string().optional(),
  
  // Step 2: Personal Details
  name: z.string().min(1, { message: "Full name is required." }),
  nationalId: z.string().optional(),
  placeOfBirth: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(genders).optional(),
  religion: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal('')),
  phoneNumber: z.string().optional(),

  // Step 3: Employment
  employmentStatus: z.enum(employmentStatuses).optional(),
  bpjsHealth: z.string().optional(),
  bpjsEmployment: z.string().optional(),

  // Step 4: Contract
  contractType: z.enum(contractTypes).optional(),
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

export type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

export type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (data: EmployeeFormData, newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }) => void;
  isLoading: boolean;
}

const steps = [
  { id: 1, name: 'Work & Project' },
  { id: 2, name: 'Personal Details' },
  { id: 3, name: 'Employment' },
  { id: 4, name: 'Contract' },
  { id: 5, name: 'Financial & Tax' },
  { id: 6, name: 'Documents' },
];

export function EmployeeForm({ employee, onSave, isLoading }: EmployeeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [newQualifications, setNewQualifications] = useState<NewUploadableDocument[]>([]);
  const [newOtherDocs, setNewOtherDocs] = useState<NewUploadableDocument[]>([]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        ...employee,
        reportingManagerId: employee.reportingManagerId || '',
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
  
  const onSubmit = useCallback((data: EmployeeFormData) => {
    onSave(data, { newCvFile, newQualifications, newOtherDocs });
  }, [onSave, newCvFile, newQualifications, newOtherDocs]);

  const handleReview = useCallback(async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setIsConfirmOpen(true);
    }
  }, [form]);

  const nextStep = useCallback(() => setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev)), []);
  const prevStep = useCallback(() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev)), []);
  
  const pageTitle = employee ? 'Edit Employee' : 'Add New Employee';
  const pageDescription = employee ? `Update details for ${employee.name}` : 'Fill in the details for the new employee.';
  
  const formData = form.watch();

  return (
    <>
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                    <Link href="/employees">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Employees</span>
                    </Link>
                    </Button>
                    <div className="space-y-1.5">
                        <CardTitle>{pageTitle}</CardTitle>
                        <CardDescription>{pageDescription}</CardDescription>
                    </div>
                </div>
                {/* Progress Indicator */}
                <div className="flex justify-between items-center px-4 py-2 mt-4 overflow-x-auto">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-shrink-0">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2",
                                currentStep > index ? "bg-primary text-primary-foreground border-primary" :
                                currentStep === index ? "border-primary" : "border-muted-foreground"
                            )}>
                                {step.id}
                            </div>
                            <p className={cn(
                                "ml-2 text-sm whitespace-nowrap",
                                currentStep === index ? "font-semibold text-primary" : "text-muted-foreground"
                            )}>
                                {step.name}
                            </p>
                            {index < steps.length - 1 && <div className="flex-1 h-px bg-border ml-4 w-8 md:w-16" />}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <form id="employee-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto p-4">
                    {currentStep === 0 && <EmployeeFormStep1 form={form} />}
                    {currentStep === 1 && <EmployeeFormStep2 form={form} />}
                    {currentStep === 2 && <EmployeeFormStep3 form={form} />}
                    {currentStep === 3 && <EmployeeFormStep4 form={form} />}
                    {currentStep === 4 && <EmployeeFormStep5 form={form} />}
                    {currentStep === 5 && (
                        <EmployeeFormStep6
                            employee={employee}
                            newCvFile={newCvFile}
                            setNewCvFile={setNewCvFile}
                            newQualifications={newQualifications}
                            setNewQualifications={setNewQualifications}
                            newOtherDocs={newOtherDocs}
                            setNewOtherDocs={setNewOtherDocs}
                        />
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
                    <Button type="button" onClick={handleReview} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                      Review & Save
                    </Button>
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
                        {Object.entries(formData).map(([key, value]) => {
                             if (!value || (typeof value === 'object' && !Array.isArray(value))) return null;
                             const label = employeeFieldLabels[key as keyof Employee];
                             const displayValue = value instanceof Date ? format(value, 'PPP') : value.toString();
                             return(
                                <div key={key} className="flex justify-between text-sm">
                                    <span className="font-medium text-muted-foreground">{label}:</span>
                                    <span>{displayValue}</span>
                                </div>
                             )
                        })}
                    </div>
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogCancel>Go Back & Edit</AlertDialogCancel>
                    <AlertDialogAction onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                      Confirm & Save
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
