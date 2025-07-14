
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Tender, TenderStatus } from '@/lib/tenders';
import { getTenderStatusVariant } from '@/lib/utils';


type TenderSummaryChartProps = {
  tenders: Tender[];
};

const chartConfig: ChartConfig = {
  count: {
    label: 'Tenders',
  },
  Aanwijzing: {
    label: 'Aanwijzing',
    color: 'hsl(var(--chart-1))',
  },
  Bidding: {
    label: 'Bidding',
    color: 'hsl(var(--chart-2))',
  },
  Evaluation: {
    label: 'Evaluation',
    color: 'hsl(var(--chart-3))',
  },
  Awarded: {
    label: 'Awarded',
    color: 'hsl(var(--chart-4))',
  },
  Lost: {
    label: 'Lost',
    color: 'hsl(var(--chart-5))',
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--destructive))',
  },
   Prequalification: {
    label: 'Prequalification',
    color: 'hsl(var(--secondary-foreground))',
  },
};


export function TenderSummaryChart({ tenders }: TenderSummaryChartProps) {
  const chartData = useMemo(() => {
    if (!tenders) return [];
    
    const statusCounts = tenders.reduce((acc, tender) => {
      acc[tender.status] = (acc[tender.status] || 0) + 1;
      return acc;
    }, {} as Record<TenderStatus, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
    }));
  }, [tenders]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart 
        data={chartData} 
        layout="vertical"
        margin={{
            left: 20
        }}
        accessibilityLayer
       >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="status"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <XAxis
            type="number"
            dataKey="count"
            allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="count" radius={4}>
            {chartData.map((entry) => (
                <Cell key={`cell-${entry.status}`} fill={`var(--color-${entry.status})`} />
            ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
