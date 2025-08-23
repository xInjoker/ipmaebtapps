
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, memo } from 'react';
import type { Tender, TenderStatus } from '@/lib/tenders';
import { formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { tenderStatuses } from '@/lib/tenders';


type TenderSummaryChartProps = {
  tenders: Tender[];
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Tender Value',
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
    color: 'hsl(var(--success))',
  },
  Prequalification: {
    label: 'Prequalification',
    color: 'hsl(var(--chart-4))',
  },
  Lost: {
    label: 'Lost',
    color: 'hsl(var(--destructive))',
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--muted))',
  },
};


export const TenderSummaryChart = memo(function TenderSummaryChart({ tenders }: TenderSummaryChartProps) {
  
  const chartData = useMemo(() => {
    if (!tenders) return [];
    
    const statusValues = tenders.reduce((acc, tender) => {
      const value = tender.bidPrice || tender.ownerEstimatePrice || 0;
      acc[tender.status] = (acc[tender.status] || 0) + value;
      return acc;
    }, {} as Record<TenderStatus, number>);

    return tenderStatuses.map((status) => ({
        status,
        value: statusValues[status] || 0,
    })).filter(item => item.value > 0);
  }, [tenders]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Tender Value Summary by Status</CardTitle>
          <CardDescription>A summary of total tender value for each status.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart 
            data={chartData} 
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
                tickFormatter={(value) => formatCurrencyMillions(Number(value))}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel
                valueFormatter={formatCurrencyCompact}
              />}
            />
            <Bar dataKey="value" radius={4}>
                {chartData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={`var(--color-${entry.status})`} />
                ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
});
