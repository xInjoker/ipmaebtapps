
"use client"

import * as React from "react"
import { Pie, PieChart, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
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
      fill: `var(--color-${status})`,
    })).filter(d => d.count > 0);
  }, [tenders]);

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={60}
          strokeWidth={5}
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
  );
}
