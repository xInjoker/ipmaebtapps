
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
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, formatCurrencyCompact, formatCurrencyMillions } from '@/lib/utils';
import { addMonths, format as formatDate, parse } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';


type ProjectTargetRealizationChartProps = {
  projects: Project[];
};

const chartConfig: ChartConfig = {
  incomeTarget: {
    label: 'Income Target',
    color: 'hsl(var(--chart-1))',
  },
  costTarget: {
    label: 'Cost Target',
    color: 'hsl(var(--chart-2))',
  },
  incomeRealization: {
    label: 'Income Realization',
    color: 'hsl(var(--chart-4))',
  },
  costRealization: {
    label: 'Cost Realization',
    color: 'hsl(var(--chart-5))',
  },
};

export function ProjectTargetRealizationChart({ projects }: ProjectTargetRealizationChartProps) {
  const [selectedYear, setSelectedYear] = useState('all');

  const availableYears = useMemo(() => {
    if (!projects || projects.length === 0) return ['all'];
    const years = new Set<string>();
    projects.forEach(project => {
        if (!project.period) return;
        const projectStartDateMatch = project.period.match(/(\d{4})/);
        const projectStartYear = projectStartDateMatch ? parseInt(projectStartDateMatch[1], 10) : new Date().getFullYear();
        const durationInMonths = parseInt(project.duration.split(' ')[0], 10) || 1;
        let currentMonthDate = new Date(projectStartYear, 0, 1);
        for (let i = 0; i < durationInMonths; i++) {
            years.add(formatDate(currentMonthDate, 'yyyy'));
            currentMonthDate = addMonths(currentMonthDate, 1);
        }
    });
    return ['all', ...Array.from(years).sort((a,b) => Number(b) - Number(a))];
  }, [projects]);
  
  const chartData = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    const monthlyData: Record<string, { month: string, incomeTarget: number, costTarget: number, incomeRealization: number, costRealization: number }> = {};

    projects.forEach(project => {
      if (!project.period || !project.duration) return;
      const durationInMonths = parseInt(project.duration.split(' ')[0], 10) || 1;
      const monthlyIncomeTarget = project.value / durationInMonths;
      
      const totalBudget = Object.values(project.budgets).reduce((sum, val) => sum + val, 0);
      const monthlyCostTarget = totalBudget / durationInMonths;

      const projectStartDateMatch = project.period.match(/(\d{4})/);
      const projectStartYear = projectStartDateMatch ? parseInt(projectStartDateMatch[1], 10) : new Date().getFullYear();
      
      let currentMonthDate = new Date(projectStartYear, 0, 1);
      
      for (let i = 0; i < durationInMonths; i++) {
        const currentYear = formatDate(currentMonthDate, 'yyyy');
        if (selectedYear === 'all' || selectedYear === currentYear) {
            const monthKey = formatDate(currentMonthDate, 'MMM yy');
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, incomeTarget: 0, costTarget: 0, incomeRealization: 0, costRealization: 0 };
            }
            monthlyData[monthKey].incomeTarget += monthlyIncomeTarget;
            monthlyData[monthKey].costTarget += monthlyCostTarget;
        }
        currentMonthDate = addMonths(currentMonthDate, 1);
      }

      project.invoices.forEach(invoice => {
        if (!invoice.period) return;
        const [month, year] = invoice.period.split(' ');
        if(!month || !year || (selectedYear !== 'all' && selectedYear !== year)) return;
        try {
            const date = parse(`${month} 1, ${year}`, 'MMMM d, yyyy', new Date());
            const monthKey = formatDate(date, 'MMM yy');
             if (monthlyData[monthKey]) {
                if (['Paid', 'Invoiced'].includes(invoice.status)) {
                    monthlyData[monthKey].incomeRealization += invoice.value;
                }
             }
        } catch (e) {
            console.warn(`Could not parse date for invoice period: ${invoice.period}`);
        }
      });
      
      project.costs.forEach(exp => {
        if(!exp.period) return;
        const [month, year] = exp.period.split(' ');
        if(!month || !year || (selectedYear !== 'all' && selectedYear !== year)) return;
         try {
            const date = parse(`${month} 1, ${year}`, 'MMMM d, yyyy', new Date());
            const monthKey = formatDate(date, 'MMM yy');
             if (monthlyData[monthKey]) {
                if (exp.status === 'Approved') {
                    monthlyData[monthKey].costRealization += exp.amount;
                }
             }
         } catch (e) {
            console.warn(`Could not parse date for cost period: ${exp.period}`);
         }
      });
    });

    return Object.values(monthlyData).sort((a,b) => {
        try {
            const dateA = parse(a.month, 'MMM yy', new Date());
            const dateB = parse(b.month, 'MMM yy', new Date());
            return dateA.getTime() - dateB.getTime();
        } catch {
            return 0;
        }
    });
  }, [projects, selectedYear]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Target vs Realization</CardTitle>
            <CardDescription>Monthly income and cost targets vs. actual realization.</CardDescription>
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
            margin={{
              top: 5,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
                tickFormatter={(value) => formatCurrencyMillions(Number(value))}
            />
            <ChartTooltip
              content={<ChartTooltipContent
                indicator="dot"
                hideLabel
                valueFormatter={formatCurrencyCompact}
              />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="incomeTarget" fill="var(--color-incomeTarget)" radius={4} barSize={30} />
            <Bar dataKey="incomeRealization" fill="var(--color-incomeRealization)" radius={4} barSize={15} />
            <Bar dataKey="costTarget" fill="var(--color-costTarget)" radius={4} barSize={30} />
            <Bar dataKey="costRealization" fill="var(--color-costRealization)" radius={4} barSize={15} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

