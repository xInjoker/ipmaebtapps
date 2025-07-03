'use client';

import { use, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CircleDollarSign,
  Clock,
  User,
  MoreHorizontal,
  PlusCircle,
  FileDown,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type InvoiceItem = {
  id: number;
  spkNumber: string;
  serviceCategory: string;
  description: string;
  status: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD';
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
  {
    id: 1,
    contractNumber: 'CN-001',
    name: 'Corporate Website Revamp',
    client: 'Acme Inc.',
    description:
      'A complete overhaul of the corporate website to improve user experience and modernize the design.',
    value: 2500000000,
    cost: 1800000000,
    invoiced: 2000000000,
    period: '2024-2025',
    duration: '12 Months',
    progress: 75,
    invoices: [
      {
        id: 1,
        spkNumber: 'SPK-001',
        serviceCategory: 'Design Phase',
        description: 'Initial design mockups and wireframes.',
        status: 'Paid',
        period: 'January 2024',
        value: 500000000,
      },
      {
        id: 2,
        spkNumber: 'SPK-002',
        serviceCategory: 'Development - Sprint 1',
        description: 'Development work for the first sprint.',
        status: 'Paid',
        period: 'April 2024',
        value: 750000000,
      },
      {
        id: 3,
        spkNumber: 'SPK-003',
        serviceCategory: 'Development - Sprint 2',
        description: 'Development work for the second sprint.',
        status: 'Invoiced',
        period: 'July 2024',
        value: 750000000,
      },
      {
        id: 4,
        spkNumber: 'SPK-004',
        serviceCategory: 'Final Deployment',
        description: 'Final deployment and server setup.',
        status: 'Invoiced',
        period: 'October 2024',
        value: 500000000,
      },
    ],
  },
  {
    id: 2,
    contractNumber: 'CN-002',
    name: 'Mobile App Development',
    client: 'Stark Industries',
    description:
      'Development of a new cross-platform mobile application for internal use.',
    value: 5000000000,
    cost: 3500000000,
    invoiced: 2500000000,
    period: '2024-2026',
    duration: '24 Months',
    progress: 40,
    invoices: [
      {
        id: 1,
        spkNumber: 'SPK-005',
        serviceCategory: 'Discovery & Planning',
        description: 'Discovery and project planning phase.',
        status: 'Paid',
        period: 'February 2024',
        value: 1000000000,
      },
      {
        id: 2,
        spkNumber: 'SPK-006',
        serviceCategory: 'UI/UX Design',
        description: 'UI/UX design for the mobile application.',
        status: 'Invoiced',
        period: 'May 2024',
        value: 1500000000,
      },
      {
        id: 3,
        spkNumber: 'SPK-007',
        serviceCategory: 'Backend Development',
        description: 'Backend development for core features.',
        status: 'Invoiced',
        period: 'August 2024',
        value: 1500000000,
      },
      {
        id: 4,
        spkNumber: 'SPK-008',
        serviceCategory: 'Frontend Development',
        description: 'Frontend development for the user interface.',
        status: 'Cancel',
        period: 'November 2024',
        value: 1000000000,
      },
    ],
  },
  {
    id: 3,
    contractNumber: 'CN-003',
    name: 'Data Analytics Platform',
    client: 'Wayne Enterprises',
    description:
      'Building a scalable data platform to provide business intelligence insights.',
    value: 3200000000,
    cost: 2800000000,
    invoiced: 3000000000,
    period: '2023-2024',
    duration: '18 Months',
    progress: 90,
    invoices: [
      {
        id: 1,
        spkNumber: 'SPK-009',
        serviceCategory: 'Infrastructure Setup',
        description: 'Setup of cloud infrastructure.',
        status: 'Paid',
        period: 'December 2023',
        value: 1000000000,
      },
      {
        id: 2,
        spkNumber: 'SPK-010',
        serviceCategory: 'Data Pipeline',
        description: 'Implementation of data ingestion pipelines.',
        status: 'Paid',
        period: 'March 2024',
        value: 1500000000,
      },
      {
        id: 3,
        spkNumber: 'SPK-011',
        serviceCategory: 'Dashboard Development',
        description: 'Development of user-facing dashboards.',
        status: 'Re-invoiced',
        period: 'June 2024',
        value: 500000000,
      },
      {
        id: 4,
        spkNumber: 'SPK-012',
        serviceCategory: 'User Training',
        description: 'Training sessions for end-users.',
        status: 'Cancel',
        period: 'June 2024',
        value: 200000000,
      },
    ],
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function ProjectDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState<{
    spkNumber: string;
    serviceCategory: string;
    description: string;
    status: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD';
    period: string;
    value: number;
  }>({
    spkNumber: '',
    serviceCategory: '',
    description: '',
    status: 'Invoiced',
    period: '',
    value: 0,
  });

  const project = projects.find((p) => p.id === parseInt(use(params).id, 10));

  const handleAddInvoice = () => {
    if (
      project &&
      newInvoice.spkNumber &&
      newInvoice.serviceCategory &&
      newInvoice.description &&
      newInvoice.period &&
      newInvoice.value > 0
    ) {
      const newId =
        project.invoices.length > 0
          ? Math.max(...project.invoices.map((i) => i.id)) + 1
          : 1;
      const updatedInvoices = [...project.invoices, { ...newInvoice, id: newId }];

      const updatedProjects = projects.map((p) =>
        p.id === project.id ? { ...p, invoices: updatedInvoices } : p
      );
      setProjects(updatedProjects);

      setNewInvoice({
        spkNumber: '',
        serviceCategory: '',
        description: '',
        status: 'Invoiced',
        period: '',
        value: 0,
      });
      setIsDialogOpen(false);
    }
  };

  const handleExport = () => {
    if (!project || !project.invoices) return;

    const headers = [
      'ID',
      'SPK Number',
      'Service Category',
      'Description',
      'Status',
      'Period',
      'Value (IDR)',
    ];
    const csvRows = [headers.join(',')];

    project.invoices.forEach((invoice) => {
      // Escape commas and quotes in string fields
      const spkNumber = `"${invoice.spkNumber.replace(/"/g, '""')}"`;
      const serviceCategory = `"${invoice.serviceCategory.replace(/"/g, '""')}"`;
      const description = `"${invoice.description.replace(/"/g, '""')}"`;

      const row = [
        invoice.id,
        spkNumber,
        serviceCategory,
        description,
        invoice.status,
        invoice.period,
        invoice.value,
      ].join(',');
      csvRows.push(row);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices-${project.contractNumber}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!project) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
        <p className="text-muted-foreground">
          The project you are looking for does not exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  const progress =
    project.value > 0
      ? Math.round((project.invoiced / project.value) * 100)
      : 0;

  const totalPad = project.invoices
    .filter((invoice) => invoice.status === 'Paid' || invoice.status === 'PAD')
    .reduce((acc, invoice) => acc + invoice.value, 0);

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
          <h1 className="font-headline text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{project.client}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contract No.
                    </p>
                    <p className="font-medium">{project.contractNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="font-medium">{project.period}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{project.duration}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <CircleDollarSign className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contract Value
                    </p>
                    <p className="font-medium">{formatCurrency(project.value)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CircleDollarSign className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="font-medium">{formatCurrency(project.cost)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CircleDollarSign className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Invoiced
                    </p>
                    <p className="font-medium">
                      {formatCurrency(project.invoiced)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CircleDollarSign className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total PAD
                    </p>
                    <p className="font-medium">{formatCurrency(totalPad)}</p>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">
                  Progress (by Invoiced Amount)
                </p>
                <p className="text-lg font-semibold">{progress}%</p>
              </div>
              <Progress value={progress} className="h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Invoicing Progress</CardTitle>
              <CardDescription>
                A detailed breakdown of all invoices for this project.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Invoice</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the new invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="spkNumber" className="text-right">
                        SPK Number
                      </Label>
                      <Input
                        id="spkNumber"
                        value={newInvoice.spkNumber}
                        onChange={(e) =>
                          setNewInvoice({ ...newInvoice, spkNumber: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="serviceCategory" className="text-right">
                        Service
                      </Label>
                      <Input
                        id="serviceCategory"
                        value={newInvoice.serviceCategory}
                        onChange={(e) =>
                          setNewInvoice({
                            ...newInvoice,
                            serviceCategory: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right pt-2">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={newInvoice.description}
                        onChange={(e) =>
                          setNewInvoice({
                            ...newInvoice,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3"
                        placeholder="Detailed description of the service."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={newInvoice.status}
                        onValueChange={(
                          value: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD'
                        ) => setNewInvoice({ ...newInvoice, status: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="PAD">PAD</SelectItem>
                          <SelectItem value="Invoiced">Invoiced</SelectItem>
                          <SelectItem value="Cancel">Cancel</SelectItem>
                          <SelectItem value="Re-invoiced">Re-invoiced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="period" className="text-right">
                        Period
                      </Label>
                      <Input
                        id="period"
                        value={newInvoice.period}
                        onChange={(e) =>
                          setNewInvoice({ ...newInvoice, period: e.target.value })
                        }
                        className="col-span-3"
                        placeholder="e.g. January 2024"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="value" className="text-right">
                        Value (IDR)
                      </Label>
                      <Input
                        id="value"
                        type="number"
                        value={newInvoice.value || ''}
                        onChange={(e) =>
                          setNewInvoice({
                            ...newInvoice,
                            value: parseInt(e.target.value) || 0,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddInvoice}>Add Invoice</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>SPK Number</TableHead>
                  <TableHead>Service Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.invoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell className="font-medium">
                      {invoice.spkNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.serviceCategory}
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{invoice.period}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.value)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.status === 'Paid' || invoice.status === 'PAD'
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
                    <TableCell colSpan={8} className="text-center">
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
