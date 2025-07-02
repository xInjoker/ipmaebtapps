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

type Project = {
  id: number;
  name: string;
  client: string;
  value: number;
};

const initialProjects: Project[] = [
  { id: 1, name: 'Corporate Website Revamp', client: 'Acme Inc.', value: 2500000000 },
  { id: 2, name: 'Mobile App Development', client: 'Stark Industries', value: 5000000000 },
  { id: 3, name: 'Data Analytics Platform', client: 'Wayne Enterprises', value: 3200000000 },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', client: '', value: 0 });

  const handleAddProject = () => {
    if (newProject.name && newProject.client && newProject.value > 0) {
      const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
      setProjects([...projects, { ...newProject, id: newId }]);
      setNewProject({ name: '', client: '', value: 0 });
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
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="col-span-3"
                  placeholder="Project name"
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
                  placeholder="Project value"
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
            <CardContent>
              <div className="text-lg font-semibold">Project Value</div>
              <p className="text-2xl font-bold text-primary">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(project.value)}
              </p>
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
