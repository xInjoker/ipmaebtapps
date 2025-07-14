
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Project } from '@/lib/data';

type ProjectExpenditureChartProps = {
  projects: Project[];
};

const chartConfig: ChartConfig = {
  budget: {
    label: 'Budget',
    color: 'hsl(var(--chart-1))',
  },
  expenditure: {
    label: 'Expenditure',
    color: 'hsl(var(--chart-2))',
  },
};

function formatCurrencyCompact(value: number) {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    }).format(value);
}

export function ProjectExpenditureChart({ projects }: ProjectExpenditureChartProps) {
  const chartData = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    const aggregatedData = projects.reduce((acc, project) => {
        // Aggregate budgets
        for (const category in project.budgets) {
            acc[category] = acc[category] || { name: category, budget: 0, expenditure: 0 };
            acc[category].budget += project.budgets[category];
        }

        // Aggregate expenditures
        project.expenditures.forEach(exp => {
             if (exp.status === 'Approved') {
                acc[exp.category] = acc[exp.category] || { name: exp.category, budget: 0, expenditure: 0 };
                acc[exp.category].expenditure += exp.amount;
             }
        });

        return acc;
    }, {} as Record<string, { name: string; budget: number; expenditure: number }>);
    
    return Object.values(aggregatedData)
        .filter(item => item.budget > 0 || item.expenditure > 0);

  }, [projects]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.split(' ').map((w: string) => w[0]).join('')}
        />
        <YAxis
            tickFormatter={(value) => formatCurrencyCompact(Number(value))}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent
            labelFormatter={(label) => label}
            formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value))}
            indicator="dot"
           />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
        <Bar dataKey="expenditure" fill="var(--color-expenditure)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
