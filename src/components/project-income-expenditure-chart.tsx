
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Project } from '@/lib/data';
import { formatCurrency, formatCurrencyMillions } from '@/lib/utils';


type ProjectIncomeExpenditureChartProps = {
  projects: Project[];
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1))',
  },
  income: {
    label: 'Income',
    color: 'hsl(var(--chart-2))',
  },
  expenditure: {
    label: 'Expenditure',
    color: 'hsl(var(--chart-3))',
  },
};


export function ProjectIncomeExpenditureChart({ projects }: ProjectIncomeExpenditureChartProps) {
  const chartData = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    const totalValue = projects.reduce((acc, p) => acc + p.value, 0);

    const totalIncome = projects
      .flatMap(p => p.invoices)
      .filter(inv => ['Paid', 'Invoiced', 'PAD', 'Re-invoiced'].includes(inv.status))
      .reduce((acc, inv) => acc + inv.value, 0);

    const totalExpenditure = projects
      .flatMap(p => p.expenditures)
      .filter(exp => exp.status === 'Approved')
      .reduce((acc, exp) => acc + exp.amount, 0);

    return [
      { name: 'Total Value', value: totalValue, fill: 'var(--color-value)' },
      { name: 'Total Income', value: totalIncome, fill: 'var(--color-income)' },
      { name: 'Total Expenditure', value: totalExpenditure, fill: 'var(--color-expenditure)' },
    ];
  }, [projects]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart 
        data={chartData} 
        layout="vertical"
        margin={{ left: 20 }}
        accessibilityLayer
       >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={100}
        />
        <XAxis
            type="number"
            tickFormatter={(value) => formatCurrencyMillions(Number(value))}
        >
          <Label value="Value (IDR)" offset={-5} position="insideBottom" />
        </XAxis>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value) => formatCurrency(Number(value))}
            indicator="dot" 
          />}
        />
        <Bar dataKey="value" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
