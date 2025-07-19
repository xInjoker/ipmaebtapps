
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
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

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

const formatFinancialValue = (value: number) => {
    if (Math.abs(value) >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(2)} M`;
    }
    if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)} Jt`;
    }
    return formatCurrency(value);
};


const renderActiveShape = (props: any, totalValue: number) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-xl font-bold">
                {formatFinancialValue(totalValue)}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-sm">
                Total
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

const CustomTooltip = ({ active, payload, totalValue }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = totalValue > 0 ? (data.value / totalValue) * 100 : 0;
    const fill = data.payload.fill; 
    const status = data.name; 
    const value = data.value;

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fill }} />
          <span className="font-medium text-muted-foreground">{status}:</span>
          <span className="ml-auto font-mono font-semibold">{formatCurrency(value)}</span>
          <span className="font-mono text-muted-foreground">({percentage.toFixed(1)}%)</span>
        </div>
      </div>
    );
  }

  return null;
};


export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const [selectedYear, setSelectedYear] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );

  const availableYears = useMemo(() => {
    const years = new Set(projects.flatMap(p => p.invoices.map(i => i.period.split(' ')[1])).filter(Boolean));
    return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [projects]);

  const { chartData, totalValue } = useMemo(() => {
    if (!projects) return { chartData: [], totalValue: 0 };
    
    const filteredInvoices = projects.flatMap(p => p.invoices)
        .filter(invoice => selectedYear === 'all' || invoice.period.endsWith(selectedYear));

    const valueByStatus = filteredInvoices
      .reduce((acc, invoice) => {
        const status = invoice.status;
        acc[status] = (acc[status] || 0) + invoice.value;
        return acc;
    }, {} as Record<InvoiceItem['status'], number>);
    
    const data = Object.entries(chartConfig)
        .filter(([key]) => key !== 'value')
        .map(([status, config]) => ({
            status,
            value: valueByStatus[status as InvoiceItem['status']] || 0,
            fill: `var(--color-${status.replace(/ /g, '')})`,
        })).filter(d => d.value > 0);

    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    
    return { chartData: data, totalValue: total };
  }, [projects, selectedYear]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invoicing Status by Value</CardTitle>
          <CardDescription>A summary of total invoice value for each status.</CardDescription>
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
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip totalValue={totalValue} />}
            />
            <Pie
              activeIndex={activeIndex}
              activeShape={(props) => renderActiveShape(props, totalValue)}
              onMouseEnter={onPieEnter}
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
      </CardContent>
    </Card>
  );
}
