
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
import type { Project, InvoiceItem } from '@/lib/projects';
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type CumulativeIncomePieChartProps = {
  projects: Project[];
};

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

export function CumulativeIncomePieChart({ projects }: CumulativeIncomePieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState('all');

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  
  const availableYears = useMemo(() => {
    const years = new Set(projects.flatMap(p => (p.invoices || []).map(i => i.period.split(' ')[1])).filter(Boolean));
    return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [projects]);
  
  const { chartData, totalValue } = useMemo(() => {
    const allInvoices = projects.flatMap(p => p.invoices || []);

    const filteredInvoices = selectedYear === 'all' 
        ? allInvoices
        : allInvoices.filter(inv => inv.period.endsWith(selectedYear));

    const valueByStatus = filteredInvoices.reduce((acc, invoice) => {
        const status = invoice.status;
        if (status === 'Paid' || status === 'Invoiced' || status === 'Re-invoiced' || status === 'PAD') {
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

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return { chartData: data, totalValue: total };
  }, [projects, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Income Realization</CardTitle>
            <CardDescription>A breakdown of realized income including remaining PAD.</CardDescription>
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
                      activeShape={(props) => renderActiveShape(props, totalValue)}
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
}
