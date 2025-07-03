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
  date: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
};

const initialExpenditureData: ExpenditureItem[] = [
    { id: 'EXP-001', project: 'Corporate Website Revamp', category: 'Marketing', date: '2024-07-15', amount: 15000000, status: 'Approved' },
    { id: 'EXP-002', project: 'Mobile App Development', category: 'Software Licensing', date: '2024-07-14', amount: 35000000, status: 'Approved' },
    { id: 'EXP-003', project: 'Data Analytics Platform', category: 'Hardware', date: '2024-07-13', amount: 75000000, status: 'Pending' },
    { id: 'EXP-004', project: 'Corporate Website Revamp', category: 'Consulting Fees', date: '2024-07-12', amount: 50000000, status: 'Approved' },
    { id: 'EXP-005', project: 'Mobile App Development', category: 'Cloud Services', date: '2024-07-11', amount: 25000000, status: 'Rejected' },
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
    date: '',
    amount: 0,
    status: 'Pending' as 'Approved' | 'Pending' | 'Rejected',
  });

  const handleAddExpenditure = () => {
    if (newExpenditure.project && newExpenditure.category && newExpenditure.date && newExpenditure.amount > 0) {
      const newId = `EXP-${String(expenditureData.length + 1).padStart(3, '0')}`;
      setExpenditureData([...expenditureData, { ...newExpenditure, id: newId }]);
      setNewExpenditure({ project: '', category: '', date: '', amount: 0, status: 'Pending' });
      setIsDialogOpen(false);
    }
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
                <Input
                  id="category"
                  value={newExpenditure.category}
                  onChange={(e) => setNewExpenditure({ ...newExpenditure, category: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Software Licensing"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpenditure.date}
                  onChange={(e) => setNewExpenditure({ ...newExpenditure, date: e.target.value })}
                  className="col-span-3"
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
