
'use client';

import { Pie, PieChart, Cell } from 'recharts';
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
import type { Branch } from '@/lib/users';
import { formatCurrency } from '@/lib/utils';

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
                fill: `var(--color-chart-${colorIndex})`
            };
        })
        .filter(Boolean)
        .sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));
  }, [projects, branches]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart accessibilityLayer>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value, name) => `${name}: ${formatCurrency(Number(value))}`}
            hideLabel
          />}
        />
         <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={80}
          outerRadius={140}
          strokeWidth={2}
        >
           {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          className="flex-wrap"
        />
      </PieChart>
    </ChartContainer>
  );
}
