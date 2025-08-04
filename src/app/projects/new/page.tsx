

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { ArrowLeft, Calendar as CalendarIcon, Save, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  type Project,
} from '@/lib/projects';
import { portfolios, subPortfolios, servicesBySubPortfolio } from '@/lib/projects';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { CurrencyInput } from '@/components/ui/currency-input';

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject } = useProjects();
  const { user, isHqUser, branches } = useAuth();
  const { toast } = useToast();

  const [newProject, setNewProject] = useState({
    contractNumber: '',
    rabNumber: '',
    name: '',
    client: '',
    description: '',
    value: 0,
    contractExecutor: '',
    portfolio: '',
    subPortfolio: '',
    serviceCode: '',
    serviceName: '',
  });
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');

  const availableServices = useMemo(() => {
    if (!newProject.subPortfolio) return [];
    return servicesBySubPortfolio[newProject.subPortfolio as keyof typeof servicesBySubPortfolio] || [];
  }, [newProject.subPortfolio]);

  useEffect(() => {
    if (!isHqUser && user) {
      setNewProject(prev => ({...prev, contractExecutor: user.branchId}));
    }
  }, [isHqUser, user]);
  

  const { period, duration } = useMemo(() => {
    if (date?.from && date?.to) {
      const fromDate = date.from;
      const toDate = date.to;
      const periodString = `${format(fromDate, 'MMMM yyyy')} - ${format(toDate, 'MMMM yyyy')}`;

      const durationValue = differenceInMonths(toDate, fromDate) + 1;
      const durationString = `${durationValue} ${
        durationValue > 1 ? 'Months' : 'Month'
      }`;

      return { period: periodString, duration: durationString };
    }
    return { period: '', duration: '' };
  }, [date]);

  const handleAddProject = useCallback(async () => {
    setSubmissionStatus('loading');
    const assignedBranchId = isHqUser ? newProject.contractExecutor : user?.branchId;

    if (
      !newProject.contractNumber ||
      !newProject.rabNumber ||
      !newProject.name ||
      !newProject.client ||
      !newProject.description ||
      !assignedBranchId ||
      newProject.value <= 0 ||
      !date?.from ||
      !date.to
    ) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please fill out all fields, including executor, a positive value and a complete date range.',
      });
      setSubmissionStatus('idle');
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not determine user. Please try logging in again.',
      });
       setSubmissionStatus('idle');
      return;
    }

    const executorName = branches.find(b => b.id === assignedBranchId)?.name;
    if (!executorName) {
        toast({
            variant: 'destructive',
            title: 'Invalid Branch',
            description: 'The selected contract executor branch is not valid.',
        });
        setSubmissionStatus('idle');
        return;
    }

    const { contractExecutor, ...restOfNewProject } = newProject;

    const projectToAdd: Omit<Project, 'id'> = {
      ...restOfNewProject,
      branchId: assignedBranchId,
      contractExecutor: executorName,
      period,
      duration,
      contractStartDate: format(date.from, 'yyyy-MM-dd'),
      contractEndDate: format(date.to, 'yyyy-MM-dd'),
      serviceOrders: [],
      invoices: [],
      budgets: {},
      costs: [],
      tripApprovalWorkflow: [],
      reportApprovalWorkflow: [],
    };

    try {
        await addProject(projectToAdd);
        toast({
            title: 'Project Added',
            description: `Project "${newProject.name}" has been successfully created.`,
        });
        // Use a short timeout to allow the toast to render before navigation
        setTimeout(() => router.push('/projects'), 500);
    } catch (error) {
        console.error("Failed to add project", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save the project to the database.',
        });
        setSubmissionStatus('error');
    }
  }, [addProject, branches, date, duration, isHqUser, newProject, period, router, toast, user]);

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
            <CardTitle>Add New Project</CardTitle>
            <CardDescription>Fill in the details for the new project.</CardDescription>
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
                <Select value={newProject.portfolio} onValueChange={(value) => setNewProject({ ...newProject, portfolio: value })}>
                    <SelectTrigger id="portfolio"><SelectValue placeholder="Select a portfolio" /></SelectTrigger>
                    <SelectContent>{portfolios.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="subPortfolio">Sub-Portfolio</Label>
                <Select value={newProject.subPortfolio} onValueChange={(value) => { setNewProject({ ...newProject, subPortfolio: value, serviceCode: '', serviceName: '' }); }}>
                    <SelectTrigger id="subPortfolio"><SelectValue placeholder="Select a sub-portfolio" /></SelectTrigger>
                    <SelectContent>{subPortfolios.map((sp) => (<SelectItem key={sp} value={sp}>{sp}</SelectItem>))}</SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="serviceCode">Service Code</Label>
                <Select value={newProject.serviceCode} onValueChange={(value) => { const service = availableServices.find(s => s.code === value); setNewProject({ ...newProject, serviceCode: value, serviceName: service?.name || '' }); }} disabled={!newProject.subPortfolio}>
                    <SelectTrigger id="serviceCode"><SelectValue placeholder="Select a service code" /></SelectTrigger>
                    <SelectContent>{availableServices.map((s) => (<SelectItem key={s.code} value={s.code}>{s.code}</SelectItem>))}</SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name</Label>
                <Select value={newProject.serviceName} onValueChange={(value) => { const service = availableServices.find(s => s.name === value); setNewProject({ ...newProject, serviceName: value, serviceCode: service?.code || '' }); }} disabled={!newProject.subPortfolio}>
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
                        <Select value={newProject.contractExecutor} onValueChange={(value) => setNewProject({ ...newProject, contractExecutor: value })}>
                        <SelectTrigger id="contractExecutor"><SelectValue placeholder="Select a branch" /></SelectTrigger>
                        <SelectContent>{branches.map((branch) => (<SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>))}</SelectContent>
                        </Select>
                    ) : (
                        <Input id="contractExecutor" value={branches.find((b) => b.id === user?.branchId)?.name || ''} disabled />
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Input id="client" value={newProject.client} onChange={(e) => setNewProject({ ...newProject, client: e.target.value })} placeholder="Client name" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Contract Title</Label>
                    <Textarea id="name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="Enter the full contract title" rows={3} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contractNumber">Contract No.</Label>
                    <Input id="contractNumber" value={newProject.contractNumber} onChange={(e) => setNewProject({ ...newProject, contractNumber: e.target.value })} placeholder="Contract number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rabNumber">RAB No.</Label>
                    <Input id="rabNumber" value={newProject.rabNumber} onChange={(e) => setNewProject({ ...newProject, rabNumber: e.target.value })} placeholder="RAB number" />
                </div>
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Timeline & Value</h3>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button id="period" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                    </PopoverContent>
                </Popover>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" value={duration} placeholder="Calculated automatically" readOnly />
                </div>
                <div className="space-y-2">
                <Label htmlFor="value">Value (IDR)</Label>
                <CurrencyInput
                    id="value"
                    value={newProject.value}
                    onValueChange={(value) => setNewProject({ ...newProject, value })}
                    placeholder="Contract value"
                />
                </div>
            </div>
        </div>
         <div className="space-y-4">
            <h3 className="font-semibold text-lg">Description</h3>
            <Separator />
            <div className="grid gap-6">
                <div className="space-y-2">
                    <Textarea id="description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="A short description of the project." rows={3} />
                </div>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" asChild><Link href="/projects">Cancel</Link></Button>
        <Button onClick={handleAddProject} disabled={submissionStatus === 'loading'}>
            {submissionStatus === 'loading' ? (
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

