
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Tender } from '@/lib/tenders';
import type { Branch } from '@/lib/users';
import { formatCurrency, formatCurrencyMillions } from '@/lib/utils';


type TenderBranchChartProps = {
  tenders: Tender[];
  branches: Branch[];
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Tender Value',
  },
  'Regional Barat': {
    color: 'hsl(var(--chart-1))',
  },
  'Regional Timur': {
    color: 'hsl(var(--chart-2))',
  },
  'Kantor Pusat': {
    color: 'hsl(var(--chart-3))',
  },
};


export function TenderBranchChart({ tenders, branches }: TenderBranchChartProps) {
  const chartData = useMemo(() => {
    if (!tenders) return [];
    
    const branchValueMap = tenders.reduce((acc, tender) => {
        if (tender.branchId) {
            acc[tender.branchId] = (acc[tender.branchId] || 0) + tender.bidPrice;
        }
        return acc;
    }, {} as Record<string, number>);

    return branches
        .map(branch => ({
            name: branch.name.replace('Cabang ', ''),
            value: branchValueMap[branch.id] || 0,
            region: branch.region,
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);
  }, [tenders, branches]);

  return (
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
            dataKey="value"
            tickFormatter={(value) => formatCurrencyMillions(Number(value))}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent 
            formatter={(value, name, props) => (
                <div className="flex flex-col">
                    <span>{formatCurrency(Number(value))}</span>
                    <span className="text-xs text-muted-foreground">{props.payload.region}</span>
                </div>
            )}
            indicator="dot" 
          />}
        />
        <Bar dataKey="value" radius={4}>
            {chartData.map((entry) => (
                <Cell 
                    key={`cell-${entry.name}`} 
                    fill={chartConfig[entry.region as keyof typeof chartConfig]?.color || 'hsl(var(--muted-foreground))'} 
                />
            ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
