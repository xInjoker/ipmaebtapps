
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
import type { Project } from '@/lib/projects';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

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
      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
        <p className="font-bold">{label}</p>
        <p className="text-muted-foreground">Total SO Value: {formatCurrency(data.total)}</p>
        <div className="mt-2 space-y-1">
          {payload.map((item: any) => (
            <div key={item.dataKey} className="flex items-center gap-2">
                 <div className={cn("h-2.5 w-2.5 shrink-0 rounded-[2px]")} style={{ backgroundColor: item.color }}/>
                 <span className="font-medium text-muted-foreground">{chartConfig[item.dataKey as keyof typeof chartConfig]?.label || item.dataKey}:</span>
                 <span className="ml-auto font-mono font-semibold">{formatCurrencyCompact(item.value)}</span>
                 <span className="font-mono text-muted-foreground">({((item.value / data.total) * 100).toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


export function ProjectServiceOrderChart({ project }: ProjectServiceOrderChartProps) {
  const chartData = useMemo(() => {
    if (!project) return [];
    
    const serviceOrders = project.serviceOrders || [];
    const invoices = project.invoices || [];

    const invoicedBySo = invoices.reduce((acc, invoice) => {
        if (invoice.status !== 'Cancel') {
            acc[invoice.soNumber] = (acc[invoice.soNumber] || 0) + invoice.value;
        }
        return acc;
    }, {} as Record<string, number>);

    return serviceOrders.map(so => {
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
    <Card>
      <CardHeader>
        <CardTitle>Service Order Progress</CardTitle>
        <CardDescription>A breakdown of invoiced vs. remaining value for each Service Order.</CardDescription>
      </CardHeader>
      <CardContent>
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
            <ChartTooltip
              cursor={false}
              content={<CustomTooltip />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="invoiced" fill="var(--color-invoiced)" stackId="a" radius={[4, 0, 0, 4]} />
            <Bar dataKey="remaining" fill="var(--color-remaining)" stackId="a" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
