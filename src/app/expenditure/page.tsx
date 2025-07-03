'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
  date: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
};

const initialExpenditureData: ExpenditureItem[] = [
    { id: 'EXP-001', project: 'Corporate Website Revamp', category: 'Tenaga Ahli dan Labour Supply', coa: '502.103', date: 'July 2024', amount: 15000000, status: 'Approved' },
    { id: 'EXP-002', project: 'Mobile App Development', category: 'Operasional', coa: '502.105', date: 'July 2024', amount: 35000000, status: 'Approved' },
    { id: 'EXP-003', project: 'Data Analytics Platform', category: 'Perjalanan Dinas', coa: '502.104', date: 'July 2024', amount: 7500000, status: 'Pending' },
    { id: 'EXP-004', project: 'Corporate Website Revamp', category: 'Promosi', coa: '502.109', date: 'July 2024', amount: 50000000, status: 'Approved' },
    { id: 'EXP-005', project: 'Mobile App Development', category: 'Fasilitas dan Interen', coa: '502.106', date: 'July 2024', amount: 25000000, status: 'Rejected' },
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
  const [newExpenditure, setNewExpenditure] = useState({
    project: '',
    category: '',
    coa: '',
    month: '',
    year: '',
    amount: 0,
    status: 'Pending' as 'Approved' | 'Pending' | 'Rejected',
  });
  const [customCategory, setCustomCategory] = useState('');

  const handleAddExpenditure = () => {
    const finalCategory = customCategory.trim() || newExpenditure.category;
    const date = newExpenditure.month && newExpenditure.year ? `${newExpenditure.month} ${newExpenditure.year}` : '';

    if (newExpenditure.project && finalCategory && date && newExpenditure.coa && newExpenditure.amount > 0) {
      const newId = `EXP-${String(expenditureData.length + 1).padStart(3, '0')}`;
      
      const newExpenditureItem: ExpenditureItem = {
          id: newId,
          project: newExpenditure.project,
          category: finalCategory,
          coa: newExpenditure.coa,
          date: date,
          amount: newExpenditure.amount,
          status: newExpenditure.status
      };

      setExpenditureData([...expenditureData, newExpenditureItem]);
      setNewExpenditure({ project: '', category: '', coa: '', month: '', year: '', amount: 0, status: 'Pending' });
      setCustomCategory('');
      setIsDialogOpen(false);
    }
  };

  const handleCategorySelect = (value: string) => {
    setNewExpenditure({ ...newExpenditure, category: value });
    setCustomCategory('');
  };

  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value);
    setNewExpenditure({ ...newExpenditure, category: '' });
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">Project Expenditure</CardTitle>
          <CardDescription>
            Track and manage all project-related expenditures.
          </CardDescription>
        </div>
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
                    {expenditureCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customCategory" className="text-right">
                  Or Custom
                </Label>
                <Input
                  id="customCategory"
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={handleCustomCategoryChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coa" className="text-right">
                  COA
                </Label>
                <Input
                  id="coa"
                  value={newExpenditure.coa}
                  onChange={(e) =>
                    setNewExpenditure({ ...newExpenditure, coa: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Enter COA"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateMonth" className="text-right">
                  Date
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  <Select
                    value={newExpenditure.month}
                    onValueChange={(value) =>
                      setNewExpenditure({ ...newExpenditure, month: value })
                    }
                  >
                    <SelectTrigger id="dateMonth">
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
                    id="dateYear"
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>COA</TableHead>
              <TableHead>Date</TableHead>
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
                <TableCell>{item.date}</TableCell>
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
  );
}
