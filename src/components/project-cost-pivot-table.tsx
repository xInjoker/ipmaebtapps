
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import type { Project, ExpenditureItem } from '@/lib/projects';
import { formatCurrency } from '@/lib/utils';
import { parse, format, getYear } from 'date-fns';

type ProjectCostPivotTableProps = {
  project: Project | null;
};

type PivotData = {
  category: string;
  budget: number;
  costsByPeriod: Record<string, number>;
  totalCost: number;
  remaining: number;
};

export function ProjectCostPivotTable({ project }: ProjectCostPivotTableProps) {
  const { periods, yearlySubtotals, grandTotals, pivotData } = useMemo(() => {
    if (!project) {
      return { periods: [], yearlySubtotals: {}, grandTotals: { budget: 0, costs: {}, total: 0, remaining: 0 }, pivotData: [] };
    }

    const allCosts = (project.costs || []).filter(c => c.status === 'Approved');
    const allBudgets = project.budgets || {};

    const uniquePeriods = [...new Set(allCosts.map(c => c.period))].sort((a, b) => {
      try {
        const dateA = parse(a, 'MMMM yyyy', new Date());
        const dateB = parse(b, 'MMMM yyyy', new Date());
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    });

    const categories = [...new Set([...Object.keys(allBudgets), ...allCosts.map(c => c.category)])];

    const data: PivotData[] = categories.map(category => {
      const budget = allBudgets[category] || 0;
      const costsByPeriod = uniquePeriods.reduce((acc, period) => {
        acc[period] = allCosts
          .filter(c => c.category === category && c.period === period)
          .reduce((sum, c) => sum + c.amount, 0);
        return acc;
      }, {} as Record<string, number>);
      
      const totalCost = Object.values(costsByPeriod).reduce((sum, cost) => sum + cost, 0);
      const remaining = budget - totalCost;

      return { category, budget, costsByPeriod, totalCost, remaining };
    });

    const yearlySubtotals: Record<string, Record<string, number>> = {};
    const grandTotals = {
        budget: 0,
        costs: uniquePeriods.reduce((acc, p) => ({...acc, [p]: 0}), {} as Record<string, number>),
        total: 0,
        remaining: 0,
    };

    data.forEach(row => {
        grandTotals.budget += row.budget;
        grandTotals.total += row.totalCost;
        grandTotals.remaining += row.remaining;
        
        Object.entries(row.costsByPeriod).forEach(([period, cost]) => {
            grandTotals.costs[period] = (grandTotals.costs[period] || 0) + cost;
            const year = getYear(parse(period, 'MMMM yyyy', new Date()));
            if (!yearlySubtotals[year]) {
                yearlySubtotals[year] = {};
            }
            yearlySubtotals[year][row.category] = (yearlySubtotals[year][row.category] || 0) + cost;
        });
    });

    return { periods: uniquePeriods, yearlySubtotals, grandTotals, pivotData: data };
  }, [project]);

  const years = [...new Set(periods.map(p => getYear(parse(p, 'MMMM yyyy', new Date()))))].sort();

  const formatNumber = (value: number) => {
    if (value === 0) return '-';
    return new Intl.NumberFormat('id-ID').format(value);
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Detailed Cost & Budget Pivot Table</CardTitle>
            <CardDescription>
                A detailed monthly breakdown of costs against the allocated budget for each category.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto rounded-md border w-full">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 bg-background z-20 font-semibold min-w-[200px]">Category</TableHead>
                            <TableHead className="sticky left-[200px] bg-background z-20 text-right min-w-[150px]">Budget</TableHead>
                            {years.map(year => (
                                periods.filter(p => p.endsWith(year.toString())).map(period => (
                                    <TableHead key={period} className="text-right min-w-[120px]">{format(parse(period, 'MMMM yyyy', new Date()), 'MMM yy')}</TableHead>
                                ))
                            ))}
                             <TableHead className="text-right font-bold min-w-[150px]">Grand Total</TableHead>
                             <TableHead className="text-right font-bold min-w-[150px]">Remaining</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pivotData.map((row) => (
                            <TableRow key={row.category}>
                                <TableCell className="sticky left-0 bg-background z-10 font-medium">{row.category}</TableCell>
                                <TableCell className="sticky left-[200px] bg-background z-10 text-right">{formatNumber(row.budget)}</TableCell>
                                {years.map(year => (
                                    periods.filter(p => p.endsWith(year.toString())).map(period => (
                                        <TableCell key={period} className="text-right">{formatNumber(row.costsByPeriod[period] || 0)}</TableCell>
                                    ))
                                ))}
                                <TableCell className="text-right font-semibold">{formatNumber(row.totalCost)}</TableCell>
                                <TableCell className="text-right font-semibold">{formatNumber(row.remaining)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                         <TableRow>
                            <TableCell className="sticky left-0 bg-background z-10 font-bold">Total</TableCell>
                            <TableCell className="sticky left-[200px] bg-background z-10 text-right font-bold">{formatCurrency(grandTotals.budget)}</TableCell>
                             {years.map(year => (
                                periods.filter(p => p.endsWith(year.toString())).map(period => (
                                    <TableCell key={period} className="text-right font-bold">{formatCurrency(grandTotals.costs[period] || 0)}</TableCell>
                                ))
                            ))}
                            <TableCell className="text-right font-bold">{formatCurrency(grandTotals.total)}</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(grandTotals.remaining)}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
