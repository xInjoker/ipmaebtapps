
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
import { TrendingUp, CircleDollarSign, ListTodo, Receipt, Wrench, ClipboardEdit, Plane, FileText, Wifi, WifiOff, Clock } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useTenders } from '@/context/TenderContext';
import { formatCurrency, formatCurrencyMillions } from '@/lib/utils';
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


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
  const { widgetData: tenderWidgets } = useTenders();
  const [firestoreStatus, setFirestoreStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    const checkFirestoreConnection = async () => {
      try {
        await getDocs(collection(db, 'test-connection'));
        setFirestoreStatus('success');
      } catch (error) {
        console.error("Firestore connection error:", error);
        setFirestoreStatus('error');
      }
    };
    checkFirestoreConnection();
  }, []);

  const visibleProjects = useMemo(() => {
    if (!user) return [];
    if (user.roleId === 'project-admin') {
      return projects.filter(p => user.assignedProjectIds?.includes(p.id));
    }
    if (isHqUser) return projects;
    return projects.filter(p => p.branchId === user.branchId);
  }, [projects, user, isHqUser]);

  const projectStats = useMemo(() => getProjectStats(visibleProjects), [visibleProjects, getProjectStats]);

  const { welcomeDescription, projectWidgets, otherUserWidgets } = useMemo(() => {
    let desc = `Here's an overview of the company's performance.`;
    if (!isHqUser && user) {
        const branchName = branches.find(b => b.id === user.branchId)?.name || 'your branch';
        desc = `Here's an overview of activities for ${branchName}.`;
    } else if (user?.roleId === 'project-admin') {
        desc = `Here's an overview of your ${user.assignedProjectIds?.length || 0} assigned projects.`;
    }
    
    const pWidgets = [
      {
        title: 'Total Project Value',
        value: formatCurrencyMillions(projectStats.totalProjectValue),
        description: `Across ${visibleProjects.length} projects`,
        icon: CircleDollarSign,
        iconColor: 'text-blue-500',
        shapeColor: 'text-blue-500/10',
      },
      {
        title: 'Invoice Progress',
        value: formatCurrencyMillions(projectStats.totalPaid),
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
        value: formatCurrencyMillions(projectStats.totalCost),
        description: 'Total expenditure across all projects',
        icon: Receipt,
        iconColor: 'text-rose-500',
        shapeColor: 'text-rose-500/10',
      },
    ];

     const oWidgets = [
      { href: '/reports', title: 'Reporting', description: 'Create and manage NDT reports', icon: ClipboardEdit, iconColor: 'text-blue-500', shapeColor: 'text-blue-500/10' },
      { href: '/equipment', title: 'Equipment', description: 'View and track equipment status', icon: Wrench, iconColor: 'text-green-500', shapeColor: 'text-green-500/10' },
      { href: '/trips', title: 'Business Trips', description: 'Request and monitor trip approvals', icon: Plane, iconColor: 'text-amber-500', shapeColor: 'text-amber-500/10' },
      { href: '/tenders', title: 'Tenders', description: 'Monitor all ongoing and past tenders', icon: FileText, iconColor: 'text-rose-500', shapeColor: 'text-rose-500/10' },
    ];

    return { welcomeDescription: desc, projectWidgets: pWidgets, otherUserWidgets: oWidgets };
  }, [user, isHqUser, branches, projectStats, visibleProjects.length]);


  const costBreakdownData = useMemo(() => {
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
    return Object.entries(costByCategory).map(([name, value]) => {
        const color = chartColors[colorIndex % chartColors.length];
        colorIndex++;
        return { name, value, color };
    });
  }, [visibleProjects]);

  const renderWidgets = () => {
    const roleId = user?.roleId;

    if (roleId === 'super-admin' || roleId === 'project-manager' || roleId === 'project-admin') {
      return projectWidgets.map((widget, index) => <DashboardWidget key={index} {...widget} />);
    }

    if (roleId === 'tender-admin') {
      return tenderWidgets.map((widget, index) => <DashboardWidget key={index} {...widget} />);
    }

    // Default widgets for other roles (Inspectors, Staff, etc.)
    return otherUserWidgets.map((widget, index) => (
      <Link key={index} href={widget.href}>
        <DashboardWidget title={widget.title} value="" description={widget.description} icon={widget.icon} iconColor={widget.iconColor} shapeColor={widget.shapeColor} />
      </Link>
    ));
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firestore Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          {firestoreStatus === 'checking' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Checking connection...</span>
            </div>
          )}
          {firestoreStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="h-4 w-4" />
              <span>Connection to Firestore successful!</span>
            </div>
          )}
          {firestoreStatus === 'error' && (
            <div className="flex items-center gap-2 text-destructive">
              <WifiOff className="h-4 w-4" />
              <span>Failed to connect to Firestore. Please check your API keys in the .env file.</span>
            </div>
          )}
        </CardContent>
      </Card>
      <HeaderCard
        title={`Welcome, ${user?.name}`}
        description={welcomeDescription}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderWidgets()}
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
