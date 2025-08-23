
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
import type { Inspector } from '@/lib/inspectors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { getDocumentStatus } from "@/lib/utils";

type InspectorCertificateStatusChartProps = {
  inspectors: Inspector[];
};

const chartConfig: ChartConfig = {
  Valid: { label: 'Valid', color: 'hsl(var(--success))' },
  'Expiring Soon': { label: 'Expiring Soon', color: 'hsl(var(--warning))' },
  'Expired': { label: 'Expired', color: 'hsl(var(--destructive))' },
};

const renderActiveShape = (props: any, totalCerts: number) => {
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

export const InspectorCertificateStatusChart = React.memo(function InspectorCertificateStatusChart({ inspectors }: InspectorCertificateStatusChartProps) {
    const [activeIndex, setActiveIndex] = React.useState(0);

    const onPieEnter = React.useCallback(
        (_: unknown, index: number) => {
            setActiveIndex(index);
        },
        [setActiveIndex]
    );

    const { chartData, totalCerts } = useMemo(() => {
        const statusCounts = {
            'Valid': 0,
            'Expiring Soon': 0,
            'Expired': 0,
        };

        inspectors.forEach(inspector => {
            const allDocs = [...(inspector.qualifications || []), ...(inspector.otherDocuments || [])];
            allDocs.forEach(doc => {
                const status = getDocumentStatus(doc.expirationDate);
                if (status.text.startsWith('Expires in')) {
                    statusCounts['Expiring Soon']++;
                } else {
                    statusCounts[status.text as keyof typeof statusCounts]++;
                }
            });
        });
        
        const data = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value,
          fill: chartConfig[name as keyof typeof chartConfig]?.color || 'hsl(var(--muted))',
        }));

        return { chartData: data, totalCerts: data.reduce((sum, item) => sum + item.value, 0) };
    }, [inspectors]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Certificate Health Overview</CardTitle>
                <CardDescription>Status of all inspector qualifications.</CardDescription>
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
                            activeShape={(props: any) => renderActiveShape(props, totalCerts)}
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
                </ChartContainer>
            </CardContent>
        </Card>
    );
});
