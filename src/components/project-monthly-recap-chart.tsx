
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ComposedChart } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState, useMemo, useEffect } from 'react';
import { Expand } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';


type MonthlyData = {
    month: string;
    paid: number;
    invoiced: number;
    pad: number;
    documentPreparation: number;
    cost: Record<string, number>;
};

type ProjectMonthlyRecapChartProps = {
  data: MonthlyData[];
};

const incomeChartConfig: ChartConfig = {
    paid: {
        label: 'Paid',
        color: 'hsl(var(--chart-1))',
    },
    invoiced: {
        label: 'Invoiced',
        color: 'hsl(var(--chart-2))',
    },
    pad: {
        label: 'PAD',
        color: 'hsl(var(--chart-3))',
    },
    documentPreparation: {
        label: 'Doc Prep',
        color: 'hsl(var(--chart-4))',
    },
};

const costChartConfig: ChartConfig = {
    'Tenaga Ahli dan Labour Supply': { label: 'TA & LS', color: 'hsl(var(--chart-5))' },
    'Perjalanan Dinas': { label: 'Perdin', color: 'hsl(var(--chart-6))' },
    'Operasional': { label: 'Operasional', color: 'hsl(var(--chart-7))' },
    'Fasilitas dan Interen': { label: 'Fasilitas', color: 'hsl(var(--chart-8))' },
    'Promosi': { label: 'Promosi', color: 'hsl(var(--chart-9))' },
    'Other': { label: 'Other', color: 'hsl(var(--chart-10))' },
};

const chartConfig: ChartConfig = { ...incomeChartConfig, ...costChartConfig };

const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;

    const incomeItems = Object.entries(incomeChartConfig)
        .map(([key, config]) => ({
            name: config.label,
            value: data[key],
            color: config.color,
        }))
        .filter(item => item.value > 0);

    const costItems = Object.entries(costChartConfig)
        .map(([key, config]) => ({
            name: config.label,
            value: data.cost[key],
            color: config.color,
        }))
        .filter(item => item && item.value > 0);
    
    if (incomeItems.length === 0 && costItems.length === 0) return null;

    return (
        <div className="min-w-[12rem] rounded-lg border bg-background p-2 text-sm shadow-sm">
            <div className="font-bold">{label}</div>
            
            {incomeItems.length > 0 && (
                <div className="mt-2 space-y-1">
                    {incomeItems.map((item, index) => (
                         <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="mr-2 h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-bold">{formatCurrencyCompact(item.value)}</span>
                        </div>
                    ))}
                </div>
            )}
            
            {incomeItems.length > 0 && costItems.length > 0 && <Separator className="my-2" />}

            {costItems.length > 0 && (
                <div className="space-y-1">
                     {costItems.map((item, index) => (
                         <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="mr-2 h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                                <span className="text-muted-foreground">{item.name}</span>
                            </div>
                            <span className="font-bold">{formatCurrencyCompact(item.value)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


function Chart({ data }: { data: ProjectMonthlyRecapChartProps['data'] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <ComposedChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatCurrencyCompact(Number(value))}
        />
        <ChartTooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={<CustomTooltipContent />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="paid" stackId="income" fill="var(--color-paid)" radius={[4, 4, 0, 0]} barSize={30} />
        <Bar dataKey="invoiced" stackId="income" fill="var(--color-invoiced)" barSize={30}/>
        <Bar dataKey="pad" stackId="income" fill="var(--color-pad)" barSize={30}/>
        <Bar dataKey="documentPreparation" stackId="income" fill="var(--color-documentPreparation)" barSize={30}/>
        
        {Object.keys(costChartConfig).map((key) => (
             <Bar key={key} dataKey={`cost.${key}`} stackId="cost" fill={(costChartConfig[key as keyof typeof costChartConfig] as any).color} radius={[4, 4, 0, 0]} barSize={30}/>
        ))}

      </ComposedChart>
    </ChartContainer>
  );
}

export function ProjectMonthlyRecapChart({
  data,
}: ProjectMonthlyRecapChartProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return ['all'];
    const years = new Set(data.map((item) => `20${item.month.split("'")[1]}`));
    return ['all', ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
  }, [data]);

  useEffect(() => {
    if (availableYears.length > 1) {
      setSelectedYear(availableYears[1]);
    } else {
      setSelectedYear('all');
    }
  }, [availableYears]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedYear === 'all') {
      return data;
    }
    return data.filter(
      (item) => `20${item.month.split("'")[1]}` === selectedYear
    );
  }, [data, selectedYear]);

  const chartData = filteredData.slice(-6);
  const fullChartData = filteredData;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Monthly Financial Recap</CardTitle>
              <CardDescription>
                Recapitulation of Income Components and Costs.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDialogOpen(true)}
              >
                <Expand className="h-4 w-4" />
                <span className="sr-only">Fullscreen</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Chart data={chartData} />
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              Monthly Financial Recap: {selectedYear === 'all' ? 'All Years' : selectedYear}
            </DialogTitle>
            <DialogDescription>
              Full view of the project's monthly financial recapitulation.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[60vh]">
            <Chart data={fullChartData} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
