
'use client';

import * as React from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Tender, TenderStatus } from '@/lib/tenders';
import { formatCurrency } from '@/lib/utils';

type TenderCountChartProps = {
  tenders: Tender[];
};

const chartConfig: ChartConfig = {
  count: {
    label: 'Tender Count',
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


export function TenderCountChart({ tenders }: TenderCountChartProps) {
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
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <PolarGrid />
        <PolarAngleAxis dataKey="status" />
        <PolarRadiusAxis />
        <Radar
          dataKey="count"
          fill="hsl(var(--chart-1))"
          fillOpacity={0.6}
          stroke="hsl(var(--chart-1))"
        />
      </RadarChart>
    </ChartContainer>
  );
}
