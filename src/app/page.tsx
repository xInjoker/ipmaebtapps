
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from 'recharts';
import { TrendingUp, CircleDollarSign, ListTodo, Receipt } from 'lucide-react';
import { useMemo } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatCurrencyMillions } from '@/lib/utils';

const chartData = [
  { month: 'January', invoiced: 186000000, paid: 80000000 },
  { month: 'February', invoiced: 305000000, paid: 200000000 },
  { month: 'March', invoiced: 237000000, paid: 120000000 },
  { month: 'April', invoiced: 73000000, paid: 190000000 },
  { month: 'May', invoiced: 209000000, paid: 130000000 },
  { month: 'June', invoiced: 214000000, paid: 140000000 },
];

const chartConfig: ChartConfig = {
  invoiced: {
    label: 'Invoiced',
    color: 'hsl(var(--chart-1))',
  },
  paid: {
    label: 'Paid',
    color: 'hsl(var(--chart-2))',
  },
};

const upcomingTasks = [
  { task: 'Prepare Q3 Financial Report', dueDate: '2024-07-15', status: 'In Progress' },
  { task: 'Client Meeting for Project Alpha', dueDate: '2024-07-10', status: 'Pending' },
  { task: 'Submit Invoice #INV-007', dueDate: '2024-07-12', status: 'Pending' },
  { task: 'Finalize Milestone 2 Deliverables', dueDate: '2024-07-20', status: 'Todo' },
];

export default function DashboardPage() {
  const { projects, getProjectStats } = useProjects();
  const { user, isHqUser, branches } = useAuth();

  const branchName = useMemo(() => {
    if (!user) return '';
    const branch = branches.find(b => b.id === user.branchId);
    return branch ? branch.name : 'your branch';
  }, [user, branches]);
  
  const visibleProjects = useMemo(() => {
    if (isHqUser) return projects;
    if (!user) return [];
    return projects.filter(p => p.branchId === user.branchId);
  }, [projects, user, isHqUser]);

  const { totalProjectValue, totalPaid, totalExpenditure, costBreakdownData } = useMemo(() => {
    const { totalProjectValue, totalPaid, totalCost } = getProjectStats(visibleProjects);

    const allExpenditures = visibleProjects.flatMap(p => p.expenditures.filter(e => e.status === 'Approved'));
    
    const costByCategory = allExpenditures.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
    }, {} as { [category: string]: number });

    const chartColors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
    ];
    let colorIndex = 0;
    const costBreakdownData = Object.entries(costByCategory).map(([name, value]) => {
        const color = chartColors[colorIndex % chartColors.length];
        colorIndex++;
        return { name, value, color };
    });

    return { totalProjectValue, totalPaid, totalExpenditure: totalCost, costBreakdownData };
  }, [visibleProjects, getProjectStats]);

  const widgetData = [
    {
      title: 'Total Project Value',
      value: formatCurrencyMillions(totalProjectValue),
      description: `Across ${visibleProjects.length} projects`,
      icon: CircleDollarSign,
      iconColor: 'text-blue-500',
      shapeColor: 'text-blue-500/10',
    },
    {
      title: 'Invoice Progress',
      value: formatCurrencyMillions(totalPaid),
      description: 'Total invoices paid to date',
      icon: TrendingUp,
      iconColor: 'text-green-500',
      shapeColor: 'text-green-500/10',
    },
    {
      title: 'Upcoming Tasks',
      value: `${upcomingTasks.length} Tasks`,
      description: 'Due within the next 30 days',
      icon: ListTodo,
      iconColor: 'text-amber-500',
      shapeColor: 'text-amber-500/10',
    },
    {
      title: 'Project Expenditure',
      value: formatCurrencyMillions(totalExpenditure),
      description: 'Total expenditure across all projects',
      icon: Receipt,
      iconColor: 'text-rose-500',
      shapeColor: 'text-rose-500/10',
    },
  ];


  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardHeader>
          <CardTitle>Welcome, {user?.name}</CardTitle>
          <CardDescription className="text-primary-foreground/90">
            Here's an overview of your projects from {branchName}.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {widgetData.map((widget, index) => (
          <Card key={index} className="relative overflow-hidden">
            <svg
                className={`absolute -top-1 -right-1 h-24 w-24 ${widget.shapeColor}`}
                fill="currentColor"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                d="M62.3,-53.5C78.2,-41.5,86.8,-20.8,86.4,-0.4C86,20,76.6,40,61.9,54.1C47.2,68.2,27.1,76.4,5.4,75.3C-16.3,74.2,-32.7,63.7,-47.5,51.3C-62.3,38.8,-75.6,24.5,-80.5,6.7C-85.4,-11.1,-82,-32.5,-69.3,-45.5C-56.6,-58.5,-34.7,-63.1,-15.6,-64.3C3.5,-65.5,26.4,-65.5,43.2,-61.7C59.9,-57.9,59.9,-57.9,62.3,-53.5Z"
                transform="translate(100 100)"
                />
            </svg>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {widget.title}
                </CardTitle>
                <widget.icon className={`h-8 w-8 ${widget.iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-xl font-bold font-headline sm:text-lg md:text-xl lg:text-2xl">{widget.value}</div>
                <p className="text-xs text-muted-foreground">
                    {widget.description}
                </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Monthly Invoicing</CardTitle>
            <CardDescription>
              A summary of invoices created and paid each month.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="invoiced" fill="var(--color-invoiced)" radius={4} />
                <Bar dataKey="paid" fill="var(--color-paid)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Cost Realization Breakdown</CardTitle>
            <CardDescription>Breakdown of all project costs by category.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[300px] w-full">
                 <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={costBreakdownData} dataKey="value" nameKey="name" innerRadius={80} outerRadius={120} startAngle={90} endAngle={450}>
                         {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Upcoming Tasks</CardTitle>
          <CardDescription>
            A list of important tasks and deadlines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingTasks.map((task) => (
                <TableRow key={task.task}>
                  <TableCell className="font-medium">{task.task}</TableCell>
                  <TableCell>
                    <Badge variant={task.status === 'In Progress' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{task.dueDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
