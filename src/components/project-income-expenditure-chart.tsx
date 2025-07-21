
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/data';
import { useProjects } from '@/context/ProjectContext';
import { formatCurrency, formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


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
  const { getProjectStats } = useProjects();
  const [selectedYear, setSelectedYear] = useState('all');

  const availableYears = useMemo(() => {
    const years = new Set(projects.flatMap(p => [...p.invoices, ...p.expenditures].map(i => i.period.split(' ')[1])).filter(Boolean));
    return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [projects]);
  
  const chartData = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    const filteredProjects = selectedYear === 'all' 
        ? projects 
        : projects.map(p => ({
            ...p,
            invoices: p.invoices.filter(inv => inv.period.endsWith(selectedYear)),
            expenditures: p.expenditures.filter(exp => exp.period.endsWith(selectedYear)),
        }));

    const { totalProjectValue, totalCost, totalIncome } = getProjectStats(filteredProjects);
    
    // For "all years", totalProjectValue should be the sum of all projects, not just filtered ones
    const finalTotalProjectValue = selectedYear === 'all' ? getProjectStats(projects).totalProjectValue : totalProjectValue;

    return [
      { name: 'Total Value', value: finalTotalProjectValue, fill: 'var(--color-value)' },
      { name: 'Total Income', value: totalIncome, fill: 'var(--color-income)' },
      { name: 'Total Expenditure', value: totalCost, fill: 'var(--color-expenditure)' },
    ];
  }, [projects, getProjectStats, selectedYear]);

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Income vs Expenditure</CardTitle>
                <CardDescription>A comparison of total income, expenditure, and contract value.</CardDescription>
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
                    hideLabel
                    formatter={(value) => formatCurrencyCompact(Number(value))}
                  />}
                />
                <Bar dataKey="value" radius={4} />
            </BarChart>
            </ChartContainer>
      </CardContent>
    </Card>
  );
}
