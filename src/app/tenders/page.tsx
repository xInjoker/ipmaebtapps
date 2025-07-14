
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  X,
  Search,
  BarChartBig,
  List,
} from 'lucide-react';
import { useTenders } from '@/context/TenderContext';
import { type TenderStatus, tenderStatuses, regionalOptions } from '@/lib/tenders';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { isSameDay, isWithinInterval, startOfDay, addDays } from 'date-fns';
import { getTenderStatusVariant } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TenderSummaryChart } from '@/components/tender-summary-chart';


export default function TendersPage() {
  useSearchParams();
  const { tenders, updateTender } = useTenders();
  const { user, isHqUser, branches } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const initialFilterSet = useRef(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<TenderStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState('all');
  
  useEffect(() => {
    if (user && !isHqUser && !initialFilterSet.current) {
        const userBranch = branches.find(b => b.id === user.branchId);
        if (userBranch) {
            setRegionFilter(userBranch.region);
            setBranchFilter(userBranch.id);
        }
        initialFilterSet.current = true;
    }
  }, [user, isHqUser, branches]);
  
  const availableBranches = useMemo(() => {
    if (regionFilter === 'all') {
      return branches;
    }
    return branches.filter(b => b.region === regionFilter);
  }, [regionFilter, branches]);

  useEffect(() => {
    if (branchFilter !== 'all' && !availableBranches.some(b => b.id === branchFilter)) {
        setBranchFilter('all');
    }
  }, [availableBranches, branchFilter]);


  const filteredTenders = useMemo(() => {
    return tenders.filter(tender => {
        const searchMatch = searchTerm.toLowerCase() === '' ||
                            tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tender.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tender.tenderNumber.toLowerCase().includes(searchTerm.toLowerCase());
        
        const regionMatch = regionFilter === 'all' || tender.regional === regionFilter;
        const branchMatch = branchFilter === 'all' || tender.branchId === branchFilter;
        const statusMatch = statusFilter === 'all' || tender.status === statusFilter;

        // Non-HQ users should only see tenders from their branch/region
        if (!isHqUser && user) {
            const userBranch = branches.find(b => b.id === user.branchId);
            if (tender.regional !== userBranch?.region) return false;
        }

        return searchMatch && regionMatch && branchMatch && statusMatch;
    });
  }, [tenders, searchTerm, branchFilter, statusFilter, regionFilter, user, isHqUser, branches]);

  const dashboardStats = useMemo(() => {
    const statusCounts = filteredTenders.reduce((acc, tender) => {
      acc[tender.status] = (acc[tender.status] || 0) + 1;
      return acc;
    }, {} as Record<TenderStatus, number>);

    return {
      totalTenders: filteredTenders.length,
      inProgress:
        (statusCounts['Aanwijzing'] || 0) +
        (statusCounts['Bidding'] || 0) +
        (statusCounts['Evaluation'] || 0),
      awarded: statusCounts['Awarded'] || 0,
      lostOrCancelled:
        (statusCounts['Lost'] || 0) + (statusCounts['Cancelled'] || 0),
    };
  }, [filteredTenders]);

  const widgetData = [
    {
      title: 'Total Tenders',
      value: `${dashboardStats.totalTenders}`,
      description: 'tenders being tracked',
      icon: Users,
      iconColor: 'text-blue-500',
      shapeColor: 'text-blue-500/10',
    },
    {
      title: 'In Progress',
      value: `${dashboardStats.inProgress}`,
      description: 'tenders currently active',
      icon: Clock,
      iconColor: 'text-amber-500',
      shapeColor: 'text-amber-500/10',
    },
    {
      title: 'Awarded',
      value: `${dashboardStats.awarded}`,
      description: 'tenders successfully won',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      shapeColor: 'text-green-500/10',
    },
    {
      title: 'Lost / Cancelled',
      value: `${dashboardStats.lostOrCancelled}`,
      description: 'tenders not won or cancelled',
      icon: XCircle,
      iconColor: 'text-rose-500',
      shapeColor: 'text-rose-500/10',
    },
  ];

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const submissionDates = useMemo(() => {
    return filteredTenders.map((tender) => new Date(tender.submissionDate));
  }, [filteredTenders]);

  const upcomingTenders = useMemo(() => {
    const today = startOfDay(new Date());
    const nextSevenDays = addDays(today, 7);
    return filteredTenders
      .filter((tender) => {
        const submissionDate = new Date(tender.submissionDate);
        return isWithinInterval(submissionDate, { start: today, end: nextSevenDays });
      })
      .sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime());
  }, [filteredTenders]);
  
  const tendersForSelectedDate = useMemo(() => {
      if (!selectedDate) return [];
      return filteredTenders.filter(tender => isSameDay(new Date(tender.submissionDate), selectedDate));
  }, [filteredTenders, selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  const handleStatusUpdate = (tenderId: string, status: TenderStatus) => {
    const tenderToUpdate = tenders.find((t) => t.id === tenderId);
    if (tenderToUpdate) {
      updateTender(tenderId, { ...tenderToUpdate, status });
    }
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    if (isHqUser) {
        setRegionFilter('all');
        setBranchFilter('all');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <svg
          className="absolute -right-16 -top-24 text-amber-500"
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
        <CardHeader className="flex flex-row items-start justify-between z-10 relative">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Tender Monitoring</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Track and manage all ongoing and past tenders.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/tenders/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Tender
            </Link>
          </Button>
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
              <div className="text-xl font-bold font-headline sm:text-lg md:text-xl lg:text-2xl">
                {widget.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {widget.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

       <Card>
        <CardContent className="p-4">
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center z-10 relative">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by title, client, or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                 <Select value={regionFilter} onValueChange={setRegionFilter} disabled={!isHqUser}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by region" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regionalOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={branchFilter} onValueChange={setBranchFilter} disabled={!isHqUser && !!user?.branchId}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {availableBranches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {tenderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary"><BarChartBig className="mr-2 h-4 w-4" />Summary Chart</TabsTrigger>
          <TabsTrigger value="data-table"><List className="mr-2 h-4 w-4" />Data Table</TabsTrigger>
          <TabsTrigger value="calendar"><CalendarIcon className="mr-2 h-4 w-4" />Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
            <Card>
                <CardHeader>
                    <CardTitle>Tender Value Summary by Status</CardTitle>
                    <CardDescription>A summary of total tender value for each status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TenderSummaryChart tenders={filteredTenders} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="data-table">
            <Card>
                <CardHeader>
                    <CardTitle>Tender List</CardTitle>
                    <CardDescription>
                    Showing {filteredTenders.length} of {tenders.length} tenders.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-md border-0">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Tender Title</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Submission Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredTenders.length > 0 ? (
                            filteredTenders.map((tender) => (
                            <TableRow key={tender.id}>
                                <TableCell className="font-medium">
                                {tender.title}
                                </TableCell>
                                <TableCell>{tender.client}</TableCell>
                                <TableCell>
                                {tender.branchId ? branchMap[tender.branchId] : 'N/A'}
                                </TableCell>
                                <TableCell>
                                {format(new Date(tender.submissionDate), 'PPP')}
                                </TableCell>
                                <TableCell>
                                <Badge variant={getTenderStatusVariant(tender.status)}>
                                    {tender.status}
                                </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/tenders/${tender.id}`}>
                                        View Details
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/tenders/${tender.id}/edit`}>
                                        Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                        Update Status
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            {tenderStatuses.map((status) => (
                                            <DropdownMenuItem
                                                key={status}
                                                onSelect={() =>
                                                handleStatusUpdate(tender.id, status)
                                                }
                                            >
                                                {status}
                                            </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No tenders found.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6 lg:col-span-1">
                    <Card>
                        <CardHeader>
                        <CardTitle>Upcoming 7 Days</CardTitle>
                        <CardDescription>
                            Tenders with submission deadlines in the next week.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        {upcomingTenders.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                            {upcomingTenders.map((tender) => (
                                <li
                                key={tender.id}
                                className="p-2 rounded-md bg-blue-500/10"
                                >
                                <p className="font-semibold">{tender.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {tender.client} &bull; Due:{' '}
                                    {format(new Date(tender.submissionDate), 'PPP')}
                                </p>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                            No upcoming submissions in the next 7 days.
                            </p>
                        )}
                        </CardContent>
                    </Card>
                    {selectedDate && (
                        <Card>
                        <CardHeader>
                            <CardTitle>
                            Submissions on {format(selectedDate, 'PPP')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {tendersForSelectedDate.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {tendersForSelectedDate.map((tender) => (
                                <li
                                    key={tender.id}
                                    className="p-2 rounded-md bg-blue-500/10"
                                >
                                    <p className="font-semibold">{tender.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                    {tender.client}
                                    </p>
                                </li>
                                ))}
                            </ul>
                            ) : (
                            <p className="text-sm text-muted-foreground">
                                No tender submissions on this date.
                            </p>
                            )}
                        </CardContent>
                        </Card>
                    )}
                </div>
                <Card className="lg:col-span-2">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Tender Calendar
                    </CardTitle>
                    <CardDescription>
                        Click a date to see submission deadlines.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        modifiers={{
                        due: submissionDates,
                        }}
                        modifiersClassNames={{
                        due: 'bg-primary text-primary-foreground rounded-full',
                        }}
                    />
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
