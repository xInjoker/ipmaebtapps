
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Calendar, CircleDollarSign, Clock, User } from 'lucide-react';

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
};

const initialProjects: Project[] = [
    { id: 1, contractNumber: 'CN-001', name: 'Corporate Website Revamp', client: 'Acme Inc.', description: 'A complete overhaul of the corporate website to improve user experience and modernize the design.', value: 2500000000, cost: 1800000000, invoiced: 2000000000, period: '2024-2025', duration: '12 Months', progress: 75 },
    { id: 2, contractNumber: 'CN-002', name: 'Mobile App Development', client: 'Stark Industries', description: 'Development of a new cross-platform mobile application for internal use.', value: 5000000000, cost: 3500000000, invoiced: 4000000000, period: '2024-2026', duration: '24 Months', progress: 40 },
    { id: 3, contractNumber: 'CN-003', name: 'Data Analytics Platform', client: 'Wayne Enterprises', description: 'Building a scalable data platform to provide business intelligence insights.', value: 3200000000, cost: 2800000000, invoiced: 3000000000, period: '2023-2024', duration: '18 Months', progress: 90 },
];

function formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value);
}

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const project = initialProjects.find(p => p.id === parseInt(params.id, 10));

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[calc(100vh-10rem)]">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="text-muted-foreground">The project you are looking for does not exist.</p>
        <Button asChild className="mt-4">
            <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
            </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
             <Button asChild variant="outline" size="icon">
                <Link href="/projects">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-2xl font-bold font-headline">{project.name}</h1>
                <p className="text-muted-foreground">{project.description}</p>
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="flex items-start gap-3">
                            <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Client</p>
                                <p className="font-medium">{project.client}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Contract No.</p>
                                <p className="font-medium">{project.contractNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Period</p>
                                <p className="font-medium">{project.period}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">{project.duration}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start gap-3">
                            <CircleDollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Contract Value</p>
                                <p className="font-medium">{formatCurrency(project.value)}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <CircleDollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Cost</p>
                                <p className="font-medium">{formatCurrency(project.cost)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CircleDollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Total Invoiced</p>
                                <p className="font-medium">{formatCurrency(project.invoiced)}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="text-sm text-muted-foreground">Progress</p>
                                <p className="text-sm font-semibold">{project.progress}%</p>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Additional Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is a new container for additional project details.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>New Placeholder</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is another new container for more details.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
