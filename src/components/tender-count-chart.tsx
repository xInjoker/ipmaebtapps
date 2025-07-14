
"use client"

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
import { tenderStatuses } from "@/lib/tenders";

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

    return tenderStatuses.map((status) => ({
      status,
      count: statusCounts[status] || 0,
    }));
  }, [tenders]);

  const allStatuses = chartData.map(d => d.status);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <RadarChart data={chartData}>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelKey="status"
              payloadKey="count"
              indicator="dot"
            />
          }
        />
        <PolarGrid />
        <PolarAngleAxis dataKey="status" />
        <PolarRadiusAxis />
        {allStatuses.map((status) => (
          <Radar
            key={status}
            name={status}
            dataKey="count"
            data={chartData.filter((d) => d.status === status)}
            fill={`var(--color-${status})`}
            fillOpacity={0.6}
            stroke={`var(--color-${status})`}
          />
        ))}
      </RadarChart>
    </ChartContainer>
  );
}
