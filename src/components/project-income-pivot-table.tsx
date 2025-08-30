
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import type { Project } from '@/lib/projects';
import { formatCurrency } from '@/lib/utils';
import { parse, format, getYear, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

type ProjectIncomePivotTableProps = {
  project: Project | null;
};

type PivotData = {
  category: string;
  soBudget: number;
  invoicesByPeriod: Record<string, number>;
  totalInvoiced: number;
  remaining: number;
};

export function ProjectIncomePivotTable({ project }: ProjectIncomePivotTableProps) {
  const { periods, pivotData, grandTotals } = useMemo(() => {
    if (!project) {
      return { periods: [], pivotData: [], grandTotals: { budget: 0, costs: {}, total: 0, remaining: 0 } };
    }

    const allInvoices = (project.invoices || []).filter(inv => inv.status !== 'Cancel');
    const allServiceOrders = project.serviceOrders || [];
    
    // Create a map for easy SO lookup
    const soMap = new Map(allServiceOrders.map(so => [so.soNumber, so.value]));

    // Get all unique service categories from invoices
    const categories = [...new Set(allInvoices.map(inv => inv.serviceCategory))];

    const uniquePeriods = [...new Set(allInvoices.map(inv => inv.period))].sort((a, b) => {
      try {
        const dateA = parse(a, 'MMMM yyyy', new Date());
        const dateB = parse(b, 'MMMM yyyy', new Date());
        if (!isValid(dateA) || !isValid(dateB)) return 0;
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    });

    const data: PivotData[] = categories.map(category => {
      const invoicesForCategory = allInvoices.filter(inv => inv.serviceCategory === category);
      
      // Get unique SO numbers for this category and sum their values for the budget
      const relevantSoNumbers = [...new Set(invoicesForCategory.map(inv => inv.soNumber))];
      const soBudget = relevantSoNumbers.reduce((sum, soNum) => sum + (soMap.get(soNum) || 0), 0);

      const invoicesByPeriod = uniquePeriods.reduce((acc, period) => {
        acc[period] = invoicesForCategory
          .filter(inv => inv.period === period)
          .reduce((sum, inv) => sum + inv.value, 0);
        return acc;
      }, {} as Record<string, number>);
      
      const totalInvoiced = Object.values(invoicesByPeriod).reduce((sum, value) => sum + value, 0);
      const remaining = soBudget - totalInvoiced;

      return { category, soBudget, invoicesByPeriod, totalInvoiced, remaining };
    });
    
    const grandTotals = data.reduce((acc, row) => {
        acc.budget += row.soBudget;
        acc.total += row.totalInvoiced;
        acc.remaining += row.remaining;
        Object.entries(row.invoicesByPeriod).forEach(([period, value]) => {
            acc.costs[period] = (acc.costs[period] || 0) + value;
        });
        return acc;
    }, { budget: 0, costs: {} as Record<string, number>, total: 0, remaining: 0 });

    return { periods: uniquePeriods, pivotData: data, grandTotals };
  }, [project]);
  
  const years = [...new Set(periods.map(p => {
    try {
      const date = parse(p, 'MMMM yyyy', new Date());
      return isValid(date) ? getYear(date) : null;
    } catch {
      return null;
    }
  }).filter(y => y !== null))].sort() as number[];

  const formatNumber = (value: number) => {
    if (value === 0) return '-';
    return new Intl.NumberFormat('id-ID').format(value);
  }

  const getRemainingColor = (remaining: number, budget: number) => {
    if (budget === 0 && remaining === 0) return 'text-muted-foreground';
    if (remaining < 0) return 'text-yellow-500'; // Invoiced more than SO value
    if (remaining === 0) return 'text-green-500';
    return 'text-foreground';
  };
  
  const parseAndFormatPeriod = (period: string) => {
    try {
      const date = parse(period, 'MMMM yyyy', new Date());
      if (isValid(date)) {
        return format(date, 'MMM yy');
      }
      return period;
    } catch {
      return period;
    }
  }

  if (pivotData.length === 0) {
    return null; // Don't render the component if there's no invoice data
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Income & Service Order Pivot Table</CardTitle>
            <CardDescription>
            A summary of invoiced amounts against the total value of associated Service Orders for each service category.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative w-full overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 bg-background z-20 font-semibold min-w-[200px]">Service Category</TableHead>
                            <TableHead className="sticky left-[200px] bg-background z-20 text-right min-w-[150px]">SO Budget</TableHead>
                            {years.map(year => (
                                periods.filter(p => p && p.endsWith(year.toString())).map(period => (
                                    <TableHead key={period} className="text-right min-w-[120px]">
                                    {parseAndFormatPeriod(period)}
                                    </TableHead>
                                ))
                            ))}
                                <TableHead className="sticky right-[150px] bg-background z-20 text-right font-bold min-w-[150px]">Total Invoiced</TableHead>
                                <TableHead className="sticky right-0 bg-background z-20 text-right font-bold min-w-[150px]">Remaining</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pivotData.map((row) => (
                            <TableRow key={row.category}>
                                <TableCell className="sticky left-0 bg-background z-10 font-medium">{row.category}</TableCell>
                                <TableCell className="sticky left-[200px] bg-background z-10 text-right">{formatNumber(row.soBudget)}</TableCell>
                                {years.map(year => (
                                    periods.filter(p => p && p.endsWith(year.toString())).map(period => (
                                        <TableCell key={period} className="text-right">{formatNumber(row.invoicesByPeriod[period] || 0)}</TableCell>
                                    ))
                                ))}
                                <TableCell className="sticky right-[150px] bg-background z-10 text-right font-semibold">{formatNumber(row.totalInvoiced)}</TableCell>
                                <TableCell className={cn("sticky right-0 bg-background z-10 text-right font-semibold", getRemainingColor(row.remaining, row.soBudget))}>{formatNumber(row.remaining)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                     <TableFooter>
                            <TableRow>
                            <TableCell className="sticky left-0 bg-background z-10 font-bold">Total</TableCell>
                            <TableCell className="sticky left-[200px] bg-background z-10 text-right font-bold">{formatCurrency(grandTotals.budget)}</TableCell>
                                {years.map(year => (
                                periods.filter(p => p && p.endsWith(year.toString())).map(period => (
                                    <TableCell key={period} className="text-right font-bold">{formatCurrency(grandTotals.costs[period] || 0)}</TableCell>
                                ))
                            ))}
                            <TableCell className="sticky right-[150px] bg-background z-10 text-right font-bold">{formatCurrency(grandTotals.total)}</TableCell>
                            <TableCell className="sticky right-0 bg-background z-10 text-right font-bold">{formatCurrency(grandTotals.remaining)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
