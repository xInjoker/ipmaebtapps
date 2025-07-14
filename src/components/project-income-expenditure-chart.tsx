
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
import { useProjects } from '@/context/ProjectContext';
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
  const { getProjectStats } = useProjects();
  
  const chartData = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    const { totalProjectValue, totalCost, totalIncome } = getProjectStats(projects);

    return [
      { name: 'Total Value', value: totalProjectValue, fill: 'var(--color-value)' },
      { name: 'Total Income', value: totalIncome, fill: 'var(--color-income)' },
      { name: 'Total Expenditure', value: totalCost, fill: 'var(--color-expenditure)' },
    ];
  }, [projects, getProjectStats]);

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

