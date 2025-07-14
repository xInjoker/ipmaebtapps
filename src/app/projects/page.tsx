
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Calendar as CalendarIcon, CircleDollarSign, Wallet, TrendingUp, Landmark, Search, X, BarChartBig, List } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency, formatCurrencyMillions } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Textarea } from '@/components/ui/textarea';
import { type Project, portfolios, subPortfolios, servicesBySubPortfolio, type Service } from '@/lib/data';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectBranchChart } from '@/components/project-branch-chart';
import { ProjectStatusChart } from '@/components/project-status-chart';

export default function ProjectsPage() {
  const { projects, setProjects, getProjectStats } = useProjects();
  const { user, isHqUser, branches, userHasPermission } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const initialFilterSet = useRef(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');

  const [newProject, setNewProject] = useState({
    contractNumber: '',
    rabNumber: '',
    name: '',
    client: '',
    description: '',
    value: 0,
    contractExecutor: '',
    portfolio: '',
    subPortfolio: '',
    serviceCode: '',
    serviceName: '',
  });
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const availableServices = useMemo(() => {
    if (!newProject.subPortfolio) return [];
    return servicesBySubPortfolio[newProject.subPortfolio as keyof typeof servicesBySubPortfolio] || [];
  }, [newProject.subPortfolio]);

  useEffect(() => {
    if (user && !isHqUser && !initialFilterSet.current) {
        setBranchFilter(user.branchId);
        initialFilterSet.current = true;
    }
  }, [user, isHqUser]);

  useEffect(() => {
    if (isDialogOpen) {
      setNewProject({
        contractNumber: '',
        rabNumber: '',
        name: '',
        client: '',
        description: '',
        value: 0,
        contractExecutor: isHqUser ? '' : user?.branchId || '',
        portfolio: '',
        subPortfolio: '',
        serviceCode: '',
        serviceName: '',
      });
      setDate(undefined);
    }
  }, [isDialogOpen, isHqUser, user?.branchId]);

  const visibleProjects = useMemo(() => {
    let projectsToFilter = projects;

    if (user?.roleId === 'project-admin') {
        projectsToFilter = projects.filter(p => user.assignedProjectIds?.includes(p.id));
    } else if (!isHqUser) {
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

  const { period, duration } = useMemo(() => {
    if (date?.from && date?.to) {
      const fromDate = date.from;
      const toDate = date.to;
      const periodString =
        format(fromDate, 'yyyy') === format(toDate, 'yyyy')
          ? format(fromDate, 'yyyy')
          : `${format(fromDate, 'yyyy')}-${format(toDate, 'yyyy')}`;

      let months = (toDate.getFullYear() - fromDate.getFullYear()) * 12;
      months -= fromDate.getMonth();
      months += toDate.getMonth();
      const durationValue = months <= 0 ? 1 : months + 1;
      const durationString = `${durationValue} ${
        durationValue > 1 ? 'Months' : 'Month'
      }`;

      return { period: periodString, duration: durationString };
    }
    return { period: '', duration: '' };
  }, [date]);


  const handleAddProject = () => {
    const assignedBranchId = isHqUser ? newProject.contractExecutor : user?.branchId;

    if (
      !newProject.contractNumber ||
      !newProject.rabNumber ||
      !newProject.name ||
      !newProject.client ||
      !newProject.description ||
      !assignedBranchId ||
      newProject.value <= 0 ||
      !date?.from ||
      !date.to
    ) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description:
          'Please fill out all fields, including executor, a positive value and a complete date range.',
      });
      return;
    }

    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not determine user. Please try logging in again.',
      });
      return;
    }

    const executorName = branches.find(b => b.id === assignedBranchId)?.name;
    if (!executorName) {
        toast({
            variant: 'destructive',
            title: 'Invalid Branch',
            description: 'The selected contract executor branch is not valid.',
        });
        return;
    }


    const newId =
      projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;

    const { contractExecutor, ...restOfNewProject } = newProject;

    const projectToAdd: Project = {
      ...restOfNewProject,
      id: newId,
      branchId: assignedBranchId,
      contractExecutor: executorName,
      period,
      duration,
      serviceOrders: [],
      invoices: [],
      budgets: {},
      expenditures: [],
      tripApprovalWorkflow: [],
      reportApprovalWorkflow: [],
    };

    setProjects([...projects, projectToAdd]);
    setIsDialogOpen(false);
    toast({
      title: 'Project Added',
      description: `Project "${projectToAdd.name}" has been successfully created.`,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    if (isHqUser) {
        setBranchFilter('all');
    }
  };


  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <svg
            className="absolute -right-16 -top-24 text-primary-foreground/10"
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
            className="absolute -right-24 -top-16 text-primary-foreground/20"
            fill="currentColor"
            width="250"
            height="250"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
            transform="translate(100 100)"
            />
        </svg>
        <CardHeader className="flex flex-row items-start justify-between z-10 relative">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Projects</CardTitle>
            <CardDescription className="text-primary-foreground/90">A list of all your projects.</CardDescription>
          </div>
          {userHasPermission('manage-projects') && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contractNumber" className="text-right">
                      Contract No.
                    </Label>
                    <Input
                      id="contractNumber"
                      value={newProject.contractNumber}
                      onChange={(e) => setNewProject({ ...newProject, contractNumber: e.target.value })}
                      className="col-span-3"
                      placeholder="Contract number"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rabNumber" className="text-right">
                      RAB No.
                    </Label>
                    <Input
                      id="rabNumber"
                      value={newProject.rabNumber}
                      onChange={(e) => setNewProject({ ...newProject, rabNumber: e.target.value })}
                      className="col-span-3"
                      placeholder="RAB number"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="portfolio" className="text-right">
                      Portfolio
                    </Label>
                    <Select
                      value={newProject.portfolio}
                      onValueChange={(value) => setNewProject({ ...newProject, portfolio: value })}
                    >
                      <SelectTrigger className="col-span-3" id="portfolio">
                        <SelectValue placeholder="Select a portfolio" />
                      </SelectTrigger>
                      <SelectContent>
                        {portfolios.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="subPortfolio" className="text-right">
                      Sub-Portfolio
                    </Label>
                    <Select
                      value={newProject.subPortfolio}
                      onValueChange={(value) => {
                        setNewProject({ ...newProject, subPortfolio: value, serviceCode: '', serviceName: '' });
                      }}
                    >
                      <SelectTrigger className="col-span-3" id="subPortfolio">
                        <SelectValue placeholder="Select a sub-portfolio" />
                      </SelectTrigger>
                      <SelectContent>
                        {subPortfolios.map((sp) => (
                          <SelectItem key={sp} value={sp}>
                            {sp}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="serviceCode" className="text-right">
                      Service Code
                    </Label>
                    <Select
                      value={newProject.serviceCode}
                      onValueChange={(value) => {
                        const service = availableServices.find(s => s.code === value);
                        setNewProject({ ...newProject, serviceCode: value, serviceName: service?.name || '' });
                      }}
                      disabled={!newProject.subPortfolio}
                    >
                      <SelectTrigger className="col-span-3" id="serviceCode">
                        <SelectValue placeholder="Select a service code" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServices.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="serviceName" className="text-right">
                      Service Name
                    </Label>
                    <Select
                      value={newProject.serviceName}
                      onValueChange={(value) => {
                        const service = availableServices.find(s => s.name === value);
                        setNewProject({ ...newProject, serviceName: value, serviceCode: service?.code || '' });
                      }}
                      disabled={!newProject.subPortfolio}
                    >
                      <SelectTrigger className="col-span-3" id="serviceName">
                        <SelectValue placeholder="Select a service name" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServices.map((s) => (
                          <SelectItem key={s.name} value={s.name}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="col-span-3"
                      placeholder="Contract name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="client" className="text-right">
                      Client
                    </Label>
                    <Input
                      id="client"
                      value={newProject.client}
                      onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                      className="col-span-3"
                      placeholder="Client name"
                    />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="contractExecutor" className="text-right">
                      Contract Executor
                    </Label>
                    {isHqUser ? (
                      <Select
                        value={newProject.contractExecutor}
                        onValueChange={(value) =>
                          setNewProject({ ...newProject, contractExecutor: value })
                        }
                      >
                        <SelectTrigger className="col-span-3" id="contractExecutor">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="contractExecutor"
                        value={branches.find((b) => b.id === user?.branchId)?.name || ''}
                        className="col-span-3"
                        disabled
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="col-span-3"
                      placeholder="A short description of the project."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">
                      Value (IDR)
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      value={newProject.value || ''}
                      onChange={(e) => setNewProject({ ...newProject, value: parseInt(e.target.value) || 0 })}
                      className="col-span-3"
                      placeholder="Contract value"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="period" className="text-right">
                      Period
                    </Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="period"
                                variant={"outline"}
                                className={cn(
                                    "col-span-3 justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      value={duration}
                      className="col-span-3"
                      placeholder="Calculated automatically"
                      readOnly
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddProject}>
                    Add Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
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
                  <div className="text-xl font-bold font-headline sm:text-lg md:text-xl lg:text-2xl mt-1">{widget.value}</div>
                  <p className={`text-sm mt-2 font-bold ${widget.iconColor}`}>
                      {widget.description}
                  </p>
              </CardContent>
          </Card>
          ))}
      </div>

      <Tabs defaultValue="summary" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary"><BarChartBig className="mr-2 h-4 w-4" />Summary Charts</TabsTrigger>
          <TabsTrigger value="list"><List className="mr-2 h-4 w-4" />Project List</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Project Value by Branch</CardTitle>
                        <CardDescription>A summary of total project value for each branch.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProjectBranchChart projects={visibleProjects} branches={branches} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Invoicing Status by Value</CardTitle>
                        <CardDescription>A summary of total invoice value for each status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProjectStatusChart projects={visibleProjects} />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="list">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleProjects.length > 0 ? (
                visibleProjects.map((project) => {
                    const stats = getProjectStats([project]);
                    const progress = project.value > 0 ? Math.round((stats.totalInvoiced / project.value) * 100) : 0;
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
                            <Progress value={progress} className="h-2" />
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
