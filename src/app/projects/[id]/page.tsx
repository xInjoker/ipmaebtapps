
'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CircleDollarSign,
  Clock,
  User,
  Building,
  FileSpreadsheet,
  FilePen,
  ClipboardList,
  Receipt,
  Wallet,
  UserCog,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useProjects } from '@/context/ProjectContext';
import { ProjectMonthlyRecapChart } from '@/components/project-monthly-recap-chart';
import { ProjectInvoicingTab } from '@/components/project-invoicing-tab';
import { ProjectExpenditureTab } from '@/components/project-expenditure-tab';
import { ProjectServiceOrderTab } from '@/components/project-service-order-tab';
import { formatCurrency } from '@/lib/utils';
import { ProjectBudgetExpenditureChart } from '@/components/project-budget-expenditure-chart';
import { ProjectServiceOrderChart } from '@/components/project-service-order-chart';
import { ApprovalWorkflowManager } from '@/components/project-approval-workflow';
import { useAuth } from '@/context/AuthContext';
import type { ApprovalStage } from '@/lib/projects';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProjectById, updateProject, setProjects } = useProjects();
  const { users } = useAuth();
  
  const project = getProjectById(projectId);

  const {
    totalCost,
    totalInvoiced,
    totalPad,
    totalServiceOrderValue,
    totalDocumentPreparation,
  } = useMemo(() => {
    if (!project) {
      return {
        totalCost: 0,
        totalInvoiced: 0,
        totalPad: 0,
        totalServiceOrderValue: 0,
        totalDocumentPreparation: 0,
      };
    }

    const cost = project.expenditures
      .filter((exp) => exp.status === 'Approved')
      .reduce((acc, exp) => acc + exp.amount, 0);

    const invoiced = project.invoices
      .filter((inv) => inv.status === 'Invoiced' || inv.status === 'Paid')
      .reduce((acc, inv) => acc + inv.value, 0);

    const pad = project.invoices
      .filter((inv) => inv.status === 'PAD')
      .reduce((acc, inv) => acc + inv.value, 0);
    
    const documentPreparation = project.invoices
      .filter((inv) => inv.status === 'Document Preparation')
      .reduce((acc, inv) => acc + inv.value, 0);

    const serviceOrderValue = project.serviceOrders.reduce((acc, so) => acc + so.value, 0);

    return {
      totalCost: cost,
      totalInvoiced: invoiced,
      totalPad: pad,
      totalServiceOrderValue: serviceOrderValue,
      totalDocumentPreparation: documentPreparation,
    };
  }, [project]);

  const monthlyRecapData = useMemo(() => {
    if (!project) return [];

    const dataMap: { [key: string]: { month: string, invoicedAndPaid: number, pad: number, expenditure: number } } = {};
    const monthOrder: { [key:string]: number } = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };

    const processPeriod = (period: string) => {
      const [month, year] = period.split(' ');
      if (!month || !year || !monthOrder[month]) return null;
      const sortKey = `${year}-${String(monthOrder[month]).padStart(2, '0')}`;
      const displayMonth = `${month.slice(0, 3)} '${year.slice(2)}`;
      return { sortKey, displayMonth };
    };

    project.invoices.forEach(invoice => {
      const periodInfo = processPeriod(invoice.period);
      if (!periodInfo) return;
      const { sortKey, displayMonth } = periodInfo;

      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { month: displayMonth, invoicedAndPaid: 0, pad: 0, expenditure: 0 };
      }

      if (invoice.status === 'Invoiced' || invoice.status === 'Paid') {
        dataMap[sortKey].invoicedAndPaid += invoice.value;
      } else if (invoice.status === 'PAD') {
        dataMap[sortKey].pad += invoice.value;
      }
    });

    project.expenditures.forEach(exp => {
      if (exp.status !== 'Approved') return;
      
      const periodInfo = processPeriod(exp.period);
      if (!periodInfo) return;
      const { sortKey, displayMonth } = periodInfo;

      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { month: displayMonth, invoicedAndPaid: 0, pad: 0, expenditure: 0 };
      }
      dataMap[sortKey].expenditure += exp.amount;
    });

    // Apply the Remaining PAD formula
    for (const key in dataMap) {
        const monthData = dataMap[key];
        const remainingPad = monthData.pad - monthData.invoicedAndPaid;
        monthData.pad = Math.max(0, remainingPad);
    }

    return Object.keys(dataMap)
      .sort()
      .map(key => dataMap[key]);

  }, [project]);

  const handleWorkflowChange = useCallback((type: 'trip' | 'report', newWorkflow: ApprovalStage[]) => {
    if (project) {
        if (type === 'trip') {
          updateProject(project.id, { tripApprovalWorkflow: newWorkflow });
        } else {
          updateProject(project.id, { reportApprovalWorkflow: newWorkflow });
        }
    }
  }, [project, updateProject]);


  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>
            The project you are looking for does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="mt-4">
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progress =
    project.value > 0
      ? Math.round((totalInvoiced / project.value) * 100)
      : 0;

  const iconColors = ['#0D5EA6', '#0ABAB5', '#00C897', '#FFA955', '#FFD63A', '#FFBE98'];
  let colorIndex = 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle>{project.name}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <Button asChild variant="outline" size="icon">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <User className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{project.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <Building className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Executor</p>
                    <p className="font-medium">{project.contractExecutor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <Briefcase className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract No.</p>
                    <p className="font-medium">{project.contractNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <FileSpreadsheet className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RAB No.</p>
                    <p className="font-medium">{project.rabNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <Calendar className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="font-medium">{project.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <Clock className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{project.duration}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <CircleDollarSign className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contract Value</p>
                    <p className="font-medium">{formatCurrency(project.value)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <FileSpreadsheet className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Service Order</p>
                    <p className="font-medium">{formatCurrency(totalServiceOrderValue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <CircleDollarSign className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Invoiced</p>
                    <p className="font-medium">{formatCurrency(totalInvoiced)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <CircleDollarSign className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total PAD</p>
                    <p className="font-medium">{formatCurrency(totalPad)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <FilePen className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Document Preparation</p>
                    <p className="font-medium">{formatCurrency(totalDocumentPreparation)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                    <CircleDollarSign className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="font-medium">{formatCurrency(totalCost)}</p>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="mt-auto">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Progress (by Invoiced Amount)</p>
                <p className="text-lg font-semibold">{progress}%</p>
              </div>
              <Progress value={progress} className="h-6" />
            </div>
          </CardContent>
        </Card>
        
        <ProjectMonthlyRecapChart data={monthlyRecapData} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle>Expenditure vs Budget</CardTitle>
                <CardDescription>
                    Comparison of budgeted amounts vs actual expenditures by category.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProjectBudgetExpenditureChart project={project} />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Service Order Progress</CardTitle>
                <CardDescription>
                    Comparison of SO value vs invoiced amount.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProjectServiceOrderChart project={project} />
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="service-orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="service-orders">
            <ClipboardList className="mr-2 h-4 w-4" />
            Service Order
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="mr-2 h-4 w-4" />
            Invoicing Progress
          </TabsTrigger>
          <TabsTrigger value="expenditure">
            <Wallet className="mr-2 h-4 w-4" />
            Expenditure Management
          </TabsTrigger>
          <TabsTrigger value="approval-settings">
            <UserCog className="mr-2 h-4 w-4" />
            Approval Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="service-orders">
          <ProjectServiceOrderTab project={project} setProjects={setProjects} />
        </TabsContent>
        <TabsContent value="invoices">
          <ProjectInvoicingTab project={project} setProjects={setProjects} />
        </TabsContent>
        <TabsContent value="expenditure">
           <ProjectExpenditureTab project={project} setProjects={setProjects} />
        </TabsContent>
         <TabsContent value="approval-settings" className="space-y-6">
           <ApprovalWorkflowManager
            title="Trip Approval Workflow"
            description="Define the sequence of approvers for business trip requests in this project."
            workflow={project.tripApprovalWorkflow}
            onWorkflowChange={(newWorkflow) => handleWorkflowChange('trip', newWorkflow)}
            users={users}
           />
            <ApprovalWorkflowManager
            title="Report Approval Workflow"
            description="Define the sequence of reviewers and approvers for NDT reports in this project."
            workflow={project.reportApprovalWorkflow}
            onWorkflowChange={(newWorkflow) => handleWorkflowChange('report', newWorkflow)}
            users={users}
           />
        </TabsContent>
      </Tabs>
    </div>
  );
}
