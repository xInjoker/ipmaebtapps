
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
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';

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

export function ProjectExpenditureChart({ projects }: ProjectExpenditureChartProps) {
  const [selectedYear, setSelectedYear] = useState('all');

  const availableYears = useMemo(() => {
    const years = new Set(projects.flatMap(p => p.expenditures.map(i => i.period.split(' ')[1])).filter(Boolean));
    return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [projects]);

  const chartData = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    const filteredProjects = selectedYear === 'all' 
        ? projects 
        : projects.filter(p => p.expenditures.some(exp => exp.period.endsWith(selectedYear)));

    const aggregatedData = filteredProjects.reduce((acc, project) => {
        // Aggregate budgets
        for (const category in project.budgets) {
            acc[category] = acc[category] || { name: category, budget: 0, expenditure: 0 };
            acc[category].budget += project.budgets[category];
        }

        // Aggregate expenditures for the selected year
        project.expenditures.forEach(exp => {
             if (exp.status === 'Approved' && (selectedYear === 'all' || exp.period.endsWith(selectedYear))) {
                acc[exp.category] = acc[exp.category] || { name: exp.category, budget: 0, expenditure: 0 };
                acc[exp.category].expenditure += exp.amount;
             }
        });

        return acc;
    }, {} as Record<string, { name: string; budget: number; expenditure: number }>);
    
    return Object.values(aggregatedData)
        .filter(item => item.budget > 0 || item.expenditure > 0);

  }, [projects, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Expenditure vs Budget</CardTitle>
            <CardDescription>An aggregated view of expenditures vs. budgets across all projects.</CardDescription>
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
                hideLabel
                formatter={(value) => formatCurrencyCompact(Number(value))}
              />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
            <Bar dataKey="expenditure" fill="var(--color-expenditure)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
