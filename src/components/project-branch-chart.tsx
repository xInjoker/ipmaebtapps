
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Project } from '@/lib/data';
import type { Branch } from '@/lib/users';
import { formatCurrency, formatCurrencyMillions } from '@/lib/utils';

type ProjectBranchChartProps = {
  projects: Project[];
  branches: Branch[];
};

const chartConfig = {
  value: {
    label: 'Project Value',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


export function ProjectBranchChart({ projects, branches }: ProjectBranchChartProps) {
  const chartData = useMemo(() => {
    if (!projects) return [];
    
    const valueByBranch = projects.reduce((acc, project) => {
        if (project.branchId) {
            acc[project.branchId] = (acc[project.branchId] || 0) + project.value;
        }
        return acc;
    }, {} as Record<string, number>);

    return branches
        .map(branch => {
            const branchValue = valueByBranch[branch.id];
            if (!branchValue) return null;
            return {
                name: branch.name.replace('Cabang ', ''),
                value: branchValue
            };
        })
        .filter(Boolean)
        .sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  }, [projects, branches]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart 
        data={chartData} 
        layout="vertical"
        margin={{
            left: 20
        }}
        accessibilityLayer
       >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          width={80}
        />
        <XAxis
            type="number"
            tickFormatter={(value) => formatCurrencyMillions(Number(value))}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value) => formatCurrency(Number(value))}
            indicator="dot" 
          />}
        />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
