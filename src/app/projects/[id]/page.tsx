

'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  BarChartHorizontal,
  Printer,
  TrendingUp,
  TrendingDown,
  Percent,
  Edit,
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
import { ProjectCostTab } from '@/components/project-cost-tab';
import { formatCurrency, formatCurrencyMillions } from '@/lib/utils';
import { ProjectBudgetExpenditureChart } from '@/components/project-budget-expenditure-chart';
import { ProjectServiceOrderChart } from '@/components/project-service-order-chart';
import { ApprovalWorkflowManager } from '@/components/project-approval-workflow';
import { useAuth } from '@/context/AuthContext';
import type { ApprovalStage, Project } from '@/lib/projects';
import { ProjectCostPieChart } from '@/components/project-cost-pie-chart';
import { ProjectIncomePieChart } from '@/components/project-income-pie-chart';
import { ProjectServiceOrderTab } from '@/components/project-service-order-tab';
import { ProjectProfitChart } from '@/components/project-profit-chart';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { DashboardWidget } from '@/components/dashboard-widget';
import { format } from 'date-fns';


// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}


export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { getProjectById, setProjects, getProjectStats } = useProjects();
  const { users, userHasPermission } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const chartRefs = {
    incomePie: useRef<HTMLDivElement>(null),
    costPie: useRef<HTMLDivElement>(null),
    profit: useRef<HTMLDivElement>(null),
    so: useRef<HTMLDivElement>(null),
    recap: useRef<HTMLDivElement>(null),
    budget: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const fetchedProject = getProjectById(projectId);
    if (fetchedProject) {
        setProject(fetchedProject);
    }
  }, [projectId, getProjectById]);

  useEffect(() => {
    if (project) {
      setProjects(currentProjects => 
        currentProjects.map(p => p.id === project.id ? project : p)
      );
    }
  }, [project, setProjects]);
  
  const handleProjectUpdate = useCallback((updateFn: (project: Project) => Project) => {
    setProject(currentProject => {
        if (currentProject) {
            return updateFn(currentProject);
        }
        return null;
    });
  }, []);
  
  const {
    totalCost,
    totalInvoiced,
    totalPaid,
    totalIncome,
    totalServiceOrderValue,
    progress,
    totalBudget,
    profit,
  } = useMemo(() => {
    if (!project) {
      return {
        totalCost: 0,
        totalInvoiced: 0,
        totalPaid: 0,
        totalIncome: 0,
        totalServiceOrderValue: 0,
        progress: 0,
        totalBudget: 0,
        profit: 0,
      };
    }

    const stats = getProjectStats([project]);
    const calculatedProgress = project.value > 0 ? ((stats.totalPaid + stats.totalInvoiced) / project.value) * 100 : 0;
    
    return {
      totalCost: stats.totalCost,
      totalInvoiced: stats.totalInvoiced,
      totalPaid: stats.totalPaid,
      totalIncome: stats.totalIncome,
      totalServiceOrderValue: (project.serviceOrders || []).reduce((acc, so) => acc + so.value, 0),
      progress: Math.round(calculatedProgress),
      totalBudget: Object.values(project.budgets || {}).reduce((sum, val) => sum + val, 0),
      profit: stats.totalIncome - stats.totalCost,
    };
  }, [project, getProjectStats]);

  const summaryWidgets = useMemo(() => {
    const budgetUtilization = totalBudget > 0 ? (totalCost / totalBudget) * 100 : 0;
    const totalSubmittedInvoices = totalInvoiced + totalPaid;
    return [
      {
        title: 'Project Profit/Loss',
        value: formatCurrency(profit),
        description: profit >= 0 ? 'Currently profitable' : 'Currently at a loss',
        icon: profit >= 0 ? TrendingUp : TrendingDown,
        iconColor: profit >= 0 ? 'text-green-500' : 'text-rose-500',
        shapeColor: profit >= 0 ? 'text-green-500/10' : 'text-rose-500/10',
      },
      {
        title: 'Budget Utilization',
        value: `${budgetUtilization.toFixed(1)}%`,
        description: `Spent ${formatCurrencyMillions(totalCost)} of ${formatCurrencyMillions(totalBudget)}`,
        icon: Percent,
        iconColor: 'text-blue-500',
        shapeColor: 'text-blue-500/10',
      },
      {
        title: 'Invoice Payment Rate',
        value: `${totalSubmittedInvoices > 0 ? ((totalPaid / totalSubmittedInvoices) * 100).toFixed(1) : 0}%`,
        description: `${formatCurrencyMillions(totalPaid)} paid`,
        icon: CircleDollarSign,
        iconColor: 'text-amber-500',
        shapeColor: 'text-amber-500/10',
      }
    ];
  }, [profit, totalCost, totalBudget, totalInvoiced, totalPaid]);

  const handlePrint = useCallback(async () => {
    if (!project) return;
    const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
    const pageMargin = 15;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let finalY = 0;

    const addPageHeader = (title: string) => {
        doc.setFontSize(16);
        doc.text(title, pageWidth / 2, pageMargin, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Project: ${project.name}`, pageMargin, 25);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - pageMargin, 25, { align: 'right' });
        doc.setLineWidth(0.5);
        doc.line(pageMargin, 30, pageWidth - pageMargin, 30);
        finalY = 40;
    };
    
    addPageHeader('Project Summary Report');

    doc.autoTable({
        startY: finalY,
        head: [['Project Details', '']],
        body: [
            ['Client', project.client],
            ['Contract Executor', project.contractExecutor],
            ['Contract No.', project.contractNumber],
            ['RAB No.', project.rabNumber],
            ['Period', `${project.period} (${project.duration})`],
            ['Contract Value', formatCurrency(project.value)],
            ['Total Service Order', formatCurrency(totalServiceOrderValue)],
            ['Total Paid', formatCurrency(totalPaid)],
            ['Progress (by Paid)', `${progress}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }
    });
    finalY = (doc as any).lastAutoTable.finalY;

    // --- Charts ---
    doc.addPage();
    addPageHeader('Financial Charts');
    
    const chartEntries = Object.entries(chartRefs).filter(([, ref]) => ref.current);
    let maxRowHeight = 0;

    for (let i = 0; i < chartEntries.length; i += 2) {
      const chartPair = chartEntries.slice(i, i + 2);
      const canvases = await Promise.all(
        chartPair.map(async ([key, ref]) => {
          if (ref.current) {
            try {
              return await html2canvas(ref.current, { scale: 2 });
            } catch (error) {
              console.error(`Failed to capture chart ${key}:`, error);
              return null;
            }
          }
          return null;
        })
      );

      const validCanvases = canvases.filter(c => c !== null) as HTMLCanvasElement[];
      if (validCanvases.length === 0) continue;

      const imgWidth = (pageWidth - pageMargin * 2 - 10) / 2; // 2 charts with 10mm spacing
      const imgHeights = validCanvases.map(canvas => (canvas.height * imgWidth) / canvas.width);
      maxRowHeight = Math.max(...imgHeights);
      
      if (finalY + maxRowHeight > pageHeight - 20) {
        doc.addPage();
        addPageHeader('Financial Charts (Continued)');
      }

      validCanvases.forEach((canvas, index) => {
        const imgData = canvas.toDataURL('image/png');
        const xPos = pageMargin + (index * (imgWidth + 10));
        doc.addImage(imgData, 'PNG', xPos, finalY, imgWidth, imgHeights[index]);
      });

      finalY += maxRowHeight + 10;
    }
    
    // --- Data Tables ---
    if((project.serviceOrders || []).length > 0) {
        doc.addPage();
        addPageHeader('Service Order Details');
        doc.autoTable({
            startY: finalY,
            head: [['SO Number', 'Description', 'Date', 'Value']],
            body: project.serviceOrders.map(so => [so.soNumber, so.description, so.date, formatCurrency(so.value)]),
        });
        finalY = (doc as any).lastAutoTable.finalY;
    }

    if((project.invoices || []).length > 0) {
        if (finalY + 40 > pageHeight - 20) { // Check space for next table
          doc.addPage();
          addPageHeader('Invoice Details');
        } else {
           finalY += 10;
        }
        doc.autoTable({
            startY: finalY,
            head: [['SO Number', 'Description', 'Period', 'Status', 'Value']],
            body: project.invoices.map(inv => [inv.soNumber, inv.description, inv.period, inv.status, formatCurrency(inv.value)]),
        });
        finalY = (doc as any).lastAutoTable.finalY;
    }
    
    if((project.costs || []).length > 0) {
        if (finalY + 40 > pageHeight - 20) { // Check space for next table
          doc.addPage();
          addPageHeader('Cost Details');
        } else {
           finalY += 10;
        }
        doc.autoTable({
            startY: finalY,
            head: [['Category', 'Description', 'Period', 'Amount']],
            body: project.costs.map(cost => [cost.category, cost.description, cost.period, formatCurrency(cost.amount)]),
        });
    }

    doc.save(`ProjectReport-${project.contractNumber}.pdf`);

  }, [project, chartRefs, progress, totalPaid, totalServiceOrderValue]);

  const monthlyRecapData = useMemo(() => {
    if (!project) return [];
  
    const dataMap: { 
        [key: string]: { 
            month: string,
            paid: number,
            invoiced: number,
            pad: number,
            documentPreparation: number,
            cost: Record<string, number> 
        } 
    } = {};
  
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
    
    const invoicedOrPaidValuesBySO: Record<string, number> = {};
    (project.invoices || []).forEach(invoice => {
        if (invoice.status === 'Paid' || invoice.status === 'Invoiced') {
            invoicedOrPaidValuesBySO[invoice.soNumber] = (invoicedOrPaidValuesBySO[invoice.soNumber] || 0) + invoice.value;
        }
    });
  
    (project.invoices || []).forEach(invoice => {
      const periodInfo = processPeriod(invoice.period);
      if (!periodInfo) return;
      const { sortKey, displayMonth } = periodInfo;
  
      if (!dataMap[sortKey]) {
        dataMap[sortKey] = { month: displayMonth, paid: 0, invoiced: 0, pad: 0, documentPreparation: 0, cost: {} };
      }
  
      if (invoice.status === 'Paid') {
        dataMap[sortKey].paid += invoice.value;
      } else if (invoice.status === 'Invoiced') {
        dataMap[sortKey].invoiced += invoice.value;
      } else if (invoice.status === 'Document Preparation') {
        dataMap[sortKey].documentPreparation += invoice.value;
      } else if (invoice.status === 'PAD') {
        const invoicedAmountForSO = invoicedOrPaidValuesBySO[invoice.soNumber] || 0;
        const remainingPad = Math.max(0, invoice.value - invoicedAmountForSO);
        dataMap[sortKey].pad += remainingPad;
      }
    });
  
    (project.costs || []).forEach(exp => {
      if (exp.status !== 'Approved') return;
      
      const periodInfo = processPeriod(exp.period);
      if (!periodInfo) return;
      const { sortKey, displayMonth } = periodInfo;
  
      if (!dataMap[sortKey]) {
         dataMap[sortKey] = { month: displayMonth, paid: 0, invoiced: 0, pad: 0, documentPreparation: 0, cost: {} };
      }
      dataMap[sortKey].cost[exp.category] = (dataMap[sortKey].cost[exp.category] || 0) + exp.amount;
    });
  
    return Object.keys(dataMap)
      .sort()
      .map(key => dataMap[key]);
  
  }, [project]);

  const handleWorkflowChange = useCallback((type: 'trip' | 'report', newWorkflow: ApprovalStage[]) => {
    if (project) {
        const fieldToUpdate = type === 'trip' ? 'tripApprovalWorkflow' : 'reportApprovalWorkflow';
        handleProjectUpdate(currentProject => ({
            ...currentProject,
            [fieldToUpdate]: newWorkflow
        }));
    }
  }, [project, handleProjectUpdate]);


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

  const iconColors = ['#0D5EA6', '#0ABAB5', '#00C897', '#FFA955', '#FFD63A', '#FFBE98'];
  let colorIndex = 0;

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <svg
            className="absolute -right-16 -top-24 text-warning"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
                transform="translate(100 100)"
            />
        </svg>
        <svg
            className="absolute -left-20 -bottom-24 text-primary-foreground/10"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
                transform="translate(100 100)"
            />
        </svg>
        <CardHeader className="flex flex-row items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <Button asChild variant="secondary" size="icon">
              <Link href="/projects">
                <ArrowLeft />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div className="space-y-1.5">
                <CardTitle className="font-headline">{project.name}</CardTitle>
                <CardDescription className="text-primary-foreground/90">{project.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Export Report
            </Button>
             {userHasPermission('manage-projects') && (
              <Button asChild variant="secondary">
                <Link href={`/projects/${project.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Project
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex++ % iconColors.length]}1A` }}>
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
                </div>
                <div className="space-y-6">
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
                             <p className="font-medium">
                                {project.contractStartDate && project.contractEndDate ? 
                                    `${format(new Date(project.contractStartDate), 'd MMM yyyy')} - ${format(new Date(project.contractEndDate), 'd MMM yyyy')}` 
                                    : project.period
                                }
                            </p>
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
                            <p className="text-sm text-muted-foreground">Total Paid</p>
                            <p className="font-medium">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="mt-auto">
              <div className="mb-2 flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">Progress (by Invoiced + Paid Amount)</p>
                <p className="text-lg font-semibold">{progress}%</p>
              </div>
              <Progress value={progress} className="h-6" />
            </div>
          </CardContent>
        </Card>
      
      <Tabs defaultValue="summary-charts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary-charts">
            <BarChartHorizontal className="mr-2 h-4 w-4" />
            Summary Charts
          </TabsTrigger>
          <TabsTrigger value="service-orders">
            <ClipboardList className="mr-2 h-4 w-4" />
            Service Order
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="mr-2 h-4 w-4" />
            Invoicing Progress
          </TabsTrigger>
          <TabsTrigger value="cost">
            <Wallet className="mr-2 h-4 w-4" />
            Cost Management
          </TabsTrigger>
          <TabsTrigger value="approval-settings">
            <UserCog className="mr-2 h-4 w-4" />
            Approval Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary-charts" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {summaryWidgets.map((widget, index) => (
                <DashboardWidget key={index} {...widget} />
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Monthly Performance</h3>
              <Separator />
              <div className="grid grid-cols-1 gap-6 mt-4">
                  <div ref={chartRefs.recap}>
                    <ProjectMonthlyRecapChart data={monthlyRecapData} />
                  </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Overall Financial Health</h3>
              <Separator />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <div ref={chartRefs.profit} className="lg:col-span-2">
                      <ProjectProfitChart project={project} />
                  </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Income Deep Dive</h3>
              <Separator />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <div ref={chartRefs.incomePie}>
                      <ProjectIncomePieChart project={project} />
                  </div>
                  <div ref={chartRefs.so}>
                      <ProjectServiceOrderChart project={project} />
                  </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Cost & Budget Analysis</h3>
              <Separator />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <div ref={chartRefs.costPie}>
                      <ProjectCostPieChart project={project} />
                  </div>
                  <div ref={chartRefs.budget}>
                      <ProjectBudgetExpenditureChart project={project} />
                  </div>
              </div>
            </div>
        </TabsContent>
        <TabsContent value="service-orders">
          <ProjectServiceOrderTab project={project} setProjects={handleProjectUpdate} />
        </TabsContent>
        <TabsContent value="invoices">
          <ProjectInvoicingTab project={project} setProjects={handleProjectUpdate} />
        </TabsContent>
        <TabsContent value="cost">
           <ProjectCostTab project={project} setProjects={handleProjectUpdate} />
        </TabsContent>
         <TabsContent value="approval-settings" className="space-y-6">
           <ApprovalWorkflowManager
            title="Trip Approval Workflow"
            description="Define the sequence of approvers for business trip requests in this project."
            workflow={project.tripApprovalWorkflow || []}
            onWorkflowChange={(newWorkflow) => handleWorkflowChange('trip', newWorkflow)}
            users={users}
           />
            <ApprovalWorkflowManager
            title="Report Approval Workflow"
            description="Define the sequence of reviewers and approvers for NDT reports in this project."
            workflow={project.reportApprovalWorkflow || []}
            onWorkflowChange={(newWorkflow) => handleWorkflowChange('report', newWorkflow)}
            users={users}
           />
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
