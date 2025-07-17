
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
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';


const getStatusVariant = (status: ReportStatus) => {
    switch (status) {
        case 'Approved': return 'success';
        case 'Reviewed': return 'blue';
        case 'Submitted': return 'info';
        case 'Draft': return 'warning';
        case 'Rejected': return 'destructive';
        default: return 'secondary';
    }
};

export default function OtherMethodsListPage() {
  const { reports, deleteReport } = useReports();
  const { user, roles, userHasPermission } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const userRole = useMemo(() => roles.find(r => r.id === user?.roleId), [user, roles]);

  const otherReports = useMemo(() => {
    const filteredByType = reports.filter(r => r.jobType === 'Other');
    if (userRole?.id === 'inspector') {
      return filteredByType.filter(report => {
        const creatorName = report.approvalHistory?.[0]?.actorName;
        return creatorName === user?.name;
      });
    }
    return filteredByType;
  }, [reports, user, userRole]);

  const dashboardStats = useMemo(() => {
    const totalJoints = otherReports.reduce((acc, report) => acc + report.qtyJoint, 0);
    const statusCounts = otherReports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<ReportStatus, number>);

    return {
      totalReports: otherReports.length,
      totalJoints,
      approved: statusCounts['Approved'] || 0,
      submitted: (statusCounts['Submitted'] || 0) + (statusCounts['Reviewed'] || 0),
    };
  }, [otherReports]);
  
  const widgetData = [
    {
      title: 'Total Reports',
      value: `${dashboardStats.totalReports}`,
      description: 'reports generated',
      icon: FileText,
      iconColor: 'text-blue-500',
      shapeColor: 'text-blue-500/10',
    },
    {
      title: 'Total Joints Tested',
      value: `${dashboardStats.totalJoints}`,
      description: 'across all reports',
      icon: Layers,
      iconColor: 'text-green-500',
      shapeColor: 'text-green-500/10',
    },
    {
      title: 'Approved Reports',
      value: `${dashboardStats.approved}`,
      description: 'fully approved reports',
      icon: CheckCircle,
      iconColor: 'text-amber-500',
      shapeColor: 'text-amber-500/10',
    },
    {
      title: 'Pending Approval',
      value: `${dashboardStats.submitted}`,
      description: 'reports submitted',
      icon: Clock,
      iconColor: 'text-rose-500',
      shapeColor: 'text-rose-500/10',
    },
  ];

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
        <HeaderCard
            title="Other Methods Reports"
            description="View and manage all other methods reports."
        >
            <Button asChild>
              <Link href="/reports/other/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Report
              </Link>
            </Button>
        </HeaderCard>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {widgetData.map((widget, index) => (
            <DashboardWidget key={index} {...widget} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
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
                      {otherReports.length > 0 ? (
                        otherReports.map((report) => {
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
                                              {userHasPermission('manage-reports') && (
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
                                              )}
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </TableCell>
                              </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No other methods reports found.
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
