
"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Project } from '@/lib/data';

type ProjectStatusChartProps = {
  projects: Project[];
};

const chartConfig = {
  count: {
    label: 'Project Count',
  },
  'Not Started': {
    label: 'Not Started',
    color: 'hsl(var(--chart-1))',
  },
  'In Progress': {
    label: 'In Progress',
    color: 'hsl(var(--chart-2))',
  },
  'Nearing Completion': {
    label: 'Nearing Completion',
    color: 'hsl(var(--chart-3))',
  },
  'Completed': {
    label: 'Completed',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;


export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const chartData = useMemo(() => {
    if (!projects) return [];
    
    const statusCounts = projects.reduce((acc, project) => {
        const totalInvoiced = project.invoices
            .filter(inv => inv.status === 'Invoiced' || inv.status === 'Paid')
            .reduce((sum, inv) => sum + inv.value, 0);
        
        const progress = project.value > 0 ? (totalInvoiced / project.value) * 100 : 0;

        let status: keyof typeof chartConfig;
        if (progress === 0) {
            status = 'Not Started';
        } else if (progress < 80) {
            status = 'In Progress';
        } else if (progress < 100) {
            status = 'Nearing Completion';
        } else {
            status = 'Completed';
        }
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(chartConfig)
        .filter(([key]) => key !== 'count')
        .map(([status, config]) => ({
            status,
            count: statusCounts[status] || 0,
            fill: `var(--color-${status})`,
        })).filter(d => d.count > 0);
  }, [projects]);


  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={80}
          outerRadius={120}
          strokeWidth={2}
        >
           {chartData.map((entry) => (
            <Cell key={`cell-${entry.status}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="status" />}
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          className="flex-wrap"
        />
      </PieChart>
    </ChartContainer>
  );
}
