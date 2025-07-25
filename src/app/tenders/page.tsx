
'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  DropdownMenuSeparator,
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
  Calendar as CalendarIcon,
  X,
  Search,
  BarChartBig,
  List,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react';
import { useTenders } from '@/context/TenderContext';
import { type Tender, type TenderStatus, tenderStatuses, regionalOptions, tenderFieldLabels } from '@/lib/tenders';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { isSameDay, isWithinInterval, startOfDay, addDays } from 'date-fns';
import { getTenderStatusVariant, formatCurrencyMillions } from '@/lib/utils';
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
import { TenderCountChart } from '@/components/tender-count-chart';
import { TenderBranchChart } from '@/components/tender-branch-chart';
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';
import * as XLSX from 'xlsx';
import { TenderExportDialog } from '@/components/tender-export-dialog';

const allTenderFields = Object.keys(tenderFieldLabels) as (keyof Tender)[];

export default function TendersPage() {
  useSearchParams();
  const { tenders, updateTender } = useTenders();
  const { user, isHqUser, branches, userHasPermission } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const initialFilterSet = useRef(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<TenderStatus | 'all'>('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [isCustomizeExportOpen, setIsCustomizeExportOpen] = useState(false);
  const [exportFields, setExportFields] = useState<(keyof Tender)[]>([
    'tenderNumber', 'title', 'client', 'status', 'submissionDate', 'bidPrice'
  ]);
  
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
        const branchMatch = branchFilter === 'all' || tender.branchId === branchMatch;
        const statusMatch = statusFilter === 'all' || tender.status === statusFilter;

        // Non-HQ users should only see tenders from their branch/region
        if (!isHqUser && user) {
            const userBranch = branches.find(b => b.id === user.branchId);
            if (tender.regional !== userBranch?.region) return false;
        }

        return searchMatch && regionMatch && branchMatch && statusMatch;
    });
  }, [tenders, searchTerm, branchFilter, statusFilter, regionFilter, user, isHqUser, branches]);

  const tenderStats = useMemo(() => {
    const initialStats = {
      count: 0,
      value: 0,
    };
  
    const statusMetrics = filteredTenders.reduce((acc, tender) => {
      const status = tender.status;
      if (!acc[status]) {
        acc[status] = { count: 0, value: 0 };
      }
      acc[status].count += 1;
      acc[status].value += tender.bidPrice;
      return acc;
    }, {} as Record<TenderStatus, { count: number; value: number }>);
  
    const inProgressStatuses: TenderStatus[] = ['Aanwijzing', 'Bidding', 'Evaluation', 'Prequalification'];
    const lostCancelledStatuses: TenderStatus[] = ['Lost', 'Cancelled'];
  
    const getAggregatedStats = (statuses: TenderStatus[]) => {
      return statuses.reduce((acc, status) => {
        const metric = statusMetrics[status] || initialStats;
        acc.count += metric.count;
        acc.value += metric.value;
        return acc;
      }, { count: 0, value: 0 });
    };
  
    return {
      totalTenders: {
        count: filteredTenders.length,
        value: filteredTenders.reduce((sum, t) => sum + t.bidPrice, 0),
      },
      inProgress: getAggregatedStats(inProgressStatuses),
      awarded: statusMetrics['Awarded'] || initialStats,
      lostOrCancelled: getAggregatedStats(lostCancelledStatuses),
    };
  }, [filteredTenders]);

  const widgetData = useMemo(() => [
    {
      title: 'Total Tenders',
      value: `${formatCurrencyMillions(tenderStats.totalTenders.value)}`,
      description: `${tenderStats.totalTenders.count} total tenders`,
      icon: Users,
      iconColor: 'text-blue-500',
      shapeColor: 'text-blue-500/10',
    },
    {
      title: 'In Progress',
      value: `${formatCurrencyMillions(tenderStats.inProgress.value)}`,
      description: `${tenderStats.inProgress.count} active tenders`,
      icon: Clock,
      iconColor: 'text-amber-500',
      shapeColor: 'text-amber-500/10',
    },
    {
      title: 'Awarded',
      value: `${formatCurrencyMillions(tenderStats.awarded.value)}`,
      description: `${tenderStats.awarded.count} won tenders`,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      shapeColor: 'text-green-500/10',
    },
    {
      title: 'Lost / Cancelled',
      value: `${formatCurrencyMillions(tenderStats.lostOrCancelled.value)}`,
      description: `${tenderStats.lostOrCancelled.count} lost or cancelled`,
      icon: XCircle,
      iconColor: 'text-rose-500',
      shapeColor: 'text-rose-500/10',
    },
  ], [tenderStats]);


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

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
  }, []);

  const handleStatusUpdate = useCallback((tenderId: string, status: TenderStatus) => {
    const tenderToUpdate = tenders.find((t) => t.id === tenderId);
    if (tenderToUpdate) {
      updateTender(tenderId, { ...tenderToUpdate, status });
    }
  }, [tenders, updateTender]);
  
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    if (isHqUser) {
        setRegionFilter('all');
        setBranchFilter('all');
    }
  }, [isHqUser]);

  const handleExport = useCallback(() => {
    const dataToExport = filteredTenders.map((tender) => {
      const selectedData: Partial<Tender> = {};
      exportFields.forEach((field) => {
        if (field === 'branchId') {
            (selectedData as any)['Branch'] = branchMap[tender.branchId || ''] || 'N/A';
        } else {
            selectedData[field] = tender[field];
        }
      });
      return selectedData;
    });

    const headers = exportFields.map(
      (field) => (field === 'branchId' ? 'Branch' : tenderFieldLabels[field]) || field
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
      header: exportFields.map(f => f === 'branchId' ? 'Branch' : f),
    });
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenders');
    XLSX.writeFile(workbook, 'tenders.xlsx');
  }, [filteredTenders, exportFields, branchMap]);


  return (
    <>
    <div className="space-y-6">
      <HeaderCard
        title="Tender Monitoring"
        description="Track and manage all ongoing and past tenders."
      >
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleExport}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setIsCustomizeExportOpen(true)}
                >
                  Customize Export Fields
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {userHasPermission('manage-tenders') && (
                <Button asChild>
                    <Link href="/tenders/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Tender
                    </Link>
                </Button>
            )}
        </div>
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
                    placeholder="Search by title, client, or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 bg-background/90 text-foreground focus:bg-background"
                />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                 <Select value={regionFilter} onValueChange={setRegionFilter} disabled={!isHqUser}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background/90 text-foreground focus:bg-background">
                        <SelectValue placeholder="Filter by region" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regionalOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={branchFilter} onValueChange={setBranchFilter} disabled={!isHqUser && !!user?.branchId}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background/90 text-foreground focus:bg-background">
                        <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {availableBranches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background/90 text-foreground focus:bg-background">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {tenderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button variant="ghost" onClick={handleClearFilters} className="w-full sm:w-auto text-primary-foreground hover:text-primary-foreground hover:bg-white/20">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TenderBranchChart tenders={filteredTenders} branches={branches} />
                <TenderSummaryChart tenders={filteredTenders} />
                <TenderCountChart tenders={filteredTenders} />
            </div>
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
                            <TableHead>Tender Number</TableHead>
                            <TableHead>Title</TableHead>
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
                                    {tender.tenderNumber}
                                </TableCell>
                                <TableCell>{tender.title}</TableCell>
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
                                    {userHasPermission('manage-tenders') && (
                                        <>
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
                                        </>
                                    )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
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
                            <div className="text-sm text-muted-foreground text-center py-4">
                                No upcoming submissions in the next 7 days.
                            </div>
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
    <TenderExportDialog
        isOpen={isCustomizeExportOpen}
        onOpenChange={setIsCustomizeExportOpen}
        onSave={setExportFields}
        allFields={allTenderFields}
        defaultSelectedFields={exportFields}
    />
    </>
  );
}
