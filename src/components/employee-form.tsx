
'use client';

import { useForm, Controller } from 'react-hook-form';
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
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, File as FileIcon, Upload, X } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { cn, getFileNameFromDataUrl } from '@/lib/utils';
import { format } from 'date-fns';
import {
  type Employee,
  employeeFieldLabels,
  genders,
  employmentStatuses,
  contractTypes,
  portfolios,
  subPortfolios,
  religions,
} from '@/lib/employees';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/context/ProjectContext';
import { useEmployees } from '@/context/EmployeeContext';
import { CurrencyInput } from './ui/currency-input';
import type { InspectorDocument } from '@/lib/inspectors';

const employeeSchema = z.object({
  // Step 1: Work & Project
  reportingManagerId: z.string().optional().nullable(),
  position: z.string().optional(),
  workUnit: z.string().optional(),
  workUnitName: z.string().optional(),
  portfolio: z.enum(portfolios).optional(),
  subPortfolio: z.enum(subPortfolios).optional(),
  projectName: z.string().optional(),
  rabNumber: z.string().optional(),
  competency: z.string().optional(),
  
  // Step 2: Personal Details
  name: z.string().optional(),
  nationalId: z.string().optional(),
  placeOfBirth: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(genders).optional(),
  religion: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
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

type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (data: Employee, newDocs: { newCvFile: File | null, newQualifications: NewUploadableDocument[], newOtherDocs: NewUploadableDocument[] }) => void;
}

const steps = [
  { id: 1, name: 'Work & Project' },
  { id: 2, name: 'Personal Details' },
  { id: 3, name: 'Employment' },
  { id: 4, name: 'Contract' },
  { id: 5, name: 'Financial & Tax' },
  { id: 6, name: 'Documents' },
];

export function EmployeeForm({ employee, onSave }: EmployeeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { branches } = useAuth();
  const { employees } = useEmployees();
  const { projects } = useProjects();
  const { employeeId, generatedId } = useMemo(() => {
    const id = employee?.id || `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return { employeeId: id, generatedId: id };
  }, [employee]);

  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [newQualifications, setNewQualifications] = useState<NewUploadableDocument[]>([]);
  const [newOtherDocs, setNewOtherDocs] = useState<NewUploadableDocument[]>([]);

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
    const finalData: Employee = {
      ...employee,
      ...data,
      id: employeeId,
      dateOfBirth: data.dateOfBirth ? format(data.dateOfBirth, 'yyyy-MM-dd') : undefined,
      contractStartDate: data.contractStartDate ? format(data.contractStartDate, 'yyyy-MM-dd') : undefined,
      contractEndDate: data.contractEndDate ? format(data.contractEndDate, 'yyyy-MM-dd') : undefined,
    };
    onSave(finalData, { newCvFile, newQualifications, newOtherDocs });
  }, [employee, employeeId, onSave, newCvFile, newQualifications, newOtherDocs]);

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
  
  const handleFileChange = useCallback((setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, expirationDate: undefined }));
      setter(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeNewFile = useCallback((setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleNewDocDateChange = useCallback((setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, index: number, date?: Date) => {
    setter(prev => {
        const newDocs = [...prev];
        newDocs[index].expirationDate = date ? format(date, 'yyyy-MM-dd') : undefined;
        return newDocs;
    });
  }, []);

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
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Reporting Manager</Label>
                            <Select onValueChange={(v) => form.setValue('reportingManagerId', v)} value={form.watch('reportingManagerId') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a manager..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={''}>None</SelectItem>
                                    {employees.filter(e => e.id !== employee?.id).map(mgr => (
                                        <SelectItem key={mgr.id} value={mgr.id}>{mgr.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Position</Label>
                            <Input {...form.register('position')} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Branch</Label>
                            <Select onValueChange={(v) => { form.setValue('workUnit', v); form.setValue('projectName', ''); form.setValue('rabNumber', ''); }} value={form.watch('workUnit') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a branch..."/></SelectTrigger>
                                <SelectContent>
                                    {branches.map(branch => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
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

                        <div className="space-y-2">
                            <Label>RAB Number</Label>
                            <Input {...form.register('rabNumber')} readOnly />
                        </div>

                        <div className="space-y-2">
                            <Label>Portfolio</Label>
                            <Select onValueChange={(v) => form.setValue('portfolio', v as any)} value={form.watch('portfolio') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a portfolio..."/></SelectTrigger>
                                <SelectContent>
                                  {portfolios.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sub-Portfolio</Label>
                            <Select onValueChange={(v) => form.setValue('subPortfolio', v as any)} value={form.watch('subPortfolio') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a sub-portfolio..."/></SelectTrigger>
                                <SelectContent>
                                  {subPortfolios.map(sp => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Competency</Label>
                            <Textarea {...form.register('competency')} />
                        </div>
                    </div>
                )}
                {currentStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Employee ID</Label><Input value={employeeId} readOnly /></div>
                        <div className="space-y-2"><Label>Full Name</Label><Input {...form.register('name')} /></div>
                        <div className="space-y-2"><Label>National ID (KTP)</Label><Input {...form.register('nationalId')} /></div>
                        <div className="space-y-2"><Label>Place of Birth</Label><Input {...form.register('placeOfBirth')} /></div>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch('dateOfBirth') && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{form.watch('dateOfBirth') ? format(form.watch('dateOfBirth')!, 'PPP') : <span>Pick a date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('dateOfBirth')} onSelect={(d) => form.setValue('dateOfBirth', d)} initialFocus /></PopoverContent></Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select onValueChange={(v) => form.setValue('gender', v as any)} value={form.watch('gender') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a gender..."/></SelectTrigger>
                                <SelectContent>
                                    {genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Religion</Label>
                            <Select onValueChange={(v) => form.setValue('religion', v)} value={form.watch('religion') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a religion..."/></SelectTrigger>
                                <SelectContent>
                                    {religions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2"><Label>Address</Label><Textarea {...form.register('address')} /></div>
                        <div className="space-y-2"><Label>Email</Label><Input type="email" {...form.register('email')} /></div>
                        <div className="space-y-2"><Label>Phone Number</Label><Input {...form.register('phoneNumber')} /></div>
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Employment Status</Label>
                            <Select onValueChange={(v) => form.setValue('employmentStatus', v as any)} value={form.watch('employmentStatus') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a status..."/></SelectTrigger>
                                <SelectContent>
                                    {employmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>BPJS Health Number</Label><Input {...form.register('bpjsHealth')} /></div>
                        <div className="space-y-2"><Label>BPJS Employment Number</Label><Input {...form.register('bpjsEmployment')} /></div>
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Contract Type</Label>
                            <Select onValueChange={(v) => form.setValue('contractType', v as any)} value={form.watch('contractType') || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a type..."/></SelectTrigger>
                                <SelectContent>
                                    {contractTypes.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2"><Label>Contract Number</Label><Input {...form.register('contractNumber')} /></div>
                        <div className="space-y-2">
                            <Label>Contract Start Date</Label>
                            <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch('contractStartDate') && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{form.watch('contractStartDate') ? format(form.watch('contractStartDate')!, 'PPP') : <span>Pick a date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('contractStartDate')} onSelect={(d) => form.setValue('contractStartDate', d)} initialFocus /></PopoverContent></Popover>
                        </div>
                        <div className="space-y-2">
                            <Label>Contract End Date</Label>
                            <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.watch('contractEndDate') && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{form.watch('contractEndDate') ? format(form.watch('contractEndDate')!, 'PPP') : <span>Pick a date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('contractEndDate')} onSelect={(d) => form.setValue('contractEndDate', d)} initialFocus /></PopoverContent></Popover>
                        </div>
                    </div>
                )}
                {currentStep === 4 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Salary</Label>
                            <Controller
                                name="salary"
                                control={form.control}
                                render={({ field }) => (
                                    <CurrencyInput
                                        value={field.value || 0}
                                        onValueChange={field.onChange}
                                    />
                                )}
                            />
                        </div>
                        <div className="space-y-2"><Label>Bank Name</Label><Input {...form.register('bankName')} /></div>
                        <div className="space-y-2"><Label>Bank Account Number</Label><Input {...form.register('bankAccountNumber')} /></div>
                        <div className="space-y-2"><Label>NPWP Number</Label><Input {...form.register('npwp')} /></div>
                        <div className="space-y-2"><Label>PTKP Status</Label><Input {...form.register('ptkpStatus')} /></div>
                    </div>
                )}
                {currentStep === 5 && (
                  <div className="space-y-6">
                      <div className="space-y-2">
                          <Label>Curriculum Vitae (CV)</Label>
                          {employee?.cvUrl && <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50"><div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="text-sm truncate">{getFileNameFromDataUrl(employee.cvUrl)}</span></div></div>}
                          {newCvFile && <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50"><div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="text-sm truncate">{newCvFile.name}</span></div><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewCvFile(null)}><X className="h-4 w-4" /></Button></div>}
                          <div className="flex items-center justify-center w-full mt-2"><label htmlFor="cv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload new CV</span></p></div><Input id="cv-upload" type="file" className="hidden" onChange={(e) => setNewCvFile(e.target.files ? e.target.files[0] : null)} /></label></div>
                      </div>
                      <div className="space-y-2">
                          <Label>Qualification Certificates</Label>
                          <div className="mt-2 space-y-2">
                              {newQualifications.map((doc, index) => (
                                <div key={`new-qual-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                                    <div className="flex items-center gap-2 truncate flex-1">
                                        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm truncate">{doc.file.name}</span>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !doc.expirationDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {doc.expirationDate ? format(new Date(doc.expirationDate), "PPP") : <span>Expiry date (optional)</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={doc.expirationDate ? new Date(doc.expirationDate) : undefined} onSelect={(date) => handleNewDocDateChange(setNewQualifications, index, date)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNewFile(setNewQualifications, index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                              ))}
                          </div>
                          <div className="flex items-center justify-center w-full mt-4"><label htmlFor="qual-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p></div><Input id="qual-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(setNewQualifications, e)} /></label></div>
                      </div>
                      <div className="space-y-2">
                          <Label>Other Documents</Label>
                          <div className="mt-2 space-y-2">
                              {newOtherDocs.map((doc, index) => (
                                <div key={`new-other-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                                    <div className="flex items-center gap-2 truncate flex-1">
                                        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <span className="text-sm truncate">{doc.file.name}</span>
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !doc.expirationDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {doc.expirationDate ? format(new Date(doc.expirationDate), "PPP") : <span>Expiry date (optional)</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={doc.expirationDate ? new Date(doc.expirationDate) : undefined} onSelect={(date) => handleNewDocDateChange(setNewOtherDocs, index, date)} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNewFile(setNewOtherDocs, index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                              ))}
                          </div>
                          <div className="flex items-center justify-center w-full mt-4"><label htmlFor="other-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p></div><Input id="other-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(setNewOtherDocs, e)} /></label></div>
                      </div>
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
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.reportingManagerId}:</span> {employees.find(e => e.id === formData.reportingManagerId)?.name || 'N/A'}</p>
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
                                <p><span className="font-medium text-muted-foreground">{employeeFieldLabels.id}:</span> {employeeId}</p>
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
                        {/* Step 6: Documents */}
                        <div>
                            <h3 className="font-semibold mb-2 text-lg border-b pb-1">Documents</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                                 <div><span className="font-medium text-muted-foreground">CV:</span> {newCvFile?.name || 'No new CV'}</div>
                                 <div><span className="font-medium text-muted-foreground">Qualifications:</span> {newQualifications.length} new file(s)</div>
                                 <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Other Documents:</span> {newOtherDocs.length} new file(s)</div>
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
    </>
  );
}
