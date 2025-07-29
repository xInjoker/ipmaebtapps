
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
import type { Project } from '@/lib/projects';
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

type ProjectIncomePieChartProps = {
  project: Project;
};

const chartConfig = {
  Paid: {
    label: 'Paid',
    color: 'hsl(var(--chart-1))',
  },
  'Invoiced (Unpaid)': {
    label: 'Invoiced (Unpaid)',
    color: 'hsl(var(--chart-2))',
  },
  'Remaining PAD': {
    label: 'Remaining PAD',
    color: 'hsl(var(--chart-3))'
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

export function ProjectIncomePieChart({ project }: ProjectIncomePieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState('all');

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  
  const availableYears = useMemo(() => {
    if (!project) return ['all'];
    const years = new Set((project.invoices || []).map(i => i.period.split(' ')[1]).filter(Boolean));
    return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [project]);
  
  const { chartData, totalValue } = useMemo(() => {
    if (!project) return { chartData: [], totalValue: 0 };
    
    const filteredInvoices = selectedYear === 'all' 
        ? (project.invoices || [])
        : (project.invoices || []).filter(inv => inv.period.endsWith(selectedYear));

    const valueByStatus: Record<string, number> = {
        'Paid': 0,
        'Invoiced (Unpaid)': 0,
        'Remaining PAD': 0,
    };

    const invoicedOrPaidValuesBySO: Record<string, number> = {};

    filteredInvoices.forEach(invoice => {
        if (invoice.status === 'Paid') {
            valueByStatus['Paid'] += invoice.value;
            invoicedOrPaidValuesBySO[invoice.soNumber] = (invoicedOrPaidValuesBySO[invoice.soNumber] || 0) + invoice.value;
        } else if (invoice.status === 'Invoiced') {
            valueByStatus['Invoiced (Unpaid)'] += invoice.value;
            invoicedOrPaidValuesBySO[invoice.soNumber] = (invoicedOrPaidValuesBySO[invoice.soNumber] || 0) + invoice.value;
        }
    });

    filteredInvoices.forEach(invoice => {
        if (invoice.status === 'PAD') {
            const invoicedAmountForSO = invoicedOrPaidValuesBySO[invoice.soNumber] || 0;
            const remainingPad = Math.max(0, invoice.value - invoicedAmountForSO);
            valueByStatus['Remaining PAD'] += remainingPad;
        }
    });
    
    const data = Object.entries(valueByStatus)
      .map(([status, value]) => ({
        name: status,
        value,
        fill: chartConfig[status as keyof typeof chartConfig]?.color || 'hsl(var(--muted-foreground))',
      }))
      .filter(d => d.value > 0);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return { chartData: data, totalValue: total };
  }, [project, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Income Realization (Paid vs. Invoiced)</CardTitle>
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
