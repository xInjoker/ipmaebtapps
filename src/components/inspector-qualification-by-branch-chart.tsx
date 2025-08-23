
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
import { formatQualificationName } from '@/lib/utils';
import type { TooltipProps } from 'recharts';

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

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const qualifications = data.qualifications || {};
        const qualificationEntries = Object.entries(qualifications).filter(([, count]) => Number(count) > 0);

        return (
            <div className="min-w-[12rem] rounded-lg border bg-background p-2 text-sm shadow-sm">
                <p className="font-bold">{label}</p>
                <p className="text-muted-foreground">Total Inspectors: {data.count}</p>
                {qualificationEntries.length > 0 && <div className="my-1 border-t border-border" />}
                <div className="space-y-1">
                    {qualificationEntries.map(([qual, count]) => (
                         <div key={qual} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{qual}</span>
                            <span className="font-bold">{Number(count)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export const InspectorQualificationByBranchChart = memo(function InspectorCountByBranchChart({ inspectors, branches }: InspectorCountByBranchChartProps) {
  
  const chartData = useMemo(() => {
    if (!inspectors || !branches) return [];

    const dataByBranch = branches.reduce((acc, branch) => {
        acc[branch.id] = {
            name: branch.name.replace('Cabang ', ''),
            count: 0,
            qualifications: {} as Record<string, number>,
        };
        return acc;
    }, {} as Record<string, { name: string; count: number, qualifications: Record<string, number> }>);
    
    inspectors.forEach(inspector => {
        const branchId = inspector.branchId;
        if (branchId && dataByBranch[branchId]) {
            dataByBranch[branchId].count++;
            
            const uniqueQualifications = new Set<string>();
            (inspector.qualifications || []).forEach(q => {
                const formattedName = formatQualificationName(q.name);
                uniqueQualifications.add(formattedName);
            });

            uniqueQualifications.forEach(qualName => {
                dataByBranch[branchId].qualifications[qualName] = (dataByBranch[branchId].qualifications[qualName] || 0) + 1;
            });
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
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart 
                data={chartData} 
                margin={{ left: 20 }}
                accessibilityLayer
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<CustomTooltip />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
});
