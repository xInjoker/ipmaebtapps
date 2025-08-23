
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { EquipmentItem, EquipmentType } from '@/lib/equipment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type EquipmentByTypeChartProps = {
  equipment: EquipmentItem[];
};

const chartConfig: ChartConfig = {
  count: { label: 'Count' },
  'Dimensional & Layout': { label: "Dimensional", color: 'hsl(var(--chart-1))' },
  'NDT - Conventional': { label: "NDT Conv.", color: 'hsl(var(--chart-2))' },
  'NDT - Advanced': { label: "NDT Adv.", color: 'hsl(var(--chart-3))' },
  'Painting & Coating Inspection': { label: "Coating", color: 'hsl(var(--chart-4))' },
  'Electrical Measurement': { label: "Electrical", color: 'hsl(var(--chart-5))' },
  'Environmental & Safety': { label: "HSE", color: 'hsl(var(--chart-1))' },
  'Geolocation & Surveying': { label: "Surveying", color: 'hsl(var(--chart-2))' },
  'Pressure & Flow': { label: "Pressure/Flow", color: 'hsl(var(--chart-3))' },
  'Temperature & Humidity': { label: "Temp/Humidity", color: 'hsl(var(--chart-4))' },
  'Vibration & Condition Monitoring': { label: "Vibration", color: 'hsl(var(--chart-5))' },
  'Lifting & Rigging': { label: "Lifting", color: 'hsl(var(--indigo))' },
  'Other': { label: "Other", color: 'hsl(var(--muted))' },
};

export const EquipmentByTypeChart = React.memo(function EquipmentByTypeChart({ equipment }: EquipmentByTypeChartProps) {
    const chartData = useMemo(() => {
        const typeCounts = equipment.reduce((acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
        }, {} as Record<EquipmentType, number>);
        
        return Object.entries(typeCounts).map(([name, count]) => ({
          name,
          count,
          fill: chartConfig[name as keyof typeof chartConfig]?.color || 'hsl(var(--muted))'
        }));
    }, [equipment]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Equipment Inventory by Type</CardTitle>
                <CardDescription>Total count of equipment for each category.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 20 }} accessibilityLayer>
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={150}
                        />
                        <XAxis type="number" />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" radius={4}>
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
});
