

'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useMemo, memo } from 'react';
import type { Tender, TenderStatus } from '@/lib/tenders';
import type { Branch } from '@/lib/users';
import { formatCurrency, formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { tenderStatuses } from '@/lib/tenders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type TenderBranchChartProps = {
  tenders: Tender[];
  branches: Branch[];
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Tender Value',
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
    color: 'hsl(var(--success))',
  },
  Prequalification: {
    label: 'Prequalification',
    color: 'hsl(var(--chart-4))',
  },
  Lost: {
    label: 'Lost',
    color: 'hsl(var(--destructive))',
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig;


export const TenderBranchChart = memo(function TenderBranchChart({ tenders, branches }: TenderBranchChartProps) {

  const chartData = useMemo(() => {
    if (!tenders) return [];
    
    const branchMap = new Map(branches.map(b => [b.id, b.name]));

    const valueByBranchAndStatus = tenders.reduce((acc, tender) => {
        const branchId = tender.branchId;
        if (branchId) {
            if (!acc[branchId]) {
                 acc[branchId] = tenderStatuses.reduce((statusAcc, status) => {
                    statusAcc[status] = 0;
                    return statusAcc;
                }, { total: 0 } as Record<TenderStatus | 'total', number>);
            }
            const tenderValue = tender.bidPrice || tender.ownerEstimatePrice || 0;
            acc[branchId][tender.status] = (acc[branchId][tender.status] || 0) + tenderValue;
            acc[branchId].total += tenderValue;
        }
        return acc;
    }, {} as Record<string, Record<TenderStatus | 'total', number>>);
    
    return Object.entries(valueByBranchAndStatus)
        .map(([branchId, data]) => {
            if (data.total === 0) return null;
            const branchName = branchMap.get(branchId) || branchId;
            return {
                name: branchName.replace('Cabang ', ''),
                ...data,
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => (b?.total ?? 0) - (a?.total ?? 0));
  }, [tenders, branches]);

  return (
     <Card className="lg:col-span-2">
        <CardHeader>
            <div>
                <CardTitle>Tender Value by Branch</CardTitle>
                <CardDescription>A summary of total tender value for each branch.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[600px] w-full">
            <BarChart 
                data={chartData} 
                layout="vertical"
                margin={{
                    left: 20
                }}
                accessibilityLayer
            >
                <CartesianGrid horizontal={false} />
                <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={120}
                />
                <XAxis
                    type="number"
                    tickFormatter={(value) => formatCurrencyMillions(Number(value))}
                />
                <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                    hideLabel
                    valueFormatter={formatCurrencyCompact}
                />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                {tenderStatuses.map(status => (
                <Bar 
                    key={status} 
                    dataKey={status} 
                    stackId="a" 
                    fill={`var(--color-${status})`} 
                    radius={0}
                />
                ))}
            </BarChart>
            </ChartContainer>
        </CardContent>
    </Card>
  );
});
