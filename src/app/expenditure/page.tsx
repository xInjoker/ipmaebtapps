'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { PlusCircle } from 'lucide-react';
import { initialProjects } from '@/lib/data';

type ExpenditureItem = {
  id: string;
  project: string;
  category: string;
  coa: string;
  period: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
};

const initialExpenditureData: ExpenditureItem[] = [
    { id: 'EXP-001', project: 'Corporate Website Revamp', category: 'Tenaga Ahli dan Labour Supply', coa: '502.103', period: 'July 2024', amount: 15000000, status: 'Approved' },
    { id: 'EXP-002', project: 'Mobile App Development', category: 'Operasional', coa: '502.105', period: 'July 2024', amount: 35000000, status: 'Approved' },
    { id: 'EXP-003', project: 'Data Analytics Platform', category: 'Perjalanan Dinas', coa: '502.104', period: 'July 2024', amount: 7500000, status: 'Pending' },
    { id: 'EXP-004', project: 'Corporate Website Revamp', category: 'Promosi', coa: '502.109', period: 'July 2024', amount: 50000000, status: 'Approved' },
    { id: 'EXP-005', project: 'Mobile App Development', category: 'Fasilitas dan Interen', coa: '502.106', period: 'July 2024', amount: 25000000, status: 'Rejected' },
];

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
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function ExpenditurePage() {
  const [expenditureData, setExpenditureData] = useState<ExpenditureItem[]>(initialExpenditureData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBudgetFinalized, setIsBudgetFinalized] = useState(false);
  const [newExpenditure, setNewExpenditure] = useState({
    project: '',
    category: '',
    coa: '',
    month: '',
    year: '',
    amount: 0,
    status: 'Pending' as 'Approved' | 'Pending' | 'Rejected',
  });
  const [budgets, setBudgets] = useState<{ [category: string]: number }>({
    'PT dan PTT': 50000000,
    'PTT Project': 0,
    'Tenaga Ahli dan Labour Supply': 200000000,
    'Perjalanan Dinas': 75000000,
    'Operasional': 150000000,
    'Fasilitas dan Interen': 50000000,
    'Amortisasi': 0,
    'Kantor dan Diklat': 0,
    'Promosi': 100000000,
    'Umum': 0,
  });

  const budgetedCategories = expenditureCategories.filter(category => (budgets[category] ?? 0) > 0);

  const spentByCategory = useMemo(() => {
    return expenditureData.reduce((acc, item) => {
      if (item.status === 'Approved') {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
      }
      return acc;
    }, {} as { [category: string]: number });
  }, [expenditureData]);


  const handleBudgetChange = (category: string, value: number) => {
    setBudgets(prev => ({ ...prev, [category]: value }));
  };

  const handleAddExpenditure = () => {
    const period = newExpenditure.month && newExpenditure.year ? `${newExpenditure.month} ${newExpenditure.year}` : '';

    if (newExpenditure.project && newExpenditure.category && period && newExpenditure.coa && newExpenditure.amount > 0) {
      const newId = `EXP-${String(expenditureData.length + 1).padStart(3, '0')}`;
      
      const newExpenditureItem: ExpenditureItem = {
          id: newId,
          project: newExpenditure.project,
          category: newExpenditure.category,
          coa: newExpenditure.coa,
          period: period,
          amount: newExpenditure.amount,
          status: newExpenditure.status
      };

      setExpenditureData([...expenditureData, newExpenditureItem]);
      setNewExpenditure({ project: '', category: '', coa: '', month: '', year: '', amount: 0, status: 'Pending' });
      setIsDialogOpen(false);
    }
  };

  const handleCategorySelect = (value: string) => {
    const coa = categoryToCoaMap[value] || '';
    setNewExpenditure(prev => ({ ...prev, category: value, coa: coa }));
  };

  const handleCoaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const coaValue = e.target.value;
    const coaNumber = parseInt(coaValue, 10);
    let categoryToSet = '';

    if (!isNaN(coaNumber) && coaValue.length >= 4) {
      const truncatedCoa = Math.floor(coaNumber / 100) * 100;
      const category = coaToCategoryMap[truncatedCoa];

      if (category && expenditureCategories.includes(category) && (budgets[category] ?? 0) > 0) {
          categoryToSet = category;
      }
    }
    setNewExpenditure(prev => ({ ...prev, coa: coaValue, category: categoryToSet }));
  };
  
  const selectedCategory = newExpenditure.category;
  const totalBudgetForCategory = budgets[selectedCategory] ?? 0;
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


  return (
    <div className="space-y-6">
      {!isBudgetFinalized ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Set Category Budgets</CardTitle>
            <CardDescription>
              Before adding expenditures, please set a budget for each category. Expenditures can only be added to categories with a budget.
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
                        value={budgets[category] || 0}
                        onChange={(e) => handleBudgetChange(category, parseInt(e.target.value) || 0)}
                        className="ml-auto max-w-xs text-right"
                        placeholder="Enter budget"
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
                Track and manage all project-related expenditures.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsBudgetFinalized(false)}>
                Edit Budget
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      <Label htmlFor="project" className="text-right">
                        Project
                      </Label>
                      <Select
                        value={newExpenditure.project}
                        onValueChange={(value) =>
                          setNewExpenditure({ ...newExpenditure, project: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {initialProjects.map((project) => (
                            <SelectItem key={project.id} value={project.name}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={newExpenditure.status}
                        onValueChange={(value: 'Approved' | 'Pending' | 'Rejected') =>
                          setNewExpenditure({ ...newExpenditure, status: value })
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
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>COA</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenditureData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.project}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.coa}</TableCell>
                    <TableCell>{item.period}</TableCell>
                    <TableCell>
                        <Badge variant={
                            item.status === 'Approved' ? 'green' : item.status === 'Pending' ? 'yellow' : 'destructive'
                        }>
                            {item.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
