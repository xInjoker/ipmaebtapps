import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Calendar, CircleDollarSign, Clock, User, MoreHorizontal } from 'lucide-react';
import { ProjectFinancialsChart } from '@/components/project-financials-chart';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type InvoiceItem = {
  id: number;
  serviceCategory: string;
  status: 'PAD' | 'Invoiced' | 'Cancel' | 'Re-invoiced';
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
        { id: 1, serviceCategory: 'Design Phase', status: 'PAD', period: 'January 2024', value: 500000000 },
        { id: 2, serviceCategory: 'Development - Sprint 1', status: 'PAD', period: 'April 2024', value: 750000000 },
        { id: 3, serviceCategory: 'Development - Sprint 2', status: 'Invoiced', period: 'July 2024', value: 750000000 },
        { id: 4, serviceCategory: 'Final Deployment', status: 'Invoiced', period: 'October 2024', value: 500000000 },
    ]},
    { id: 2, contractNumber: 'CN-002', name: 'Mobile App Development', client: 'Stark Industries', description: 'Development of a new cross-platform mobile application for internal use.', value: 5000000000, cost: 3500000000, invoiced: 2500000000, period: '2024-2026', duration: '24 Months', progress: 40, invoices: [
        { id: 1, serviceCategory: 'Discovery & Planning', status: 'PAD', period: 'February 2024', value: 1000000000 },
        { id: 2, serviceCategory: 'UI/UX Design', status: 'Invoiced', period: 'May 2024', value: 1500000000 },
        { id: 3, serviceCategory: 'Backend Development', status: 'Invoiced', period: 'August 2024', value: 1500000000 },
        { id: 4, serviceCategory: 'Frontend Development', status: 'Cancel', period: 'November 2024', value: 1000000000 },
    ]},
    { id: 3, contractNumber: 'CN-003', name: 'Data Analytics Platform', client: 'Wayne Enterprises', description: 'Building a scalable data platform to provide business intelligence insights.', value: 3200000000, cost: 2800000000, invoiced: 3000000000, period: '2023-2024', duration: '18 Months', progress: 90, invoices: [
        { id: 1, serviceCategory: 'Infrastructure Setup', status: 'PAD', period: 'December 2023', value: 1000000000 },
        { id: 2, serviceCategory: 'Data Pipeline', status: 'PAD', period: 'March 2024', value: 1500000000 },
        { id: 3, serviceCategory: 'Dashboard Development', status: 'Re-invoiced', period: 'June 2024', value: 500000000 },
        { id: 4, serviceCategory: 'User Training', status: 'Cancel', period: 'June 2024', value: 200000000 },
    ]},
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

  const progress = project.value > 0 ? Math.round((project.invoiced / project.value) * 100) : 0;

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
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
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
                    </div>
                </div>
                <Separator className="my-6" />
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-sm text-muted-foreground">Progress (by Invoiced Amount)</p>
                    <p className="text-lg font-semibold">{progress}%</p>
                  </div>
                  <Progress value={progress} className="h-6" />
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Financials Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ProjectFinancialsChart data={project} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invoicing Progress</CardTitle>
                    <CardDescription>
                      A detailed breakdown of all invoices for this project.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Period</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {project.invoices?.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.serviceCategory}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invoice.status === 'PAD'
                                    ? 'default'
                                    : invoice.status === 'Invoiced'
                                    ? 'secondary'
                                    : invoice.status === 'Cancel'
                                    ? 'destructive'
                                    : 'outline'
                                }
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{invoice.period}</TableCell>
                            <TableCell className="text-right">{formatCurrency(invoice.value)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Cancel Invoice</DropdownMenuItem>
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!project.invoices?.length && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              No invoices found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
