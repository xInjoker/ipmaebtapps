'use client';

import { useState } from 'react';
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
import { PlusCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type Project = {
  id: number;
  contractNumber: string;
  name: string;
  client: string;
  value: number;
  period: string;
  duration: string;
  progress: number;
};

const initialProjects: Project[] = [
  { id: 1, contractNumber: 'CN-001', name: 'Corporate Website Revamp', client: 'Acme Inc.', value: 2500000000, period: '2024-2025', duration: '12 Months', progress: 75 },
  { id: 2, contractNumber: 'CN-002', name: 'Mobile App Development', client: 'Stark Industries', value: 5000000000, period: '2024-2026', duration: '24 Months', progress: 40 },
  { id: 3, contractNumber: 'CN-003', name: 'Data Analytics Platform', client: 'Wayne Enterprises', value: 3200000000, period: '2023-2024', duration: '18 Months', progress: 90 },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    contractNumber: '',
    name: '',
    client: '',
    value: 0,
    period: '',
    duration: '',
    progress: 0
  });

  const handleAddProject = () => {
    if (newProject.name && newProject.client && newProject.value > 0 && newProject.contractNumber && newProject.period && newProject.duration) {
      const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
      setProjects([...projects, { ...newProject, id: newId }]);
      setNewProject({ contractNumber: '', name: '', client: '', value: 0, period: '', duration: '', progress: 0 });
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <DialogContent className="sm:max-w-[425px]">
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
                <Input
                  id="period"
                  value={newProject.period}
                  onChange={(e) => setNewProject({ ...newProject, period: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g. 2024-2025"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  value={newProject.duration}
                  onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g. 12 Months"
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
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="font-headline">{project.name}</CardTitle>
              <CardDescription>{project.client}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
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
                    <p className="text-sm font-semibold">{project.progress}%</p>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
