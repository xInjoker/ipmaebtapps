
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
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
import { formatCurrency } from '@/lib/utils';

type ProjectServiceOrderChartProps = {
  project: Project;
};

const chartConfig: ChartConfig = {
  invoiced: {
    label: 'Invoiced',
    color: 'hsl(var(--chart-1))',
  },
  remaining: {
    label: 'Remaining',
    color: 'hsl(var(--chart-2))',
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-muted-foreground">Total SO Value: {formatCurrency(data.total)}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm" style={{ color: 'hsl(var(--chart-1))' }}>
            Invoiced: {formatCurrency(data.invoiced)} ({((data.invoiced / data.total) * 100).toFixed(1)}%)
          </p>
          <p className="text-sm" style={{ color: 'hsl(var(--chart-2))' }}>
            Remaining: {formatCurrency(data.remaining)} ({((data.remaining / data.total) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>
    );
  }
  return null;
};


export function ProjectServiceOrderChart({ project }: ProjectServiceOrderChartProps) {
  const chartData = useMemo(() => {
    if (!project || !project.serviceOrders) return [];
    
    const invoicedBySo = project.invoices.reduce((acc, invoice) => {
        if (invoice.status !== 'Cancel') {
            acc[invoice.soNumber] = (acc[invoice.soNumber] || 0) + invoice.value;
        }
        return acc;
    }, {} as Record<string, number>);

    return project.serviceOrders.map(so => {
        const invoicedValue = invoicedBySo[so.soNumber] || 0;
        return {
            name: so.soNumber,
            total: so.value,
            invoiced: invoicedValue,
            remaining: Math.max(0, so.value - invoicedValue),
        }
    });
  }, [project]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        stackOffset="expand"
        margin={{ left: 10, right: 10 }}
        accessibilityLayer
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={80}
        />
        <XAxis
            type="number"
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            tickLine={false}
            axisLine={false}
            domain={[0, 1]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="invoiced" fill="var(--color-invoiced)" stackId="a" radius={[4, 0, 0, 4]} />
        <Bar dataKey="remaining" fill="var(--color-remaining)" stackId="a" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
