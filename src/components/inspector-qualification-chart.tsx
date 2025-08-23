
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, memo } from 'react';
import type { Inspector } from '@/lib/inspectors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatQualificationName } from '@/lib/utils';

type CombinedPersonnel = Inspector & { type: 'Inspector' | 'Employee' };

type InspectorQualificationChartProps = {
  inspectors: CombinedPersonnel[];
};

const chartConfig: ChartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-2))',
  },
};

export const InspectorQualificationChart = memo(function InspectorQualificationChart({ inspectors }: InspectorQualificationChartProps) {
  
  const chartData = useMemo(() => {
    if (!inspectors) return [];

    const qualificationCounts: Record<string, number> = {};
    
    inspectors.forEach(inspector => {
        const uniqueQualifications = new Set<string>();
        (inspector.qualifications || []).forEach(q => {
            const formattedName = formatQualificationName(q.name);
            uniqueQualifications.add(formattedName);
        });

        uniqueQualifications.forEach(qualName => {
            qualificationCounts[qualName] = (qualificationCounts[qualName] || 0) + 1;
        });
    });

    return Object.entries(qualificationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15); // Display top 15 for clarity
  }, [inspectors]);

  return (
     <Card>
        <CardHeader>
            <div>
                <CardTitle>Top Inspector Qualifications</CardTitle>
                <CardDescription>Total number of inspectors holding each certification.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[600px] w-full">
            <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ left: 50, right: 20 }}
                accessibilityLayer
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={150}
                    className="text-xs"
                />
                <XAxis type="number" allowDecimals={false} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                        hideLabel
                        formatter={(value) => `${value} inspectors`}
                    />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
});
