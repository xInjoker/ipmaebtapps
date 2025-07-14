
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
import type { Project, InvoiceItem } from '@/lib/data';
import { formatCurrency } from "@/lib/utils";

type ProjectStatusChartProps = {
  projects: Project[];
};

const chartConfig = {
  value: {
    label: 'Invoice Value',
  },
  'Paid': {
    label: 'Paid',
    color: 'hsl(var(--chart-1))',
  },
  'Invoiced': {
    label: 'Invoiced',
    color: 'hsl(var(--chart-2))',
  },
  'PAD': {
    label: 'PAD',
    color: 'hsl(var(--chart-3))',
  },
  'Document Preparation': {
    label: 'Document Preparation',
    color: 'hsl(var(--chart-4))',
  },
  'Re-invoiced': {
    label: 'Re-invoiced',
    color: 'hsl(var(--chart-5))',
  },
  'Cancel': {
    label: 'Cancelled',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;


export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const chartData = useMemo(() => {
    if (!projects) return [];
    
    const valueByStatus = projects
      .flatMap(p => p.invoices)
      .reduce((acc, invoice) => {
        const status = invoice.status;
        acc[status] = (acc[status] || 0) + invoice.value;
        return acc;
    }, {} as Record<InvoiceItem['status'], number>);

    return Object.entries(chartConfig)
        .filter(([key]) => key !== 'value')
        .map(([status, config]) => ({
            status,
            value: valueByStatus[status as InvoiceItem['status']] || 0,
            fill: `var(--color-${status.replace(/ /g, '')})`,
        })).filter(d => d.value > 0);
  }, [projects]);


  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value) => formatCurrency(Number(value))}
            hideLabel 
          />}
        />
        <Pie
          data={chartData}
          dataKey="value"
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

