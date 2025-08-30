
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
  invoicesByPeriod: Record<string, number>;
  totalInvoiced: number;
};

export function ProjectIncomePivotTable({ project }: ProjectIncomePivotTableProps) {
  const { periods, pivotData, grandTotals } = useMemo(() => {
    if (!project) {
      return { periods: [], pivotData: [], grandTotals: { costs: {}, total: 0 } };
    }

    const allInvoices = (project.invoices || []).filter(inv => inv.status !== 'Cancel');
    
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
      
      const invoicesByPeriod = uniquePeriods.reduce((acc, period) => {
        acc[period] = invoicesForCategory
          .filter(inv => inv.period === period)
          .reduce((sum, inv) => sum + inv.value, 0);
        return acc;
      }, {} as Record<string, number>);
      
      const totalInvoiced = Object.values(invoicesByPeriod).reduce((sum, value) => sum + value, 0);
      
      return { category, invoicesByPeriod, totalInvoiced };
    });
    
    const grandTotals = data.reduce((acc, row) => {
        acc.total += row.totalInvoiced;
        Object.entries(row.invoicesByPeriod).forEach(([period, value]) => {
            acc.costs[period] = (acc.costs[period] || 0) + value;
        });
        return acc;
    }, { costs: {} as Record<string, number>, total: 0 });

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
                            {years.map(year => (
                                periods.filter(p => p && p.endsWith(year.toString())).map(period => (
                                    <TableHead key={period} className="text-right min-w-[120px]">
                                    {parseAndFormatPeriod(period)}
                                    </TableHead>
                                ))
                            ))}
                                <TableHead className="sticky right-0 bg-background z-20 text-right font-bold min-w-[150px]">Total Invoiced</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pivotData.map((row) => (
                            <TableRow key={row.category}>
                                <TableCell className="sticky left-0 bg-background z-10 font-medium">{row.category}</TableCell>
                                {years.map(year => (
                                    periods.filter(p => p && p.endsWith(year.toString())).map(period => (
                                        <TableCell key={period} className="text-right">{formatNumber(row.invoicesByPeriod[period] || 0)}</TableCell>
                                    ))
                                ))}
                                <TableCell className="sticky right-0 bg-background z-10 text-right font-semibold">{formatNumber(row.totalInvoiced)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                     <TableFooter>
                            <TableRow>
                            <TableCell className="sticky left-0 bg-background z-10 font-bold">Total</TableCell>
                                {years.map(year => (
                                periods.filter(p => p && p.endsWith(year.toString())).map(period => (
                                    <TableCell key={period} className="text-right font-bold">{formatCurrency(grandTotals.costs[period] || 0)}</TableCell>
                                ))
                            ))}
                            <TableCell className="sticky right-0 bg-background z-10 text-right font-bold">{formatCurrency(grandTotals.total)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
