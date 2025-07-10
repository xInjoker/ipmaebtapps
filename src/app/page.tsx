
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
import { formatCurrency } from '@/lib/utils';

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
  const { projects } = useProjects();
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
    const totalProjectValue = visibleProjects.reduce(
        (acc, project) => acc + project.value,
        0
    );
    
    const totalPaid = visibleProjects.reduce((acc, project) => {
        const projectPaid = project.invoices
            .filter((invoice) => invoice.status === 'Paid' || invoice.status === 'PAD')
            .reduce((invoiceAcc, invoice) => invoiceAcc + invoice.value, 0);
        return acc + projectPaid;
    }, 0);

    const allExpenditures = visibleProjects.flatMap(p => p.expenditures.filter(e => e.status === 'Approved'));
    
    const totalExpenditure = allExpenditures.reduce((acc, exp) => acc + exp.amount, 0);

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

    return { totalProjectValue, totalPaid, totalExpenditure, costBreakdownData };
  }, [visibleProjects]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}</CardTitle>
          <CardDescription>
            Here's an overview of your projects from {branchName}.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Project Value
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-xl md:text-2xl font-bold font-headline">{formatCurrency(totalProjectValue)}</div>
            <p className="text-xs text-muted-foreground">
              Across {visibleProjects.length} projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoice Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-xl md:text-2xl font-bold font-headline">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              Total invoices paid to date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-xl md:text-2xl font-bold font-headline">{upcomingTasks.length} Tasks</div>
            <p className="text-xs text-muted-foreground">
              Due within the next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Expenditure</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-xl md:text-2xl font-bold font-headline">{formatCurrency(totalExpenditure)}</div>
            <p className="text-xs text-muted-foreground">
              Total expenditure across all projects
            </p>
          </CardContent>
        </Card>
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
