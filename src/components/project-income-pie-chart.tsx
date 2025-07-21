
"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Sector } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Project, InvoiceItem } from '@/lib/data';
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

type ProjectIncomePieChartProps = {
  project: Project;
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
    label: 'Invoiced (Unpaid)',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-bold">
            {formatCurrencyCompact(value)}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
           ({(percent * 100).toFixed(1)}%)
        </text>
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
        <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 6}
            outerRadius={outerRadius + 10}
            fill={fill}
        />
      </g>
    );
};

export function ProjectIncomePieChart({ project }: ProjectIncomePieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  
  const { chartData, totalValue } = useMemo(() => {
    if (!project) return { chartData: [], totalValue: 0 };
    
    // Only consider 'Paid' and 'Invoiced' statuses for income realization.
    const relevantInvoices = project.invoices.filter(
      (invoice) => invoice.status === 'Paid' || invoice.status === 'Invoiced'
    );
    
    const valueByStatus = relevantInvoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + invoice.value;
      return acc;
    }, {} as Record<"Paid" | "Invoiced", number>);
    
    const data = Object.entries(chartConfig)
      .filter(([key]) => key === 'Paid' || key === 'Invoiced')
      .map(([status, config]) => ({
        name: config.label || status,
        value: valueByStatus[status as "Paid" | "Invoiced"] || 0,
        fill: config.color,
      }))
      .filter(d => d.value > 0);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return { chartData: data, totalValue: total };
  }, [project]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Realization (Paid vs. Invoiced)</CardTitle>
        <CardDescription>A breakdown of realized income by status.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            {totalValue > 0 ? (
                <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent
                        hideLabel
                        valueFormatter={formatCurrencyCompact}
                       />}
                    />
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={onPieEnter}
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={120}
                      strokeWidth={2}
                    >
                      {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
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
            ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No income data available.
                </div>
            )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
