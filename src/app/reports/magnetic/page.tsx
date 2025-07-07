'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, ArrowLeft } from 'lucide-react';
import { type ReportItem, type ReportStatus } from '@/lib/reports';
import { useReports } from '@/context/ReportContext';
import { useAuth } from '@/context/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const getStatusVariant = (status: ReportStatus) => {
    switch (status) {
        case 'Approved': return 'green';
        case 'Submitted': return 'blue';
        case 'Draft': return 'yellow';
        case 'Rejected': return 'destructive';
        default: return 'secondary';
    }
};

export default function MagneticTestListPage() {
  const { reports, deleteReport } = useReports();
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const userRole = useMemo(() => roles.find(r => r.id === user?.roleId), [user, roles]);

  const magneticReports = useMemo(() => {
    const filteredByType = reports.filter(r => r.jobType === 'Magnetic Particle Test');
    if (userRole?.id === 'inspector') {
      return filteredByType.filter(report => {
        const creatorName = report.approvalHistory?.[0]?.actorName;
        return creatorName === user?.name;
      });
    }
    return filteredByType;
  }, [reports, user, userRole]);
  
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
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/reports">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Reports</span>
                </Link>
            </Button>
            <div>
                <h1 className="font-headline text-2xl font-bold">Magnetic Particle Test Reports</h1>
                <p className="text-muted-foreground">View and manage all magnetic particle test reports.</p>
            </div>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Generated Reports</CardTitle>
            <Button asChild>
              <Link href="/reports/magnetic/new">
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
                      {magneticReports.length > 0 ? (
                        magneticReports.map((report) => {
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
                                No magnetic particle test reports found.
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
