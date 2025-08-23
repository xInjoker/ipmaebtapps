
"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Sector, PieProps } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Project, InvoiceItem } from '@/lib/projects';
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type CumulativeIncomePieChartProps = {
  projects: Project[];
};

interface ChartProps extends PieProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string; value: number };
}

const chartConfig = {
  Paid: {
    label: 'Paid',
    color: 'hsl(var(--chart-1))',
  },
  'Invoiced': {
    label: 'Invoiced',
    color: 'hsl(var(--chart-2))',
  },
  'Re-invoiced': {
    label: 'Re-invoiced',
    color: 'hsl(var(--chart-3))'
  },
  'PAD': {
    label: 'PAD',
    color: 'hsl(var(--chart-4))'
  },
  'Cancel': {
      label: 'Cancelled',
      color: 'hsl(var(--destructive))',
  }
} satisfies ChartConfig;

const renderActiveShape = (props: any, totalValue: number) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-bold">
            {formatCurrencyCompact(totalValue)}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
           Total Income
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

export const CumulativeIncomePieChart = React.memo(function CumulativeIncomePieChart({ projects }: CumulativeIncomePieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = React.useCallback(
    (_: unknown, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  
  const { chartData, totalValue } = useMemo(() => {
    const allInvoices = projects.flatMap(p => p.invoices || []);

    const valueByStatus = allInvoices.reduce((acc, invoice) => {
        const status = invoice.status;
        if (status) { // Include all statuses now
            acc[status] = (acc[status] || 0) + invoice.value;
        }
        return acc;
    }, {} as Record<string, number>);
    
    const data = Object.entries(valueByStatus)
      .map(([status, value]) => ({
        name: status,
        value,
        fill: chartConfig[status as keyof typeof chartConfig]?.color || 'hsl(var(--muted-foreground))',
      }))
      .filter(d => d.value > 0);

    // Total value for the pie chart label will not include "Cancel"
    const total = data
        .filter(d => d.name !== 'Cancel')
        .reduce((sum, item) => sum + item.value, 0);
    
    return { chartData: data, totalValue: total };
  }, [projects]);

  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle>Income Realization</CardTitle>
            <CardDescription>
                A breakdown of realized income. Profit is calculated by (PAD + Paid + Invoiced) - Cost Realization.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            {totalValue > 0 || chartData.some(d => d.name === 'Cancel') ? (
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
                      activeShape={(props: any) => renderActiveShape(props, totalValue)}
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
                    No income data available for the selected period.
                </div>
            )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
});
