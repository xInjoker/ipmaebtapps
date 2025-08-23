

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Save, Loader2, ArrowLeft, Upload, File as FileIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, differenceInMonths, parse } from 'date-fns';
import { cn, getFileNameFromDataUrl } from '@/lib/utils';
import {
  type Project,
  portfolios,
  subPortfolios,
  servicesBySubPortfolio,
  type ProjectDocument,
} from '@/lib/projects';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { CurrencyInput } from '@/components/ui/currency-input';
import Link from 'next/link';
import { DateRangePicker } from './ui/date-picker';
import { useProjects } from '@/context/ProjectContext';

interface ProjectFormProps {
  project?: Project | null;
  onSave: (projectData: Partial<Project>, newDocs: { contractFile: File | null, rabFile: File | null, otherFiles: File[] }) => Promise<void>;
  isLoading: boolean;
}

export function ProjectForm({ project, onSave, isLoading }: ProjectFormProps) {
  const { user, isHqUser, branches, users, roles } = useAuth();
  const { projects } = useProjects();
  const [formData, setFormData] = useState<Partial<Project>>({});
  
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [rabFile, setRabFile] = useState<File | null>(null);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);

  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const projectManagers = useMemo(() => {
    const projectManagerRole = roles.find(r => r.id === 'project-manager');
    if (!projectManagerRole) return [];
    return users.filter(u => u.roleId === projectManagerRole.id);
  }, [users, roles]);

  useEffect(() => {
    if (project) {
        setFormData({
            ...project,
            value: typeof project.value === 'number' ? project.value : 0,
        });
        if (project.contractStartDate && project.contractEndDate) {
            setDate({
                from: parse(project.contractStartDate, 'yyyy-MM-dd', new Date()),
                to: parse(project.contractEndDate, 'yyyy-MM-dd', new Date()),
            });
        }
    } else {
        if (!isHqUser && user) {
            setFormData(prev => ({...prev, contractExecutor: user.branchId}));
        }
        if (user?.roleId === 'project-manager') {
          setFormData(prev => ({...prev, projectManagerId: user.uid}));
        } else {
          setFormData(prev => ({...prev, projectManagerId: null}));
        }
    }
  }, [project, user, isHqUser, roles]);

  const availableServices = useMemo(() => {
    if (!formData.subPortfolio) return [];
    return servicesBySubPortfolio[formData.subPortfolio as keyof typeof servicesBySubPortfolio] || [];
  }, [formData.subPortfolio]);

  const { period, duration } = useMemo(() => {
    if (date?.from && date?.to) {
      const fromDate = date.from;
      const toDate = date.to;
      const periodString = `${format(fromDate, 'MMMM yyyy')} - ${format(toDate, 'MMMM yyyy')}`;

      const durationValue = differenceInMonths(toDate, fromDate) + 1;
      const durationString = `${durationValue} ${durationValue > 1 ? 'Months' : 'Month'}`;

      return { period: periodString, duration: durationString };
    }
    return { period: '', duration: '' };
  }, [date]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value }));
  }, []);
  
  const handleSelectChange = useCallback((field: keyof Project, value: any) => {
    const updates: Partial<Project> = { [field]: value };
    if (field === 'subPortfolio') {
        updates.serviceCode = '';
        updates.serviceName = '';
    }
    if (field === 'serviceCode') {
        const service = availableServices.find(s => s.code === value);
        updates.serviceName = service?.name || '';
    }
    if (field === 'serviceName') {
        const service = availableServices.find(s => s.name === value);
        updates.serviceCode = service?.code || '';
    }
    setFormData(prev => ({...prev, ...updates}));
  }, [availableServices]);
  
  const handleCurrencyChange = useCallback((value: number) => {
      setFormData(prev => ({...prev, value}));
  }, []);
  
  const handleFileChange = useCallback((setter: React.Dispatch<React.SetStateAction<File | null>>, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setter(e.target.files[0] || null);
    }
  }, []);
  
  const handleMultipleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setOtherFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  }, []);
  
  const removeOtherFile = useCallback((index: number) => {
    setOtherFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingDocument = (docType: 'contract' | 'rab' | 'other', urlToRemove: string) => {
    setFormData(prev => {
        if (!prev) return prev;
        if (docType === 'contract') return { ...prev, contractUrl: undefined };
        if (docType === 'rab') return { ...prev, rabUrl: undefined };
        if (docType === 'other') {
            return {
                ...prev,
                otherDocumentUrls: (prev.otherDocumentUrls || []).filter(doc => doc.url !== urlToRemove),
            };
        }
        return prev;
    });
  };

  const handleSubmit = useCallback(() => {
    const finalFormData: Partial<Project> = {
        ...formData,
        period,
        duration,
        contractStartDate: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
        contractEndDate: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
    };
    onSave(finalFormData, { contractFile, rabFile, otherFiles });
  }, [formData, onSave, date, period, duration, contractFile, rabFile, otherFiles]);

  const executorBranchName = useMemo(() => {
      if(isHqUser) {
        return branches.find(b => b.id === formData.contractExecutor)?.name;
      }
      return branches.find(b => b.id === user?.branchId)?.name;
  }, [isHqUser, branches, formData.contractExecutor, user?.branchId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Projects</span>
            </Link>
          </Button>
          <div className="space-y-1.5">
            <CardTitle>{project ? 'Edit Project' : 'Add New Project'}</CardTitle>
            <CardDescription>{project ? `Update details for ${project.name}` : 'Fill in the details for the new project.'}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Service & Classification</h3>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Select value={formData.portfolio || ''} onValueChange={(value: (typeof portfolios)[number]) => handleSelectChange('portfolio', value)}>
                        <SelectTrigger id="portfolio"><SelectValue placeholder="Select a portfolio" /></SelectTrigger>
                        <SelectContent>{portfolios.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subPortfolio">Sub-Portfolio</Label>
                    <Select value={formData.subPortfolio || ''} onValueChange={(value: (typeof subPortfolios)[number]) => handleSelectChange('subPortfolio', value)}>
                        <SelectTrigger id="subPortfolio"><SelectValue placeholder="Select a sub-portfolio" /></SelectTrigger>
                        <SelectContent>{subPortfolios.map((sp) => (<SelectItem key={sp} value={sp}>{sp}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="serviceCode">Service Code</Label>
                    <Select value={formData.serviceCode || ''} onValueChange={(value: string) => handleSelectChange('serviceCode', value)} disabled={!formData.subPortfolio}>
                        <SelectTrigger id="serviceCode"><SelectValue placeholder="Select a service code" /></SelectTrigger>
                        <SelectContent>{availableServices.map((s) => (<SelectItem key={s.code} value={s.code}>{s.code}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Select value={formData.serviceName || ''} onValueChange={(value: string) => handleSelectChange('serviceName', value)} disabled={!formData.subPortfolio}>
                        <SelectTrigger id="serviceName"><SelectValue placeholder="Select a service name" /></SelectTrigger>
                        <SelectContent>{availableServices.map((s) => (<SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contract Information</h3>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="contractExecutor">Contract Executor</Label>
                    {isHqUser ? (
                        <Select value={formData.contractExecutor || ''} onValueChange={(value) => handleSelectChange('contractExecutor', value)}>
                        <SelectTrigger id="contractExecutor"><SelectValue placeholder="Select a branch" /></SelectTrigger>
                        <SelectContent>{branches.map((branch) => (<SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>))}</SelectContent>
                        </Select>
                    ) : (
                        <Input id="contractExecutor" value={executorBranchName || ''} disabled />
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Input id="client" value={formData.client || ''} onChange={handleInputChange} placeholder="Client name" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="projectManager">Project Manager</Label>
                    <Select value={formData.projectManagerId || 'unassigned'} onValueChange={(value) => handleSelectChange('projectManagerId', value === 'unassigned' ? null : value)}>
                        <SelectTrigger id="projectManager"><SelectValue placeholder="Assign a Project Manager" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {projectManagers.map((pm) => (<SelectItem key={pm.uid} value={pm.uid}>{pm.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Contract Title</Label>
                    <Textarea id="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Enter the full contract title" rows={3} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contractNumber">Contract No.</Label>
                    <Input id="contractNumber" value={formData.contractNumber || ''} onChange={handleInputChange} placeholder="Contract number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rabNumber">RAB No.</Label>
                    <Input id="rabNumber" value={formData.rabNumber || ''} onChange={handleInputChange} placeholder="RAB number" />
                </div>
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Timeline & Value</h3>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="period">Period</Label>
                    <DateRangePicker value={date} onChange={setDate} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" value={duration} placeholder="Calculated automatically" readOnly />
                </div>
                <div className="space-y-2">
                <Label htmlFor="value">Value (IDR)</Label>
                <CurrencyInput
                    id="value"
                    value={formData.value || 0}
                    onValueChange={handleCurrencyChange}
                    placeholder="Contract value"
                />
                </div>
            </div>
        </div>
         <div className="space-y-4">
            <h3 className="font-semibold text-lg">Documents</h3>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="contract-upload">Contract Document</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="contract-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                            </div>
                            <Input id="contract-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(setContractFile, e)} />
                        </label>
                    </div>
                    {contractFile && (
                        <div className="mt-2 flex items-center justify-between p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4" /><span className="text-sm truncate">{contractFile.name}</span></div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setContractFile(null)}><X className="h-4 w-4" /></Button>
                        </div>
                    )}
                    {formData.contractUrl && !contractFile && (
                        <div className="mt-2 flex items-center justify-between p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4" /><span className="text-sm truncate">{getFileNameFromDataUrl(formData.contractUrl)}</span></div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingDocument('contract', formData.contractUrl!)}><X className="h-4 w-4" /></Button>
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rab-upload">RAB Document</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="rab-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                            </div>
                            <Input id="rab-upload" type="file" className="hidden" accept=".pdf,.xls,.xlsx" onChange={(e) => handleFileChange(setRabFile, e)} />
                        </label>
                    </div>
                    {rabFile && (
                        <div className="mt-2 flex items-center justify-between p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4" /><span className="text-sm truncate">{rabFile.name}</span></div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRabFile(null)}><X className="h-4 w-4" /></Button>
                        </div>
                    )}
                     {formData.rabUrl && !rabFile && (
                        <div className="mt-2 flex items-center justify-between p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4" /><span className="text-sm truncate">{getFileNameFromDataUrl(formData.rabUrl)}</span></div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingDocument('rab', formData.rabUrl!)}><X className="h-4 w-4" /></Button>
                        </div>
                    )}
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="other-docs-upload">Other Supporting Documents</Label>
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="other-docs-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                            </div>
                            <Input id="other-docs-upload" type="file" className="hidden" multiple onChange={handleMultipleFileChange} />
                        </label>
                    </div>
                     <div className="mt-4 space-y-2">
                        {formData.otherDocumentUrls?.map((doc, index) => (
                             <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                <div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4" /><span className="text-sm truncate">{doc.name}</span></div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingDocument('other', doc.url)}><X className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        {otherFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                <div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4" /><span className="text-sm truncate">{file.name}</span></div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeOtherFile(index)}><X className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
         <div className="space-y-4">
            <h3 className="font-semibold text-lg">Description</h3>
            <Separator />
            <div className="grid gap-6">
                <div className="space-y-2">
                    <Textarea id="description" value={formData.description || ''} onChange={handleInputChange} placeholder="A short description of the project." rows={3} />
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" asChild><Link href="/projects">Cancel</Link></Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Save className="mr-2 h-4 w-4" />
            )}
            Save Project
        </Button>
      </CardFooter>
    </Card>
  );
}
