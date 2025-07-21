
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
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/data';
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

type ProjectExpenditurePieChartProps = {
  project: Project;
};

const chartConfig = {
  expenditure: {
    label: 'Expenditure',
  },
  'PT dan PTT': { color: 'hsl(var(--chart-1))' },
  'PTT Project': { color: 'hsl(var(--chart-2))' },
  'Tenaga Ahli dan Labour Supply': { color: 'hsl(var(--chart-3))' },
  'Perjalanan Dinas': { color: 'hsl(var(--chart-4))' },
  'Operasional': { color: 'hsl(var(--chart-5))' },
  'Fasilitas dan Interen': { color: 'hsl(var(--chart-1))' },
  'Amortisasi': { color: 'hsl(var(--chart-2))' },
  'Kantor dan Diklat': { color: 'hsl(var(--chart-3))' },
  'Promosi': { color: 'hsl(var(--chart-4))' },
  'Umum': { color: 'hsl(var(--chart-5))' },
  'Other': { color: 'hsl(var(--muted-foreground))' },
} satisfies ChartConfig;

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const totalExpenditure = payload.totalExpenditure;
  
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm font-bold">
            {formatCurrencyCompact(value)}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
           ({(percent * 100).toFixed(2)}%)
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

export function ProjectExpenditurePieChart({ project }: ProjectExpenditurePieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = React.useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  
  const { chartData, totalExpenditure } = useMemo(() => {
    if (!project) return { chartData: [], totalExpenditure: 0 };
    
    const expenditureByCategory = project.expenditures
      .filter(exp => exp.status === 'Approved')
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as Record<string, number>);

    const total = Object.values(expenditureByCategory).reduce((sum, val) => sum + val, 0);

    const data = Object.entries(expenditureByCategory).map(([category, value]) => ({
      name: category,
      value,
      fill: chartConfig[category as keyof typeof chartConfig]?.color || 'hsl(var(--muted-foreground))',
    }));
    
    return { chartData: data, totalExpenditure: total };
  }, [project]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenditure Realization</CardTitle>
        <CardDescription>A pie chart breakdown of all project expenditures by category.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            {totalExpenditure > 0 ? (
                <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent
                        hideLabel
                        valueFormatter={formatCurrencyCompact}
                       />}
                    />
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={onPieEnter}
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={80}
                      outerRadius={120}
                      strokeWidth={2}
                    >
                      {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      className="flex-wrap"
                    />
                </PieChart>
            ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No expenditure data available.
                </div>
            )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
