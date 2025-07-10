
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, ArrowLeft, FileText, Layers, CheckCircle, Clock } from 'lucide-react';
import { type ReportItem, type ReportStatus } from '@/lib/reports';
import { useReports } from '@/context/ReportContext';
import { useAuth } from '@/context/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const getStatusVariant = (status: ReportStatus) => {
    switch (status) {
        case 'Approved': return 'success';
        case 'Submitted': return 'info';
        case 'Draft': return 'warning';
        case 'Rejected': return 'destructive';
        default: return 'secondary';
    }
};

export default function UltrasonicTestListPage() {
  const { reports, deleteReport } = useReports();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const userRole = useMemo(() => roles.find(r => r.id === user?.roleId), [user, roles]);

  const ultrasonicReports = useMemo(() => {
    const filteredByType = reports.filter(r => r.jobType === 'Ultrasonic Test');
    if (userRole?.id === 'inspector') {
      return filteredByType.filter(report => {
        const creatorName = report.approvalHistory?.[0]?.actorName;
        return creatorName === user?.name;
      });
    }
    return filteredByType;
  }, [reports, user, userRole]);

  const dashboardStats = useMemo(() => {
    const totalJoints = ultrasonicReports.reduce((acc, report) => acc + report.qtyJoint, 0);
    const statusCounts = ultrasonicReports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<ReportStatus, number>);

    return {
      totalReports: ultrasonicReports.length,
      totalJoints,
      approved: statusCounts['Approved'] || 0,
      submitted: statusCounts['Submitted'] || 0,
    };
  }, [ultrasonicReports]);
  
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
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/reports">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to Reports</span>
                        </Link>
                    </Button>
                    <div>
                        <CardTitle>Ultrasonic Test Reports</CardTitle>
                        <CardDescription>View and manage all ultrasonic test reports.</CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{dashboardStats.totalReports}</div>
                <p className="text-xs text-muted-foreground">reports generated</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Joints Tested</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{dashboardStats.totalJoints}</div>
                <p className="text-xs text-muted-foreground">across all reports</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Reports</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{dashboardStats.approved}</div>
                <p className="text-xs text-muted-foreground">fully approved reports</p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{dashboardStats.submitted}</div>
                <p className="text-xs text-muted-foreground">reports submitted</p>
              </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Generated Reports</CardTitle>
            <Button asChild>
              <Link href="/reports/ultrasonic/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Report
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
             <div className="rounded-md border">
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Report Number</TableHead>
                          <TableHead>Project Name</TableHead>
                          <TableHead>Qty Joint</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {ultrasonicReports.length > 0 ? (
                        ultrasonicReports.map((report) => {
                          const creator = report.approvalHistory?.[0]?.actorName || 'N/A';
                          return (
                              <TableRow key={report.id}>
                                  <TableCell className="font-medium">{report.reportNumber}</TableCell>
                                  <TableCell>{report.details?.project || 'N/A'}</TableCell>
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
                                              <DropdownMenuItem disabled>Edit</DropdownMenuItem>
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
                            <TableCell colSpan={6} className="h-24 text-center">
                                No ultrasonic test reports found.
                            </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
              </Table>
            </div>
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
