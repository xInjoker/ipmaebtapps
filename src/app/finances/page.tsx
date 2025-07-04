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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

type FinancialCategory = {
  id: number;
  category: string;
  budget: number;
  realization: number;
  isEditable: boolean;
};

const initialFinancialData: FinancialCategory[] = [
  { id: 1, category: 'PT & PTT Cost', budget: 500000000, realization: 400000000, isEditable: false },
  { id: 2, category: 'TA & LS Cost', budget: 350000000, realization: 300000000, isEditable: true },
  { id: 3, category: 'SPD', budget: 50000000, realization: 45000000, isEditable: true },
  { id: 4, category: 'OPS', budget: 80000000, realization: 70000000, isEditable: true },
  { id: 5, category: 'Fasilitas & Intern', budget: 60000000, realization: 55000000, isEditable: true },
  { id: 6, category: 'Amortisasi', budget: 25000000, realization: 25000000, isEditable: true },
  { id: 7, category: 'Kantor dan Diklat', budget: 40000000, realization: 30000000, isEditable: true },
  { id: 8, category: 'Promosi', budget: 75000000, realization: 60000000, isEditable: true },
  { id: 9, category: 'Umum', budget: 30000000, realization: 28000000, isEditable: true },
];

export default function FinancesPage() {
  const [financialData, setFinancialData] = useState<FinancialCategory[]>(initialFinancialData);

  const handleDataChange = (id: number, field: 'budget' | 'realization', value: number) => {
    setFinancialData(
      financialData.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  const totalBudget = financialData.reduce((acc, item) => acc + item.budget, 0);
  const totalRealization = financialData.reduce((acc, item) => acc + item.realization, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Financial Management</CardTitle>
        <CardDescription>
          Manage budget allocation and track monthly realization for each cost category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Budget (IDR)</TableHead>
                <TableHead className="text-right">Realization (IDR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.budget}
                      onChange={(e) => handleDataChange(item.id, 'budget', parseInt(e.target.value) || 0)}
                      disabled={!item.isEditable}
                      className="ml-auto max-w-xs text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      value={item.realization}
                      onChange={(e) => handleDataChange(item.id, 'realization', parseInt(e.target.value) || 0)}
                      className="ml-auto max-w-xs text-right"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-end space-y-2 border-t bg-muted/50 px-6 py-4 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="text-right sm:text-left">
            <p className="text-sm font-medium">Total Budget: {formatCurrency(totalBudget)}</p>
            <p className="text-sm font-medium text-muted-foreground">Total Realization: {formatCurrency(totalRealization)}</p>
        </div>
        <Button>Save Financials</Button>
      </CardFooter>
    </Card>
  );
}
