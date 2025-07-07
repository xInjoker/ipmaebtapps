
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, Beaker, Magnet, Waves, Radio, FileText, MoreHorizontal, Search, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type ReportItem, type ReportStatus, reportStatuses } from '@/lib/reports';
import { useReports } from '@/context/ReportContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const reportTypes = [
  { name: 'Penetrant Test', href: '/reports/penetrant', icon: Beaker, description: 'Create and manage liquid penetrant testing reports.' },
  { name: 'Magnetic Particle Test', href: '/reports/magnetic', icon: Magnet, description: 'Create and manage magnetic particle testing reports.' },
  { name: 'Ultrasonic Test', href: '/reports/ultrasonic', icon: Waves, description: 'Create and manage ultrasonic testing reports.' },
  { name: 'Radiographic Test', href: '/reports/radiographic', icon: Radio, description: 'Create and manage radiographic testing reports.' },
  { name: 'Other Methods', href: '/reports/other', icon: FileText, description: 'Create and manage reports for other testing methods.' },
];

const getStatusVariant = (status: ReportStatus) => {
    switch (status) {
        case 'Approved':
            return 'green';
        case 'Submitted':
            return 'blue';
        case 'Draft':
            return 'yellow';
        case 'Rejected':
            return 'destructive';
        default:
            return 'secondary';
    }
};

export default function ReportsPage() {
  const { reports, deleteReport } = useReports();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter(item => {
        const searchMatch = searchTerm.toLowerCase() === '' ||
                            item.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.jobLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.details?.project.toLowerCase().includes(searchTerm.toLowerCase());

        const jobTypeMatch = jobTypeFilter === 'all' || item.jobType === jobTypeFilter;
        const statusMatch = statusFilter === 'all' || item.status === statusFilter;

        return searchMatch && jobTypeMatch && statusMatch;
    });
  }, [reports, searchTerm, jobTypeFilter, statusFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setJobTypeFilter('all');
    setStatusFilter('all');
  };
  
  const handleConfirmDelete = () => {
    if (reportToDelete) {
      deleteReport(reportToDelete.id);
      toast({
        title: 'Report Deleted',
        description: `Report ${reportToDelete.reportNumber} has been deleted.`,
      });
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Reporting</CardTitle>
            <CardDescription>
              Select a non-destructive testing method to create a new report or view existing reports below.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reportTypes.map((report) => (
            <Card key={report.name} className="hover:border-primary/50 transition-colors">
              <Link href={report.href} className="flex flex-col h-full">
                <CardHeader className="flex-row items-center gap-4">
                  <report.icon className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>{report.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardContent>
                <div className="flex items-center p-6 pt-0 text-sm font-medium text-primary">
                  <span>Create Report</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            </Card>
          ))}
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>A summary of all generated test reports.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          placeholder="Search by number or project..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-full"
                      />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                      <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                          <SelectTrigger className="w-full sm:w-[180px]">
                              <SelectValue placeholder="Filter by job type" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">All Job Types</SelectItem>
                              {reportTypes.map(type => <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-full sm:w-[160px]">
                              <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              {reportStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Button variant="ghost" onClick={handleClearFilters} className="w-full sm:w-auto">
                          <X className="mr-2 h-4 w-4" /> Clear
                      </Button>
                  </div>
                </div>
                <Separator className="my-6" />

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Report Number</TableHead>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Line Type</TableHead>
                            <TableHead>Job Type</TableHead>
                            <TableHead>Qty Joint</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReports.length > 0 ? (
                          filteredReports.map((report) => {
                            const creator = report.approvalHistory?.[0]?.actorName || 'N/A';
                            return (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium">{report.reportNumber}</TableCell>
                                    <TableCell>{report.details?.project || 'N/A'}</TableCell>
                                    <TableCell>{report.lineType}</TableCell>
                                    <TableCell>{report.jobType}</TableCell>
                                    <TableCell>{report.qtyJoint}</TableCell>
                                    <TableCell>{creator}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
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
                                                  <Link href={`/reports/${report.id}`}>View</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild disabled={report.jobType !== 'Penetrant Test'}>
                                                    <Link href={report.jobType === 'Penetrant Test' ? `/reports/penetrant/${report.id}/edit` : '#'}>
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        setReportToDelete(report);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                              <TableCell colSpan={8} className="h-24 text-center">
                                  No reports found.
                              </TableCell>
                          </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the report
              {reportToDelete && ` "${reportToDelete.reportNumber}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReportToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
