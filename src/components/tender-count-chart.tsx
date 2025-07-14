
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

const renderActiveShape = (props: any, totalTenders: number) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-2xl font-bold">
                {totalTenders}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-sm">
                Total Tenders
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


export function TenderCountChart({ tenders }: TenderCountChartProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
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

  const totalTenders = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          activeIndex={activeIndex}
          activeShape={(props) => renderActiveShape(props, totalTenders)}
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={80}
          outerRadius={120}
          strokeWidth={2}
          onMouseEnter={onPieEnter}
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
