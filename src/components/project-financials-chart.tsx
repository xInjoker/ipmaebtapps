'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type ProjectFinancialsChartProps = {
  data: {
    name: string;
    value: number;
    cost: number;
    invoiced: number;
  };
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Contract Value',
    color: 'hsl(var(--chart-1))',
  },
  cost: {
    label: 'Total Cost',
    color: 'hsl(var(--chart-2))',
  },
  invoiced: {
    label: 'Total Invoiced',
    color: 'hsl(var(--chart-3))',
  },
};

function formatCurrencyCompact(value: number) {
    return new Intl.NumberFormat('id-ID', {
        notation: 'compact',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    }).format(value);
}

export function ProjectFinancialsChart({ data }: ProjectFinancialsChartProps) {
    const chartData = [
        {
            name: data.name,
            value: data.value,
            cost: data.cost,
            invoiced: data.invoiced
        }
    ];

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={false}
        />
        <YAxis
            tickFormatter={formatCurrencyCompact}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Legend content={<ChartLegendContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
        <Bar dataKey="cost" fill="var(--color-cost)" radius={4} />
        <Bar dataKey="invoiced" fill="var(--color-invoiced)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
