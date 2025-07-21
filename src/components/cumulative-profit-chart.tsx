
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/data';
import { formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { parse, format as formatDate } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type CumulativeProfitChartProps = {
  projects: Project[];
};

const chartConfig: ChartConfig = {
  profit: {
    label: 'Profit',
  },
};

export function CumulativeProfitChart({ projects }: CumulativeProfitChartProps) {
  const [selectedYear, setSelectedYear] = useState('all');

  const availableYears = useMemo(() => {
    const years = new Set(projects.flatMap(p => [...p.invoices, ...p.costs].map(i => i.period.split(' ')[1])).filter(Boolean));
    return ['all', ...Array.from(years).sort((a,b) => Number(b) - Number(a))];
  }, [projects]);
  
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string, income: number, cost: number }> = {};
    
    projects.forEach(project => {
        // Process income from paid invoices
        project.invoices.forEach(invoice => {
            if (invoice.status === 'Paid') {
                const [month, year] = invoice.period.split(' ');
                if (!month || !year || (selectedYear !== 'all' && selectedYear !== year)) return;
                try {
                    const date = parse(`${month} 1, ${year}`, 'MMMM d, yyyy', new Date());
                    const monthKey = formatDate(date, 'MMM yy');
                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { month: monthKey, income: 0, cost: 0 };
                    }
                    monthlyData[monthKey].income += invoice.value;
                } catch (e) {
                    console.warn(`Could not parse date for invoice period: ${invoice.period}`);
                }
            }
        });
        
        // Process costs
        project.costs.forEach(exp => {
            if (exp.status === 'Approved') {
                const [month, year] = exp.period.split(' ');
                if(!month || !year || (selectedYear !== 'all' && selectedYear !== year)) return;
                try {
                    const date = parse(`${month} 1, ${year}`, 'MMMM d, yyyy', new Date());
                    const monthKey = formatDate(date, 'MMM yy');
                    if (!monthlyData[monthKey]) {
                        monthlyData[monthKey] = { month: monthKey, income: 0, cost: 0 };
                    }
                    monthlyData[monthKey].cost += exp.amount;
                } catch (e) {
                    console.warn(`Could not parse date for cost period: ${exp.period}`);
                }
            }
        });
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
  }, [projects, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Cumulative Monthly Profit</CardTitle>
            <CardDescription>Aggregated income vs. cost across all projects.</CardDescription>
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
                tickFormatter={(value) => formatCurrencyMillions(Number(value))}
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
