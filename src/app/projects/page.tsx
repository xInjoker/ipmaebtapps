
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Calendar as CalendarIcon, CircleDollarSign, Wallet, TrendingUp, Landmark } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Textarea } from '@/components/ui/textarea';
import { type Project } from '@/lib/data';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';

export default function ProjectsPage() {
  const { projects, setProjects } = useProjects();
  const { user, isHqUser, branches } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    contractNumber: '',
    name: '',
    client: '',
    description: '',
    value: 0,
    branchId: '',
  });
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    if (isDialogOpen) {
      setNewProject({
        contractNumber: '',
        name: '',
        client: '',
        description: '',
        value: 0,
        branchId: '',
      });
      setDate(undefined);
    }
  }, [isDialogOpen]);

  const visibleProjects = useMemo(() => {
    if (isHqUser) return projects;
    if (!user) return [];
    return projects.filter(p => p.branchId === user.branchId);
  }, [projects, user, isHqUser]);

  const { totalProjectValue, totalCost, totalInvoiced, totalPaid } = useMemo(() => {
    const totalProjectValue = visibleProjects.reduce(
      (acc, project) => acc + project.value,
      0
    );
    const totalCost = visibleProjects.reduce((acc, project) => acc + project.cost, 0);
    const totalInvoiced = visibleProjects.reduce(
      (acc, project) => acc + project.invoiced,
      0
    );
    const totalPaid = visibleProjects.reduce((acc, project) => {
      const projectPaid = project.invoices
        .filter((invoice) => invoice.status === 'Paid' || invoice.status === 'PAD')
        .reduce((invoiceAcc, invoice) => invoiceAcc + invoice.value, 0);
      return acc + projectPaid;
    }, 0);

    return { totalProjectValue, totalCost, totalInvoiced, totalPaid };
  }, [visibleProjects]);


  const { period, duration } = useMemo(() => {
    if (date?.from && date?.to) {
      const fromDate = date.from;
      const toDate = date.to;
      const periodString =
        format(fromDate, 'yyyy') === format(toDate, 'yyyy')
          ? format(fromDate, 'yyyy')
          : `${format(fromDate, 'yyyy')}-${format(toDate, 'yyyy')}`;

      let months = (toDate.getFullYear() - fromDate.getFullYear()) * 12;
      months -= fromDate.getMonth();
      months += toDate.getMonth();
      const durationValue = months <= 0 ? 1 : months + 1;
      const durationString = `${durationValue} ${
        durationValue > 1 ? 'Months' : 'Month'
      }`;

      return { period: periodString, duration: durationString };
    }
    return { period: '', duration: '' };
  }, [date]);


  const handleAddProject = () => {
    const projectData = { ...newProject };

    if (isHqUser) {
        projectData.branchId = 'hq';
    } else if (user) {
        projectData.branchId = user.branchId;
    }
    
    if (projectData.name && projectData.client && projectData.description && projectData.value > 0 && projectData.contractNumber && period && duration && projectData.branchId) {
      const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
      setProjects([...projects, { ...projectData, period, duration, id: newId, cost: 0, invoiced: 0, progress: 0, invoices: [], budgets: {}, expenditures: [] }]);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Project Value
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
               {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(totalProjectValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {visibleProjects.length} projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cost
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
               {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total costs realized across all projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoiced
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
               {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(totalInvoiced)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total invoiced across all projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Paid
            </CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">
               {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total paid across all projects
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">Projects</h1>
          <p className="text-muted-foreground">A list of all your projects.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new project.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contractNumber" className="text-right">
                  Contract No.
                </Label>
                <Input
                  id="contractNumber"
                  value={newProject.contractNumber}
                  onChange={(e) => setNewProject({ ...newProject, contractNumber: e.target.value })}
                  className="col-span-3"
                  placeholder="Contract number"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Contract name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client
                </Label>
                <Input
                  id="client"
                  value={newProject.client}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                  className="col-span-3"
                  placeholder="Client name"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="col-span-3"
                  placeholder="A short description of the project."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value (IDR)
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={newProject.value || ''}
                  onChange={(e) => setNewProject({ ...newProject, value: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                  placeholder="Contract value"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right">
                  Period
                </Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="period"
                            variant={"outline"}
                            className={cn(
                                "col-span-3 justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  value={duration}
                  className="col-span-3"
                  placeholder="Calculated automatically"
                  readOnly
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProject}>
                Add Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => {
          const progress = project.value > 0 ? Math.round((project.invoiced / project.value) * 100) : 0;
          return (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="font-headline">{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium">{project.client}</p>
                  </div>
                   <div className="flex justify-between text-sm">
                      <p className="text-muted-foreground">Contract No.</p>
                      <p className="font-medium">{project.contractNumber}</p>
                  </div>
                   <div className="flex justify-between text-sm">
                      <p className="text-muted-foreground">Period</p>
                      <p className="font-medium">{project.period}</p>
                  </div>
                   <div className="flex justify-between text-sm">
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{project.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Value</p>
                    <p className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(project.value)}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-sm font-semibold">{progress}%</p>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" asChild>
                  <Link href={`/projects/${project.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
