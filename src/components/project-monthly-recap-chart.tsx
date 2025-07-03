'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type ProjectMonthlyRecapChartProps = {
  data: {
    month: string;
    invoicedAndPaid: number;
    pad: number;
    expenditure: number;
  }[];
};

const chartConfig: ChartConfig = {
  invoicedAndPaid: {
    label: 'Invoiced & Paid',
    color: 'hsl(var(--chart-1))',
  },
  pad: {
    label: 'PAD',
    color: 'hsl(var(--chart-2))',
  },
  expenditure: {
    label: 'Expenditure',
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

export function ProjectMonthlyRecapChart({ data }: ProjectMonthlyRecapChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
            tickFormatter={(value) => formatCurrencyCompact(Number(value))}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent
            formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(value))}
            indicator="dot"
           />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="invoicedAndPaid" fill="var(--color-invoicedAndPaid)" radius={4} />
        <Bar dataKey="pad" fill="var(--color-pad)" radius={4} />
        <Bar dataKey="expenditure" fill="var(--color-expenditure)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
