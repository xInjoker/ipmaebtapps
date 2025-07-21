
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/data';
import type { Branch } from '@/lib/users';
import { formatCurrency, formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

type ProjectBranchChartProps = {
  projects: Project[];
  branches: Branch[];
};

const chartConfig = {
  value: {
    label: 'Project Value',
  },
} satisfies ChartConfig;


export function ProjectBranchChart({ projects, branches }: ProjectBranchChartProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const availableYears = useMemo(() => {
    const years = new Set(projects.flatMap(p => p.invoices.map(i => i.period.split(' ')[1])).filter(Boolean));
    return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [projects]);

  const chartData = useMemo(() => {
    if (!projects) return [];
    
    const filteredProjects = projects.filter(project => 
        selectedYear === 'all' || project.invoices.some(inv => inv.period.endsWith(selectedYear))
    );

    const valueByBranch = filteredProjects.reduce((acc, project) => {
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
  }, [projects, branches, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Project Value by Branch</CardTitle>
          <CardDescription>A summary of total project value for each branch.</CardDescription>
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
