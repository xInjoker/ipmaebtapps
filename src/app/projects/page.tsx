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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

type Invoice = {
  id: number;
  month: string;
  value: number;
  status: 'Document Preparation' | 'PAD' | 'Invoice' | 'Paid';
};

const initialInvoices: Invoice[] = [
  { id: 1, month: 'January 2024', value: 186000000, status: 'Paid' },
  { id: 2, month: 'February 2024', value: 305000000, status: 'Paid' },
  { id: 3, month: 'March 2024', value: 237000000, status: 'Invoice' },
  { id: 4, month: 'April 2024', value: 73000000, status: 'PAD' },
];

export default function ProjectsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [date, setDate] = useState<DateRange | undefined>();

  const handleAddInvoice = () => {
    const newId = invoices.length > 0 ? Math.max(...invoices.map(inv => inv.id)) + 1 : 1;
    setInvoices([
      ...invoices,
      { id: newId, month: 'New Month', value: 0, status: 'Document Preparation' },
    ]);
  };
  
  const handleRemoveInvoice = (id: number) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Project Details</CardTitle>
          <CardDescription>
            Manage core project information and contract details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-number">Contract Number</Label>
              <Input id="contract-number" defaultValue="PRJ-2024-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" defaultValue="Corporate Website Revamp" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract-period">Contract Period</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="contract-period"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} -{' '}
                        {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Project Details</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Invoice Management</CardTitle>
          <CardDescription>
            Input and track monthly invoice values and their statuses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Invoice Value (Rp)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Input defaultValue={invoice.month} className="max-w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      defaultValue={invoice.value}
                      className="max-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={invoice.status}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Document Preparation">
                          Document Preparation
                        </SelectItem>
                        <SelectItem value="PAD">PAD</SelectItem>
                        <SelectItem value="Invoice">Invoice</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveInvoice(invoice.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between border-t px-6 py-4">
            <Button onClick={handleAddInvoice} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Invoice
            </Button>
            <Button>Save Invoices</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
