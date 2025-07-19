
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import type { Tender, TenderStatus } from '@/lib/tenders';
import { formatCurrency, formatCurrencyMillions } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';


type TenderSummaryChartProps = {
  tenders: Tender[];
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
};


export function TenderSummaryChart({ tenders }: TenderSummaryChartProps) {
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

    const statusValues = filteredTenders.reduce((acc, tender) => {
      acc[tender.status] = (acc[tender.status] || 0) + tender.bidPrice;
      return acc;
    }, {} as Record<TenderStatus, number>);

    return Object.entries(statusValues).map(([status, value]) => ({
        status,
        value,
    }));
  }, [tenders, selectedYear]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tender Value Summary by Status</CardTitle>
          <CardDescription>A summary of total tender value for each status.</CardDescription>
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
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="status"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
                tickFormatter={(value) => formatCurrencyMillions(Number(value))}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name) => formatCurrency(Number(value))}
                indicator="dot" 
              />}
            />
            <Bar dataKey="value" radius={4}>
                {chartData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={`var(--color-${entry.status})`} />
                ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
