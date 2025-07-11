
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, ArrowLeft, FileText, Layers, CheckCircle, XCircle } from 'lucide-react';
import { type ReportItem, type ReportStatus, type RadiographicTestReportDetails } from '@/lib/reports';
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

export default function RadiographicTestListPage() {
  const { reports, deleteReport } = useReports();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const userRole = useMemo(() => roles.find(r => r.id === user?.roleId), [user, roles]);

  const radiographicReports = useMemo(() => {
    const filteredByType = reports.filter(r => r.jobType === 'Radiographic Test');
    if (userRole?.id === 'inspector') {
      return filteredByType.filter(report => {
        const creatorName = report.approvalHistory?.[0]?.actorName;
        return creatorName === user?.name;
      });
    }
    return filteredByType;
  }, [reports, user, userRole]);

  const dashboardStats = useMemo(() => {
    let totalJoints = 0;
    let totalSheets = 0;
    let totalAccepted = 0;
    let totalRejected = 0;

    radiographicReports.forEach(report => {
        totalJoints += report.qtyJoint;
        const details = report.details as RadiographicTestReportDetails | null;
        if (details?.jobType === 'Radiographic Test' && details.testResults) {
            details.testResults.forEach(result => {
                if(result.findings) {
                    totalSheets += result.findings.length;
                    result.findings.forEach(finding => {
                        if (finding.result === 'Accept') totalAccepted++;
                        else totalRejected++;
                    });
                }
            });
        }
    });

    return {
        totalReports: radiographicReports.length,
        totalJoints,
        totalSheets,
        totalAccepted,
        totalRejected,
    };
  }, [radiographicReports]);
  
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
      title: 'Accepted Films',
      value: `${dashboardStats.totalAccepted}`,
      description: `out of ${dashboardStats.totalSheets} total films`,
      icon: CheckCircle,
      iconColor: 'text-amber-500',
      shapeColor: 'text-amber-500/10',
    },
    {
      title: 'Rejected Films',
      value: `${dashboardStats.totalRejected}`,
      description: `out of ${dashboardStats.totalSheets} total films`,
      icon: XCircle,
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
                        <CardTitle>Radiographic Test Reports</CardTitle>
                        <CardDescription>View and manage all radiographic test reports.</CardDescription>
                    </div>
                </div>
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
                    <div className="text-xl font-bold font-headline sm:text-lg md:text-xl lg:text-2xl">{widget.value}</div>
                    <p className="text-xs text-muted-foreground">
                        {widget.description}
                    </p>
                </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Generated Reports</CardTitle>
            <Button asChild>
              <Link href="/reports/radiographic/new">
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
                          <TableHead>Qty Sheet</TableHead>
                          <TableHead>Qty Acc</TableHead>
                          <TableHead>Qty Reject</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {radiographicReports.length > 0 ? (
                        radiographicReports.map((report) => {
                          const creator = report.approvalHistory?.[0]?.actorName || 'N/A';
                          const details = report.details as RadiographicTestReportDetails | null;
                          
                          let qtySheet = 0;
                          let qtyAcc = 0;
                          let qtyReject = 0;

                          if (details && details.jobType === 'Radiographic Test' && details.testResults) {
                              details.testResults.forEach(result => {
                                  if(result.findings) {
                                      qtySheet += result.findings.length;
                                      result.findings.forEach(finding => {
                                          if (finding.result === 'Accept') {
                                              qtyAcc++;
                                          } else if (finding.result === 'Reject') {
                                              qtyReject++;
                                          }
                                      });
                                  }
                              });
                          }

                          return (
                              <TableRow key={report.id}>
                                  <TableCell className="font-medium">{report.reportNumber}</TableCell>
                                  <TableCell>{report.details?.project || 'N/A'}</TableCell>
                                  <TableCell>{report.qtyJoint}</TableCell>
                                  <TableCell>{qtySheet}</TableCell>
                                  <TableCell>{qtyAcc}</TableCell>
                                  <TableCell>{qtyReject}</TableCell>
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
                            <TableCell colSpan={9} className="h-24 text-center">
                                No radiographic test reports found.
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
