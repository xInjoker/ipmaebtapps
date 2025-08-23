
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
import type { EquipmentItem, EquipmentStatus } from '@/lib/equipment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type EquipmentStatusChartProps = {
  equipment: EquipmentItem[];
};

const chartConfig: ChartConfig = {
  Normal: { label: 'Normal', color: 'hsl(var(--success))' },
  'In Maintenance': { label: 'In Maintenance', color: 'hsl(var(--warning))' },
  Broken: { label: 'Broken', color: 'hsl(var(--destructive))' },
};

const renderActiveShape = (props: any, totalEquipment: number) => {
    const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle, endAngle, fill, payload } = props;
    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-2xl font-bold">
                {payload.value}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-sm">
                {payload.name}
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
        </g>
    );
};

export const EquipmentStatusChart = React.memo(function EquipmentStatusChart({ equipment }: EquipmentStatusChartProps) {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const onPieEnter = React.useCallback(
        (_: unknown, index: number) => {
            setActiveIndex(index);
        },
        [setActiveIndex]
    );

    const chartData = useMemo(() => {
        const statusCounts = equipment.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {} as Record<EquipmentStatus, number>);
        
        return Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value,
          fill: chartConfig[name as keyof typeof chartConfig]?.color || 'hsl(var(--muted))',
        }));
    }, [equipment]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Equipment Status Overview</CardTitle>
                <CardDescription>Breakdown of all equipment by operational status.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={(props: any) => renderActiveShape(props, equipment.length)}
                            onMouseEnter={onPieEnter}
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={80}
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
                </ChartContainer>
            </CardContent>
        </Card>
    );
});
