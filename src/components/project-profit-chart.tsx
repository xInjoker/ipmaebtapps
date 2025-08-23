
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, memo } from 'react';
import type { Project } from '@/lib/projects';
import { formatCurrencyCompact } from '@/lib/utils';
import { parse, format as formatDate } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';


type ProjectProfitChartProps = {
  project: Project | null;
};

const chartConfig: ChartConfig = {
  profit: {
    label: 'Profit',
  },
};

export const ProjectProfitChart = memo(function ProjectProfitChart({ project }: ProjectProfitChartProps) {
  
  const chartData = useMemo(() => {
    if (!project) return [];
    
    const monthlyData: Record<string, { month: string, income: number, cost: number }> = {};
    
    const processPeriod = (period: string, value: number, type: 'income' | 'cost') => {
        if(!period) return;
        const [month, year] = period.split(' ');
        if(!month || !year) return;
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
    
    (project.invoices || []).forEach(invoice => {
        if (['Paid', 'Invoiced', 'PAD', 'Re-invoiced'].includes(invoice.status)) {
            processPeriod(invoice.period, invoice.value, 'income');
        }
    });
      
    (project.costs || []).forEach(exp => {
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

    return sortedData;
  }, [project]);

  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle>Monthly Profit</CardTitle>
            <CardDescription>Realized income vs. cost for each month.</CardDescription>
        </div>
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
});
