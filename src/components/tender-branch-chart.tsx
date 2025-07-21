
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Tender, TenderStatus } from '@/lib/tenders';
import type { Branch } from '@/lib/users';
import { formatCurrency, formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { tenderStatuses } from '@/lib/tenders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


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
} satisfies ChartConfig;


export function TenderBranchChart({ tenders, branches }: TenderBranchChartProps) {
  const [selectedYear, setSelectedYear] = useState('all');

  const availableYears = useMemo(() => {
    const years = new Set(tenders.map(t => new Date(t.submissionDate).getFullYear().toString()));
    return ['all', ...Array.from(years).sort((a,b) => Number(b) - Number(a))];
  }, [tenders]);

  const chartData = useMemo(() => {
    if (!tenders) return [];
    
    const filteredTenders = selectedYear === 'all' 
        ? tenders 
        : tenders.filter(t => new Date(t.submissionDate).getFullYear().toString() === selectedYear);

    const valueByBranchAndStatus = filteredTenders.reduce((acc, tender) => {
        if (tender.branchId) {
            if (!acc[tender.branchId]) {
                acc[tender.branchId] = { total: 0 };
            }
            acc[tender.branchId][tender.status] = (acc[tender.branchId][tender.status] || 0) + tender.bidPrice;
            acc[tender.branchId].total += tender.bidPrice;
        }
        return acc;
    }, {} as Record<string, Record<TenderStatus | 'total', number>>);

    return branches
        .map(branch => {
            const branchData = valueByBranchAndStatus[branch.id];
            if (!branchData || branchData.total === 0) {
                return null;
            }
            return {
                name: branch.name.replace('Cabang ', ''),
                ...branchData
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => (b?.total ?? 0) - (a?.total ?? 0));
  }, [tenders, branches, selectedYear]);

  return (
     <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Tender Value by Branch</CardTitle>
                <CardDescription>A summary of total tender bid value for each branch.</CardDescription>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {availableYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
            </Select>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                width={80}
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
}
