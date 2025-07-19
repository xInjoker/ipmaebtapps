'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
import { formatCurrency } from '@/lib/utils';

type ProjectMonthlyRecapChartProps = {
  data: {
    month: string;
    invoicedAndPaid: number;
    pad: number;
    expenditure: number;
  }[];
};

const chartConfig: ChartConfig = {
  invoicedAndPaid: {
    label: 'Invoiced & Paid',
    color: 'hsl(var(--chart-1))',
  },
  pad: {
    label: 'PAD',
    color: 'hsl(var(--chart-2))',
  },
  expenditure: {
    label: 'Expenditure',
    color: 'hsl(var(--chart-3))',
  },
};

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

function Chart({ data }: { data: ProjectMonthlyRecapChartProps['data'] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <BarChart data={data} accessibilityLayer>
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
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
              indicator="dot"
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="invoicedAndPaid"
          fill="var(--color-invoicedAndPaid)"
          radius={4}
        />
        <Bar dataKey="pad" fill="var(--color-pad)" radius={4} />
        <Bar dataKey="expenditure" fill="var(--color-expenditure)" radius={4} />
      </BarChart>
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
    // Set default year to the most recent one if available
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
              <CardTitle>Monthly Recap</CardTitle>
              <CardDescription>
                Recapitulation of Invoiced, PAD, and Expenditures.
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
              Monthly Recap: {selectedYear === 'all' ? 'All Years' : selectedYear}
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
