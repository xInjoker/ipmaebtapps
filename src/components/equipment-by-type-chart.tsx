
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
  count: { 
    label: 'Count',
    color: 'hsl(var(--chart-2))'
  },
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
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
});
