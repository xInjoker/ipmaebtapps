'use client';

import { useState, useEffect } from 'react';
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

type InvoiceItem = {
  id: number;
  spkNumber: string;
  serviceCategory: string;
  status: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced';
  period: string;
  value: number;
};

type Project = {
  id: number;
  contractNumber: string;
  name: string;
  client: string;
  description: string;
  value: number;
  cost: number;
  invoiced: number;
  period: string;
  duration: string;
  progress: number;
  invoices: InvoiceItem[];
};

const initialProjects: Project[] = [
  { id: 1, contractNumber: 'CN-001', name: 'Corporate Website Revamp', client: 'Acme Inc.', description: 'A complete overhaul of the corporate website to improve user experience and modernize the design.', value: 2500000000, cost: 1800000000, invoiced: 2000000000, period: '2024-2025', duration: '12 Months', progress: 75, invoices: [
      { id: 1, spkNumber: 'SPK-001', serviceCategory: 'Design Phase', status: 'Paid', period: 'January 2024', value: 500000000 },
      { id: 2, spkNumber: 'SPK-002', serviceCategory: 'Development - Sprint 1', status: 'Paid', period: 'April 2024', value: 750000000 },
      { id: 3, spkNumber: 'SPK-003', serviceCategory: 'Development - Sprint 2', status: 'Invoiced', period: 'July 2024', value: 750000000 },
      { id: 4, spkNumber: 'SPK-004', serviceCategory: 'Final Deployment', status: 'Invoiced', period: 'October 2024', value: 500000000 },
  ]},
  { id: 2, contractNumber: 'CN-002', name: 'Mobile App Development', client: 'Stark Industries', description: 'Development of a new cross-platform mobile application for internal use.', value: 5000000000, cost: 3500000000, invoiced: 2500000000, period: '2024-2026', duration: '24 Months', progress: 40, invoices: [
      { id: 1, spkNumber: 'SPK-005', serviceCategory: 'Discovery & Planning', status: 'Paid', period: 'February 2024', value: 1000000000 },
      { id: 2, spkNumber: 'SPK-006', serviceCategory: 'UI/UX Design', status: 'Invoiced', period: 'May 2024', value: 1500000000 },
      { id: 3, spkNumber: 'SPK-007', serviceCategory: 'Backend Development', status: 'Invoiced', period: 'August 2024', value: 1500000000 },
      { id: 4, spkNumber: 'SPK-008', serviceCategory: 'Frontend Development', status: 'Cancel', period: 'November 2024', value: 1000000000 },
  ]},
  { id: 3, contractNumber: 'CN-003', name: 'Data Analytics Platform', client: 'Wayne Enterprises', description: 'Building a scalable data platform to provide business intelligence insights.', value: 3200000000, cost: 2800000000, invoiced: 3000000000, period: '2023-2024', duration: '18 Months', progress: 90, invoices: [
      { id: 1, spkNumber: 'SPK-009', serviceCategory: 'Infrastructure Setup', status: 'Paid', period: 'December 2023', value: 1000000000 },
      { id: 2, spkNumber: 'SPK-010', serviceCategory: 'Data Pipeline', status: 'Paid', period: 'March 2024', value: 1500000000 },
      { id: 3, spkNumber: 'SPK-011', serviceCategory: 'Dashboard Development', status: 'Re-invoiced', period: 'June 2024', value: 500000000 },
      { id: 4, spkNumber: 'SPK-012', serviceCategory: 'User Training', status: 'Cancel', period: 'June 2024', value: 200000000 },
  ]},
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    contractNumber: '',
    name: '',
    client: '',
    description: '',
    value: 0,
    period: '',
    duration: '',
    progress: 0,
  });
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const totalProjectValue = projects.reduce((acc, project) => acc + project.value, 0);
  const totalCost = projects.reduce((acc, project) => acc + project.cost, 0);
  const totalInvoiced = projects.reduce((acc, project) => acc + project.invoiced, 0);
  const totalPaid = projects.reduce((acc, project) => {
    const projectPaid = project.invoices
      .filter((invoice) => invoice.status === 'Paid')
      .reduce((invoiceAcc, invoice) => invoiceAcc + invoice.value, 0);
    return acc + projectPaid;
  }, 0);

  useEffect(() => {
    if (date?.from && date?.to) {
      const fromDate = date.from;
      const toDate = date.to;
      const periodString = `${format(fromDate, "yyyy")}-${format(toDate, "yyyy")}`;
      
      let months = (toDate.getFullYear() - fromDate.getFullYear()) * 12;
      months -= fromDate.getMonth();
      months += toDate.getMonth();
      const duration = months <= 0 ? 1 : months + 1;
      const durationString = `${duration} Months`;

      setNewProject(prev => ({
        ...prev,
        period: periodString,
        duration: durationString,
      }));
    } else {
       setNewProject(prev => ({
        ...prev,
        period: '',
        duration: '',
      }));
    }
  }, [date]);


  const handleAddProject = () => {
    if (newProject.name && newProject.client && newProject.description && newProject.value > 0 && newProject.contractNumber && newProject.period && newProject.duration) {
      const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
      setProjects([...projects, { ...newProject, id: newId, cost: 0, invoiced: 0, invoices: [] }]);
      setNewProject({ contractNumber: '', name: '', client: '', description: '', value: 0, period: '', duration: '', progress: 0 });
      setDate(undefined);
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
              Across {projects.length} projects
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
                  value={newProject.duration}
                  className="col-span-3"
                  placeholder="Calculated automatically"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="progress" className="text-right">
                  Progress (%)
                </Label>
                <Input
                  id="progress"
                  type="number"
                  value={newProject.progress || ''}
                  onChange={(e) => setNewProject({ ...newProject, progress: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
                  placeholder="e.g. 75"
                  min="0"
                  max="100"
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
        {projects.map((project) => {
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
