
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
import { formatCurrency } from '@/lib/utils';

type ProjectBudgetExpenditureChartProps = {
  project: Project;
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

export function ProjectBudgetExpenditureChart({ project }: ProjectBudgetExpenditureChartProps) {
  const chartData = useMemo(() => {
    if (!project) return [];
    
    const spentByCategory = project.expenditures.reduce((acc, item) => {
        if (item.status === 'Approved') {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
        }
        return acc;
    }, {} as { [category: string]: number });

    return Object.entries(project.budgets)
      .filter(([, budgetValue]) => budgetValue > 0)
      .map(([category, budgetValue]) => ({
        name: category,
        budget: budgetValue,
        expenditure: spentByCategory[category] || 0,
      }));
  }, [project]);

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
