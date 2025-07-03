'use client';

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

const expenditureData = [
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Project Expenditure</CardTitle>
        <CardDescription>
          Track and manage all project-related expenditures.
        </CardDescription>
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
