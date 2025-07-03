'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { type InvoiceItem, type ExpenditureItem } from '@/lib/data';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useProjects } from '@/context/ProjectContext';
import { ProjectMonthlyRecapChart } from '@/components/project-monthly-recap-chart';


function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

const expenditureCategories = [
    'PT dan PTT',
    'PTT Project',
    'Tenaga Ahli dan Labour Supply',
    'Perjalanan Dinas',
    'Operasional',
    'Fasilitas dan Interen',
    'Amortisasi',
    'Kantor dan Diklat',
    'Promosi',
    'Umum',
    'Other',
];

const coaToCategoryMap: { [key: number]: string } = {
    4000: 'PT dan PTT',
    4100: 'PTT Project',
    4200: 'Tenaga Ahli dan Labour Supply',
    4300: 'Perjalanan Dinas',
    4400: 'Operasional',
    4500: 'Fasilitas dan Interen',
    4600: 'Amortisasi',
    4700: 'Kantor dan Diklat',
    4800: 'Promosi',
    4900: 'Umum',
};

const categoryToCoaMap: { [key: string]: string } = {
    'PT dan PTT': '4000',
    'PTT Project': '4100',
    'Tenaga Ahli dan Labour Supply': '4200',
    'Perjalanan Dinas': '4300',
    'Operasional': '4400',
    'Fasilitas dan Interen': '4500',
    'Amortisasi': '4600',
    'Kantor dan Diklat': '4700',
    'Promosi': '4800',
    'Umum': '4900',
    'Other': '',
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const { projects, setProjects } = useProjects();
  const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
  const [isEditInvoiceDialogOpen, setIsEditInvoiceDialogOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceItem | null>(null);

  const [editedInvoice, setEditedInvoice] = useState<{
    id: number;
    spkNumber: string;
    serviceCategory: string;
    description: string;
    status: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD' | 'Document Preparation';
    periodMonth: string;
    periodYear: string;
    value: number;
  } | null>(null);

  const [newInvoice, setNewInvoice] = useState<{
    spkNumber: string;
    serviceCategory: string;
    description: string;
    status: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD' | 'Document Preparation';
    periodMonth: string;
    periodYear: string;
    value: number;
  }>({
    spkNumber: '',
    serviceCategory: '',
    description: '',
    status: 'Invoiced',
    periodMonth: '',
    periodYear: '',
    value: 0,
  });

  const [isBudgetFinalized, setIsBudgetFinalized] = useState(true);
  const [isAddExpenditureDialogOpen, setIsAddExpenditureDialogOpen] = useState(false);
  const [newExpenditure, setNewExpenditure] = useState({
    category: '',
    coa: '',
    description: '',
    month: '',
    year: '',
    amount: 0,
    status: 'Approved' as 'Approved' | 'Pending' | 'Rejected',
  });
  
  const [isEditExpenditureDialogOpen, setIsEditExpenditureDialogOpen] = useState(false);
  const [expenditureToEdit, setExpenditureToEdit] = useState<ExpenditureItem | null>(null);
  const [editedExpenditure, setEditedExpenditure] = useState<{
    id: string;
    category: string;
    coa: string;
    description: string;
    month: string;
    year: string;
    amount: number;
    status: 'Approved' | 'Pending' | 'Rejected';
  } | null>(null);


  const project = projects.find((p) => p.id === parseInt(params.id as string, 10));

  const totalCost = useMemo(() => {
    if (!project) return 0;
    return project.expenditures
      .filter((exp) => exp.status === 'Approved')
      .reduce((acc, exp) => acc + exp.amount, 0);
  }, [project]);

  const totalInvoiced = useMemo(() => {
    if (!project) return 0;
    return project.invoices
      .filter((inv) => inv.status === 'Invoiced' || inv.status === 'Paid')
      .reduce((acc, inv) => acc + inv.value, 0);
  }, [project]);
  
  const totalPad = useMemo(() => {
    if (!project) return 0;
    return project.invoices
      .filter((inv) => inv.status === 'PAD')
      .reduce((acc, inv) => acc + inv.value, 0);
  }, [project]);

  const monthlyRecapData = useMemo(() => {
    if (!project) return [];

    const dataMap: { [key: string]: { month: string, invoicedAndPaid: number, pad: number, expenditure: number } } = {};
    const monthOrder: { [key:string]: number } = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };

    const processPeriod = (period: string) => {
      const [month, year] = period.split(' ');
      if (!month || !year || !monthOrder[month]) return null;
      const sortKey = `${year}-${String(monthOrder[month]).padStart(2, '0')}`;
      const displayMonth = `${month.slice(0, 3)} '${year.slice(2)}`;
      return { sortKey, displayMonth };
    };

    project.invoices.forEach(invoice => {
      const periodInfo = processPeriod(invoice.period);
      if (!periodInfo) return;
      const { sortKey, displayMonth } = periodInfo;

      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { month: displayMonth, invoicedAndPaid: 0, pad: 0, expenditure: 0 };
      }

      if (invoice.status === 'Invoiced' || invoice.status === 'Paid') {
        dataMap[sortKey].invoicedAndPaid += invoice.value;
      } else if (invoice.status === 'PAD') {
        dataMap[sortKey].pad += invoice.value;
      }
    });

    project.expenditures.forEach(exp => {
      if (exp.status !== 'Approved') return;
      
      const periodInfo = processPeriod(exp.period);
      if (!periodInfo) return;
      const { sortKey, displayMonth } = periodInfo;

      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { month: displayMonth, invoicedAndPaid: 0, pad: 0, expenditure: 0 };
      }
      dataMap[sortKey].expenditure += exp.amount;
    });

    return Object.keys(dataMap)
      .sort()
      .map(key => dataMap[key]);

  }, [project]);


  useEffect(() => {
    if (invoiceToEdit) {
      const [periodMonth, periodYear] = invoiceToEdit.period.split(' ');
      setEditedInvoice({
        ...invoiceToEdit,
        periodMonth: periodMonth || '',
        periodYear: periodYear || '',
      });
    } else {
      setEditedInvoice(null);
    }
  }, [invoiceToEdit]);
  
  useEffect(() => {
    if (expenditureToEdit) {
      const [month, year] = expenditureToEdit.period.split(' ');
      setEditedExpenditure({
        ...expenditureToEdit,
        month: month || '',
        year: year || '',
      });
    } else {
      setEditedExpenditure(null);
    }
  }, [expenditureToEdit]);

  const handleAddInvoice = () => {
    if (
      project &&
      newInvoice.spkNumber &&
      newInvoice.serviceCategory &&
      newInvoice.description &&
      newInvoice.periodMonth &&
      newInvoice.periodYear &&
      newInvoice.value > 0
    ) {
      const newId =
        project.invoices.length > 0
          ? Math.max(...project.invoices.map((i) => i.id)) + 1
          : 1;

      const { periodMonth, periodYear, ...restOfInvoice } = newInvoice;
      const period = `${periodMonth} ${periodYear}`;

      const updatedInvoices = [
        ...project.invoices,
        { ...restOfInvoice, id: newId, period },
      ];

      const updatedProjects = projects.map((p) =>
        p.id === project.id ? { ...p, invoices: updatedInvoices } : p
      );
      setProjects(updatedProjects);

      setNewInvoice({
        spkNumber: '',
        serviceCategory: '',
        description: '',
        status: 'Invoiced',
        periodMonth: '',
        periodYear: '',
        value: 0,
      });
      setIsAddInvoiceDialogOpen(false);
    }
  };

  const handleUpdateInvoice = () => {
    if (!project || !editedInvoice) return;

    const { periodMonth, periodYear, ...restOfInvoice } = editedInvoice;
    const period = `${periodMonth} ${periodYear}`;
    
    const updatedInvoiceData = { ...restOfInvoice, period };

    const updatedInvoices = project.invoices.map((inv) =>
      inv.id === editedInvoice.id ? updatedInvoiceData : inv
    );

    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, invoices: updatedInvoices } : p
    );

    setProjects(updatedProjects);
    setIsEditInvoiceDialogOpen(false);
    setInvoiceToEdit(null);
  };

  const handleEditClick = (invoice: InvoiceItem) => {
    setInvoiceToEdit(invoice);
    setIsEditInvoiceDialogOpen(true);
  };

  const handleExportInvoices = () => {
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

  const handleBudgetChange = (category: string, value: number) => {
    if (!project) return;
    const updatedBudgets = { ...project.budgets, [category]: value };
    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, budgets: updatedBudgets } : p
    );
    setProjects(updatedProjects);
  };

  const handleAddExpenditure = () => {
    if (!project) return;
    const period = newExpenditure.month && newExpenditure.year ? `${newExpenditure.month} ${newExpenditure.year}` : '';

    if (newExpenditure.category && period && newExpenditure.coa && newExpenditure.amount > 0) {
      const newId = `EXP-${project.id}-${String(project.expenditures.length + 1).padStart(3, '0')}`;
      
      const newExpenditureItem: ExpenditureItem = {
          id: newId,
          category: newExpenditure.category,
          coa: newExpenditure.coa,
          description: newExpenditure.description,
          period: period,
          amount: newExpenditure.amount,
          status: 'Approved'
      };

      const updatedExpenditures = [...project.expenditures, newExpenditureItem];
      const updatedProjects = projects.map((p) =>
        p.id === project.id ? { ...p, expenditures: updatedExpenditures } : p
      );
      setProjects(updatedProjects);
      setNewExpenditure({ category: '', coa: '', description: '', month: '', year: '', amount: 0, status: 'Approved' });
      setIsAddExpenditureDialogOpen(false);
    }
  };

  const handleCategorySelect = (value: string) => {
    const coa = categoryToCoaMap[value] || '';
    setNewExpenditure(prev => ({ ...prev, category: value, coa: coa }));
  };

  const handleCoaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!project) return;
    const coaValue = e.target.value;
    const coaNumber = parseInt(coaValue, 10);
    let categoryToSet = '';

    if (!isNaN(coaNumber) && coaValue.length >= 4) {
      const truncatedCoa = Math.floor(coaNumber / 100) * 100;
      const category = coaToCategoryMap[truncatedCoa];

      if (category && (project.budgets[category] ?? 0) > 0) {
        categoryToSet = category;
      } else {
        categoryToSet = 'Other';
      }
    } else {
      categoryToSet = 'Other'
    }
    setNewExpenditure(prev => ({ ...prev, coa: coaValue, category: categoryToSet }));
  };
  
  const handleEditExpenditureClick = (expenditure: ExpenditureItem) => {
    setExpenditureToEdit(expenditure);
    setIsEditExpenditureDialogOpen(true);
  };
  
  const handleUpdateExpenditure = () => {
    if (!project || !editedExpenditure) return;

    const { month, year, ...restOfExpenditure } = editedExpenditure;
    const period = `${month} ${year}`;
    
    const updatedExpenditureData = { ...restOfExpenditure, period };

    const updatedExpenditures = project.expenditures.map((exp) =>
      exp.id === editedExpenditure.id ? updatedExpenditureData : exp
    );

    const updatedProjects = projects.map((p) =>
      p.id === project.id ? { ...p, expenditures: updatedExpenditures } : p
    );

    setProjects(updatedProjects);
    setIsEditExpenditureDialogOpen(false);
    setExpenditureToEdit(null);
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

  const budgetedCategories = expenditureCategories.filter(category => (project.budgets[category] ?? 0) > 0 || category === 'Other');

  const spentByCategory = useMemo(() => {
    return project.expenditures.reduce((acc, item) => {
      if (item.status === 'Approved') {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
      }
      return acc;
    }, {} as { [category: string]: number });
  }, [project.expenditures]);

  const selectedCategory = newExpenditure.category;
  const totalBudgetForCategory = project.budgets[selectedCategory] ?? 0;
  const spentAmountForCategory = spentByCategory[selectedCategory] || 0;
  const remainingBudget = totalBudgetForCategory - spentAmountForCategory;

  let budgetStatus: { variant: 'green' | 'yellow' | 'orange' | 'destructive'; text: string } = { variant: 'green', text: 'Safe' };
  if (selectedCategory && totalBudgetForCategory > 0) {
    const remainingPercentage = (remainingBudget / totalBudgetForCategory) * 100;
    if (remainingPercentage <= 0) {
      budgetStatus = { variant: 'destructive', text: 'Over Budget' };
    } else if (remainingPercentage <= 10) {
      budgetStatus = { variant: 'orange', text: 'Low' };
    } else if (remainingPercentage <= 30) {
      budgetStatus = { variant: 'yellow', text: 'Warning' };
    }
  }

  const progress =
    project.value > 0
      ? Math.round((totalInvoiced / project.value) * 100)
      : 0;

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lg:col-span-1">
            <Card className="flex h-full flex-col">
            <CardHeader>
                <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
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
                        <p className="font-medium">{formatCurrency(totalCost)}</p>
                    </div>
                    </div>
                    <div className="flex items-start gap-3">
                    <CircleDollarSign className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">
                        Total Invoiced
                        </p>
                        <p className="font-medium">
                        {formatCurrency(totalInvoiced)}
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
                <div className="mt-auto">
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
        <div className="lg:col-span-1">
            <Card className="flex h-full flex-col">
                <CardHeader>
                    <CardTitle>Monthly Recap</CardTitle>
                    <CardDescription>
                        Recapitulation of Invoiced, PAD, and Expenditures.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <ProjectMonthlyRecapChart data={monthlyRecapData} />
                </CardContent>
            </Card>
        </div>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">Invoicing Progress</TabsTrigger>
          <TabsTrigger value="expenditure">Expenditure Management</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoicing Progress</CardTitle>
                <CardDescription>
                  A detailed breakdown of all invoices for this project.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportInvoices}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Dialog open={isAddInvoiceDialogOpen} onOpenChange={setIsAddInvoiceDialogOpen}>
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
                            value: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD' | 'Document Preparation'
                          ) => setNewInvoice({ ...newInvoice, status: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Document Preparation">Document Preparation</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="PAD">PAD</SelectItem>
                            <SelectItem value="Invoiced">Invoiced</SelectItem>
                            <SelectItem value="Cancel">Cancel</SelectItem>
                            <SelectItem value="Re-invoiced">Re-invoiced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="periodMonth" className="text-right">
                          Period
                        </Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                          <Select
                            value={newInvoice.periodMonth}
                            onValueChange={(value) =>
                              setNewInvoice({ ...newInvoice, periodMonth: value })
                            }
                          >
                            <SelectTrigger id="periodMonth">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="January">January</SelectItem>
                              <SelectItem value="February">February</SelectItem>
                              <SelectItem value="March">March</SelectItem>
                              <SelectItem value="April">April</SelectItem>
                              <SelectItem value="May">May</SelectItem>
                              <SelectItem value="June">June</SelectItem>
                              <SelectItem value="July">July</SelectItem>
                              <SelectItem value="August">August</SelectItem>
                              <SelectItem value="September">September</SelectItem>
                              <SelectItem value="October">October</SelectItem>
                              <SelectItem value="November">November</SelectItem>
                              <SelectItem value="December">December</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            id="periodYear"
                            type="number"
                            value={newInvoice.periodYear}
                            onChange={(e) =>
                              setNewInvoice({
                                ...newInvoice,
                                periodYear: e.target.value,
                              })
                            }
                            placeholder="Year"
                          />
                        </div>
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
                            invoice.status === 'Paid'
                              ? 'green'
                              : invoice.status === 'PAD'
                              ? 'yellow'
                              : invoice.status === 'Invoiced'
                              ? 'orange'
                              : invoice.status === 'Cancel'
                              ? 'destructive'
                              : invoice.status === 'Re-invoiced'
                              ? 'blue'
                              : invoice.status === 'Document Preparation'
                              ? 'purple'
                              : 'secondary'
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
                            <DropdownMenuItem onSelect={() => handleEditClick(invoice)}>Edit</DropdownMenuItem>
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
        </TabsContent>
        <TabsContent value="expenditure">
           {!isBudgetFinalized ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Set Category Budgets</CardTitle>
                <CardDescription>
                  Before adding expenditures, please set a budget for each category for this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Budget (IDR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenditureCategories.map((category) => (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={project.budgets[category] || 0}
                            onChange={(e) => handleBudgetChange(category, parseInt(e.target.value) || 0)}
                            className="ml-auto max-w-xs text-right"
                            placeholder="Enter budget"
                            disabled={category === 'Other'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => setIsBudgetFinalized(true)}>Finalize Budget</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-headline">Project Expenditure</CardTitle>
                  <CardDescription>
                    Track and manage all expenditures for this project.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsBudgetFinalized(false)}>
                    Edit Budget
                  </Button>
                  <Dialog open={isAddExpenditureDialogOpen} onOpenChange={setIsAddExpenditureDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Expenditure
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Expenditure</DialogTitle>
                        <DialogDescription>
                          Fill in the details for the new expenditure.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="project-name" className="text-right">
                                Project
                            </Label>
                            <Input id="project-name" value={project.name} disabled className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="coa" className="text-right">
                            COA
                          </Label>
                          <Input
                            id="coa"
                            value={newExpenditure.coa}
                            onChange={handleCoaChange}
                            className="col-span-3"
                            placeholder="Enter COA to auto-fill category"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="category" className="text-right">
                            Category
                          </Label>
                          <Select
                            value={newExpenditure.category}
                            onValueChange={handleCategorySelect}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {budgetedCategories.length > 0 ? (
                                budgetedCategories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No categories with a budget set.
                                  </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="remainingBudget" className="text-right">
                            Remaining
                          </Label>
                          <div className="col-span-3 flex items-center gap-2 text-sm font-medium">
                            <span>{formatCurrency(remainingBudget)}</span>
                            {newExpenditure.category && (
                              <Badge variant={budgetStatus.variant}>{budgetStatus.text}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="periodMonth" className="text-right">
                            Period
                          </Label>
                          <div className="col-span-3 grid grid-cols-2 gap-2">
                            <Select
                              value={newExpenditure.month}
                              onValueChange={(value) =>
                                setNewExpenditure({ ...newExpenditure, month: value })
                              }
                            >
                              <SelectTrigger id="periodMonth">
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="January">January</SelectItem>
                                <SelectItem value="February">February</SelectItem>
                                <SelectItem value="March">March</SelectItem>
                                <SelectItem value="April">April</SelectItem>
                                <SelectItem value="May">May</SelectItem>
                                <SelectItem value="June">June</SelectItem>
                                <SelectItem value="July">July</SelectItem>
                                <SelectItem value="August">August</SelectItem>
                                <SelectItem value="September">September</SelectItem>
                                <SelectItem value="October">October</SelectItem>
                                <SelectItem value="November">November</SelectItem>
                                <SelectItem value="December">December</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              id="periodYear"
                              type="number"
                              placeholder="Year"
                              value={newExpenditure.year}
                              onChange={(e) =>
                                setNewExpenditure({
                                  ...newExpenditure,
                                  year: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="exp-description" className="text-right pt-2">
                                Description
                            </Label>
                            <Textarea
                                id="exp-description"
                                value={newExpenditure.description}
                                onChange={(e) =>
                                setNewExpenditure({ ...newExpenditure, description: e.target.value })
                                }
                                className="col-span-3"
                                placeholder="Detailed description of the expenditure."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="amount" className="text-right">
                            Amount (IDR)
                          </Label>
                          <Input
                            id="amount"
                            type="number"
                            value={newExpenditure.amount || ''}
                            onChange={(e) => setNewExpenditure({ ...newExpenditure, amount: parseInt(e.target.value) || 0 })}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddExpenditure}>Add Expenditure</Button>
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
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>COA</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.expenditures.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.coa}</TableCell>
                        <TableCell>{item.period}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => handleEditExpenditureClick(item)}>Edit</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!project.expenditures?.length && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No expenditures found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditInvoiceDialogOpen} onOpenChange={setIsEditInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          {editedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Invoice</DialogTitle>
                <DialogDescription>
                  Update the details for this invoice.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editSpkNumber" className="text-right">
                    SPK Number
                  </Label>
                  <Input
                    id="editSpkNumber"
                    value={editedInvoice.spkNumber}
                    onChange={(e) =>
                      setEditedInvoice({ ...editedInvoice, spkNumber: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editServiceCategory" className="text-right">
                    Service
                  </Label>
                  <Input
                    id="editServiceCategory"
                    value={editedInvoice.serviceCategory}
                    onChange={(e) =>
                      setEditedInvoice({
                        ...editedInvoice,
                        serviceCategory: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="editDescription" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="editDescription"
                    value={editedInvoice.description}
                    onChange={(e) =>
                      setEditedInvoice({
                        ...editedInvoice,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editStatus" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={editedInvoice.status}
                    onValueChange={(
                      value: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD' | 'Document Preparation'
                    ) => setEditedInvoice({ ...editedInvoice, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Document Preparation">Document Preparation</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="PAD">PAD</SelectItem>
                      <SelectItem value="Invoiced">Invoiced</SelectItem>
                      <SelectItem value="Cancel">Cancel</SelectItem>
                      <SelectItem value="Re-invoiced">Re-invoiced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editPeriodMonth" className="text-right">
                    Period
                  </Label>
                  <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Select
                      value={editedInvoice.periodMonth}
                      onValueChange={(value) =>
                        setEditedInvoice({ ...editedInvoice, periodMonth: value })
                      }
                    >
                      <SelectTrigger id="editPeriodMonth">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="January">January</SelectItem>
                        <SelectItem value="February">February</SelectItem>
                        <SelectItem value="March">March</SelectItem>
                        <SelectItem value="April">April</SelectItem>
                        <SelectItem value="May">May</SelectItem>
                        <SelectItem value="June">June</SelectItem>
                        <SelectItem value="July">July</SelectItem>
                        <SelectItem value="August">August</SelectItem>
                        <SelectItem value="September">September</SelectItem>
                        <SelectItem value="October">October</SelectItem>
                        <SelectItem value="November">November</SelectItem>
                        <SelectItem value="December">December</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="editPeriodYear"
                      type="number"
                      value={editedInvoice.periodYear}
                      onChange={(e) =>
                        setEditedInvoice({
                          ...editedInvoice,
                          periodYear: e.target.value,
                        })
                      }
                      placeholder="Year"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="editValue" className="text-right">
                    Value (IDR)
                  </Label>
                  <Input
                    id="editValue"
                    type="number"
                    value={editedInvoice.value || ''}
                    onChange={(e) =>
                      setEditedInvoice({
                        ...editedInvoice,
                        value: parseInt(e.target.value) || 0,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateInvoice}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Expenditure Dialog */}
      <Dialog open={isEditExpenditureDialogOpen} onOpenChange={setIsEditExpenditureDialogOpen}>
        <DialogContent className="sm:max-w-lg">
        {editedExpenditure && project && (
            <>
            <DialogHeader>
                <DialogTitle>Edit Expenditure</DialogTitle>
                <DialogDescription>
                Update the details for this expenditure.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editExpProjectName" className="text-right">
                        Project
                    </Label>
                    <Input id="editExpProjectName" value={project.name} disabled className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editExpCoa" className="text-right">
                    COA
                    </Label>
                    <Input
                    id="editExpCoa"
                    value={editedExpenditure.coa}
                    onChange={(e) => setEditedExpenditure({ ...editedExpenditure, coa: e.target.value })}
                    className="col-span-3"
                    placeholder="Enter COA"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editExpCategory" className="text-right">
                    Category
                    </Label>
                    <Select
                        value={editedExpenditure.category}
                        onValueChange={(value) => setEditedExpenditure({ ...editedExpenditure, category: value })}
                    >
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                        {budgetedCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                            {category}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editExpPeriodMonth" className="text-right">
                    Period
                    </Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Select
                            value={editedExpenditure.month}
                            onValueChange={(value) => setEditedExpenditure({ ...editedExpenditure, month: value })}
                        >
                            <SelectTrigger id="editExpPeriodMonth">
                            <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="January">January</SelectItem>
                                <SelectItem value="February">February</SelectItem>
                                <SelectItem value="March">March</SelectItem>
                                <SelectItem value="April">April</SelectItem>
                                <SelectItem value="May">May</SelectItem>
                                <SelectItem value="June">June</SelectItem>
                                <SelectItem value="July">July</SelectItem>
                                <SelectItem value="August">August</SelectItem>
                                <SelectItem value="September">September</SelectItem>
                                <SelectItem value="October">October</SelectItem>
                                <SelectItem value="November">November</SelectItem>
                                <SelectItem value="December">December</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            id="editExpPeriodYear"
                            type="number"
                            placeholder="Year"
                            value={editedExpenditure.year}
                            onChange={(e) => setEditedExpenditure({ ...editedExpenditure, year: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="editExpDescription" className="text-right pt-2">
                        Description
                    </Label>
                    <Textarea
                        id="editExpDescription"
                        value={editedExpenditure.description}
                        onChange={(e) => setEditedExpenditure({ ...editedExpenditure, description: e.target.value })}
                        className="col-span-3"
                        rows={3}
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editExpAmount" className="text-right">
                    Amount (IDR)
                    </Label>
                    <Input
                    id="editExpAmount"
                    type="number"
                    value={editedExpenditure.amount || ''}
                    onChange={(e) => setEditedExpenditure({ ...editedExpenditure, amount: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="editExpStatus" className="text-right">
                    Status
                    </Label>
                    <Select
                        value={editedExpenditure.status}
                        onValueChange={(value: 'Approved' | 'Pending' | 'Rejected') =>
                            setEditedExpenditure({ ...editedExpenditure, status: value })
                        }
                    >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleUpdateExpenditure}>Save Changes</Button>
            </DialogFooter>
            </>
        )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
