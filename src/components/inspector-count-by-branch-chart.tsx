
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
import type { Branch } from '@/lib/users';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type CombinedPersonnel = Inspector & { type: 'Inspector' | 'Employee' };

type InspectorCountByBranchChartProps = {
  inspectors: CombinedPersonnel[];
  branches: Branch[];
};

const chartConfig: ChartConfig = {
  count: {
    label: 'Inspectors',
    color: 'hsl(var(--chart-1))',
  },
};

export const InspectorCountByBranchChart = memo(function InspectorCountByBranchChart({ inspectors, branches }: InspectorCountByBranchChartProps) {
  
  const chartData = useMemo(() => {
    if (!inspectors || !branches) return [];

    const dataByBranch = branches.reduce((acc, branch) => {
        acc[branch.id] = {
            name: branch.name.replace('Cabang ', ''),
            count: 0
        };
        return acc;
    }, {} as Record<string, { name: string; count: number }>);
    
    inspectors.forEach(inspector => {
        const branchId = inspector.branchId;
        if (branchId && dataByBranch[branchId]) {
            dataByBranch[branchId].count++;
        }
    });

    return Object.values(dataByBranch)
        .filter(branchData => branchData.count > 0)
        .sort((a, b) => b.count - a.count);
  }, [inspectors, branches]);

  return (
     <Card>
        <CardHeader>
            <div>
                <CardTitle>Inspector Count by Branch</CardTitle>
                <CardDescription>Total number of inspectors in each branch.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[600px] w-full">
            <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{ left: 20 }}
                accessibilityLayer
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={100}
                />
                <XAxis type="number" />
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
