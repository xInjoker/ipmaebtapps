
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Label, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/projects';
import { formatCurrencyCompact } from '@/lib/utils';
import { addMonths, format as formatDate, parse } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';


type ProjectProfitChartProps = {
  project: Project;
};

const chartConfig: ChartConfig = {
  profit: {
    label: 'Profit',
    color: 'hsl(var(--chart-1))',
  },
};

export function ProjectProfitChart({ project }: ProjectProfitChartProps) {
  const [selectedYear, setSelectedYear] = useState('all');

  const availableYears = useMemo(() => {
    if (!project) return ['all'];
    const years = new Set([...project.invoices, ...project.costs].map(i => i.period.split(' ')[1]).filter(Boolean));
    return ['all', ...Array.from(years).sort((a,b) => Number(b) - Number(a))];
  }, [project]);
  
  const chartData = useMemo(() => {
    if (!project) return [];
    
    const monthlyData: Record<string, { month: string, income: number, cost: number }> = {};
    
    const processPeriod = (period: string, value: number, type: 'income' | 'cost') => {
        if(!period) return;
        const [month, year] = period.split(' ');
        if(!month || !year || (selectedYear !== 'all' && selectedYear !== year)) return;
        try {
            const date = parse(`${month} 1, ${year}`, 'MMMM d, yyyy', new Date());
            const monthKey = formatDate(date, 'MMM yy');
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, income: 0, cost: 0 };
            }
            monthlyData[monthKey][type] += value;
        } catch (e) {
            console.warn(`Could not parse date for period: ${period}`);
        }
    };
    
    project.invoices.forEach(invoice => {
        if (invoice.status === 'Paid') {
            processPeriod(invoice.period, invoice.value, 'income');
        }
    });
      
    project.costs.forEach(exp => {
        if (exp.status === 'Approved') {
            processPeriod(exp.period, exp.amount, 'cost');
        }
    });

    const profitData = Object.values(monthlyData).map(data => ({
        month: data.month,
        profit: data.income - data.cost,
    }));

    const sortedData = profitData.sort((a,b) => {
        try {
            const dateA = parse(a.month, 'MMM yy', new Date());
            const dateB = parse(b.month, 'MMM yy', new Date());
            return dateA.getTime() - dateB.getTime();
        } catch {
            return 0;
        }
    });

    return sortedData.slice(-12);
  }, [project, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Monthly Profit</CardTitle>
            <CardDescription>Realized income vs. cost for each month.</CardDescription>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
                {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
            </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
                tickFormatter={(value) => formatCurrencyCompact(Number(value))}
            />
            <ChartTooltip
              content={<ChartTooltipContent
                indicator="dot"
                hideLabel
                valueFormatter={formatCurrencyCompact}
              />}
            />
            <Bar dataKey="profit" radius={4}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))'} />
                ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
