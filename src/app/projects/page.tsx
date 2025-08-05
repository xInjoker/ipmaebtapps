

'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, CircleDollarSign, Wallet, TrendingUp, Landmark, Search, X, BarChartBig, List } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency, formatCurrencyMillions } from '@/lib/utils';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectBranchChart } from '@/components/project-branch-chart';
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';
import { CumulativeProfitChart } from '@/components/cumulative-profit-chart';
import { CumulativeCostPieChart } from '@/components/cumulative-cost-pie-chart';
import { CumulativeIncomePieChart } from '@/components/cumulative-income-pie-chart';
import { ProjectMonthlyRecapChart } from '@/components/project-monthly-recap-chart';

export default function ProjectsPage() {
  const { projects, getProjectStats } = useProjects();
  const { user, isHqUser, branches, userHasPermission } = useAuth();
  const initialFilterSet = useRef(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  useEffect(() => {
    if (user && !isHqUser && !initialFilterSet.current) {
        setBranchFilter(user.branchId);
        initialFilterSet.current = true;
    }
  }, [user, isHqUser]);

  const visibleProjects = useMemo(() => {
    let projectsToFilter = projects;

    if (user?.roleId === 'project-admin') {
        projectsToFilter = projects.filter(p => user.assignedProjectIds?.includes(p.id));
    } else if (!isHqUser && user) {
        projectsToFilter = projects.filter(p => p.branchId === user?.branchId);
    }

    return projectsToFilter.filter(project => {
      const searchMatch = searchTerm.toLowerCase() === '' ||
                          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const branchMatch = branchFilter === 'all' || project.branchId === branchMatch;

      return searchMatch && branchMatch;
    });
  }, [projects, user, isHqUser, searchTerm, branchFilter]);

  const { totalProjectValue, totalCost, totalInvoiced, totalPaid } = getProjectStats(visibleProjects);

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
        title: 'Total Cost',
        value: formatCurrencyMillions(totalCost),
        description: 'Total costs realized across all projects',
        icon: Wallet,
        iconColor: 'text-rose-500',
        shapeColor: 'text-rose-500/10',
    },
    {
        title: 'Total Invoiced',
        value: formatCurrencyMillions(totalInvoiced),
        description: 'Total invoiced across all projects',
        icon: TrendingUp,
        iconColor: 'text-green-500',
        shapeColor: 'text-green-500/10',
    },
    {
        title: 'Total Paid',
        value: formatCurrencyMillions(totalPaid),
        description: 'Total paid across all projects',
        icon: Landmark,
        iconColor: 'text-amber-500',
        shapeColor: 'text-amber-500/10',
    },
  ];

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    if (isHqUser) {
        setBranchFilter('all');
    }
  }, [isHqUser]);

  const monthlyRecapData = useMemo(() => {
    if (!visibleProjects) return [];
  
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
    
    visibleProjects.forEach(project => {
        const projectInvoices = project.invoices || [];
        const projectCosts = project.costs || [];

        const invoicedOrPaidValuesBySO: Record<string, number> = {};
        projectInvoices.forEach(invoice => {
            if (invoice.status === 'Paid' || invoice.status === 'Invoiced') {
                invoicedOrPaidValuesBySO[invoice.soNumber] = (invoicedOrPaidValuesBySO[invoice.soNumber] || 0) + invoice.value;
            }
        });
    
        projectInvoices.forEach(invoice => {
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
    
        projectCosts.forEach(exp => {
        if (exp.status !== 'Approved') return;
        
        const periodInfo = processPeriod(exp.period);
        if (!periodInfo) return;
        const { sortKey, displayMonth } = periodInfo;
    
        if (!dataMap[sortKey]) {
            dataMap[sortKey] = { month: displayMonth, paid: 0, invoiced: 0, pad: 0, documentPreparation: 0, cost: {} };
        }
        dataMap[sortKey].cost[exp.category] = (dataMap[sortKey].cost[exp.category] || 0) + exp.amount;
        });
    });
  
    return Object.keys(dataMap)
      .sort()
      .map(key => dataMap[key]);
  
  }, [visibleProjects]);


  return (
    <div className="space-y-6">
      <HeaderCard
        title="Projects"
        description="A list of all your projects."
      >
        {userHasPermission('manage-projects') && (
          <Button asChild>
            <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Project
            </Link>
          </Button>
        )}
      </HeaderCard>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {widgetData.map((widget, index) => (
            <DashboardWidget key={index} {...widget} />
          ))}
      </div>

       <Card>
        <CardContent className="p-4">
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center z-10 relative">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, client, or contract..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={branchFilter} onValueChange={setBranchFilter} disabled={!isHqUser}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Branches</SelectItem>
                            {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" onClick={handleClearFilters} className="w-full sm:w-auto">
                        <X className="mr-2 h-4 w-4" /> Clear
                    </Button>
                </div>
           </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary"><BarChartBig className="mr-2 h-4 w-4" />Financial Summary</TabsTrigger>
          <TabsTrigger value="list"><List className="mr-2 h-4 w-4" />Project List</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CumulativeIncomePieChart projects={visibleProjects} />
                <CumulativeCostPieChart projects={visibleProjects} />
                <div className="lg:col-span-2">
                    <ProjectMonthlyRecapChart data={monthlyRecapData} />
                </div>
                <CumulativeProfitChart projects={visibleProjects} />
                <ProjectBranchChart projects={visibleProjects} branches={branches} />
            </div>
        </TabsContent>
        <TabsContent value="list">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleProjects.length > 0 ? (
                visibleProjects.map((project) => {
                    const { totalInvoiced, totalPaid } = getProjectStats([project]);
                    const progress = project.value > 0 ? Math.round(((totalPaid + totalInvoiced) / project.value) * 100) : 0;
                    return (
                    <Card key={project.id} className="flex flex-col">
                        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-t-lg flex flex-col justify-center h-28">
                            <svg
                                className="absolute top-0 left-0 w-full h-full text-primary"
                                fill="currentColor"
                                viewBox="0 0 100 20"
                                preserveAspectRatio="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M0 15 C 20 25, 40 -5, 60 15 S 80 -5, 100 15 V 0 H 0 Z" />
                            </svg>
                            <div className="relative z-10">
                                <CardTitle className="font-headline line-clamp-2">{project.name}</CardTitle>
                                <CardDescription className="text-primary-foreground/90 line-clamp-2">{project.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow pt-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <p className="text-muted-foreground">Client</p>
                                <p className="font-medium">{project.client}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <p className="text-muted-foreground">Contract No.</p>
                                <p className="font-medium">{project.contractNumber}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <p className="text-muted-foreground">RAB No.</p>
                                <p className="font-medium">{project.rabNumber}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                            <p className="text-muted-foreground">Contract Executor</p>
                            <p className="font-medium text-right">{project.contractExecutor}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <p className="text-muted-foreground">Period</p>
                                <p className="font-medium">{project.period}</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-medium">{project.duration}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4 border-t bg-muted/50 p-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Contract Value</p>
                                <p className="text-2xl font-bold text-primary">
                                    {formatCurrency(project.value)}
                                </p>
                            </div>
                            <div className="w-full">
                                <div className="flex justify-between items-baseline mb-1 w-full">
                                    <p className="text-sm text-muted-foreground">Progress</p>
                                    <p className="text-sm font-semibold">{progress}%</p>
                                </div>
                                <Progress value={progress} className="h-3 w-full" />
                            </div>
                            <Button variant="outline" className="w-full mt-2" asChild>
                                <Link href={`/projects/${project.id}`}>View Details</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    );
                })
                ) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                    <h3 className="text-lg font-semibold">No Projects Found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
                )}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
