

'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Project } from '@/lib/data';
import type { Branch } from '@/lib/users';
import { formatCurrency, formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type ProjectBranchChartProps = {
  projects: Project[];
  branches: Branch[];
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Project Value',
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

    const chartColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    let colorIndex = 0;

    return branches
        .map(branch => {
            const branchValue = valueByBranch[branch.id];
            if (!branchValue) return null;
            const color = chartColors[colorIndex % chartColors.length];
            colorIndex++;
            return {
                name: branch.name.replace('Cabang ', ''),
                value: branchValue,
                fill: color
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => (a?.value ?? 0) - (b?.value ?? 0));
  }, [projects, branches]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Project Value by Branch</CardTitle>
          <CardDescription>A summary of total project value for each branch.</CardDescription>
        </div>
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
              width={80}
            />
            <XAxis
                type="number"
                tickFormatter={(value) => formatCurrencyMillions(Number(value))}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                valueFormatter={formatCurrencyCompact}
                hideLabel
              />}
            />
            <Bar dataKey="value" radius={4}>
                {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
