

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
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type ProjectBudgetExpenditureChartProps = {
  project: Project;
};

const chartConfig: ChartConfig = {
  budget: {
    label: 'Budget',
    color: 'hsl(var(--chart-1))',
  },
  cost: {
    label: 'Cost',
    color: 'hsl(var(--chart-2))',
  },
};

export function ProjectBudgetExpenditureChart({ project }: ProjectBudgetExpenditureChartProps) {
  const chartData = useMemo(() => {
    if (!project) return [];
    
    const costs = project.costs || [];
    const budgets = project.budgets || {};
    
    const spentByCategory = costs.reduce((acc, item) => {
        if (item.status === 'Approved') {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
        }
        return acc;
    }, {} as { [category: string]: number });

    return Object.entries(budgets)
      .filter(([, budgetValue]) => budgetValue > 0)
      .map(([category, budgetValue]) => ({
        name: category,
        budget: budgetValue,
        cost: spentByCategory[category] || 0,
      }));
  }, [project]);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Cost vs Budget</CardTitle>
            <CardDescription>A comparison of budgeted amounts versus actual costs by category.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    valueFormatter={formatCurrencyCompact}
                    hideLabel
                   />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
                <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
              </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
