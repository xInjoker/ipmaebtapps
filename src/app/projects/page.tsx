
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
import { ProjectTargetRealizationChart } from '@/components/project-target-realization-chart';
import { CumulativeProfitChart } from '@/components/cumulative-profit-chart';
import { CumulativeCostPieChart } from '@/components/cumulative-cost-pie-chart';
import { CumulativeIncomePieChart } from '@/components/cumulative-income-pie-chart';

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
                <CumulativeProfitChart projects={visibleProjects} />
                <ProjectBranchChart projects={visibleProjects} branches={branches} />
                <ProjectTargetRealizationChart projects={visibleProjects} />
            </div>
        </TabsContent>
        <TabsContent value="list">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleProjects.length > 0 ? (
                visibleProjects.map((project) => {
                    const { totalInvoiced } = getProjectStats([project]);
                    const progress = project.value > 0 ? Math.round((totalInvoiced / project.value) * 100) : 0;
                    return (
                    <Card key={project.id}>
                        <CardHeader>
                        <CardTitle className="font-headline">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                        <div className="space-y-4">
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
                            <div>
                            <p className="text-sm text-muted-foreground">Contract Value</p>
                            <p className="text-2xl font-bold text-primary">
                                {formatCurrency(project.value)}
                            </p>
                            </div>
                            <div>
                            <div className="flex justify-between items-baseline mb-1">
                                <p className="text-sm text-muted-foreground">Progress</p>
                                <p className="text-sm font-semibold">{progress}%</p>
                            </div>
                            <Progress value={progress} className="h-3" />
                            </div>
                        </div>
                        </CardContent>
                        <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
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
