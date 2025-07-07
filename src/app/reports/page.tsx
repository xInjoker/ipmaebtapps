
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Beaker, Magnet, Waves, Radio, FileText, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type ReportItem, type ReportStatus } from '@/lib/reports';
import { useReports } from '@/context/ReportContext';
import { useAuth } from '@/context/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const reportTypes = [
  { name: 'Penetrant Test', href: '/reports/penetrant', icon: Beaker, description: 'Liquid penetrant testing reports.' },
  { name: 'Magnetic Particle Test', href: '/reports/magnetic', icon: Magnet, description: 'Magnetic particle testing reports.' },
  { name: 'Ultrasonic Test', href: '/reports/ultrasonic', icon: Waves, description: 'Ultrasonic testing reports.' },
  { name: 'Radiographic Test', href: '/reports/radiographic', icon: Radio, description: 'Radiographic testing reports.' },
  { name: 'Other Methods', href: '/reports/other', icon: FileText, description: 'Reports for other testing methods.' },
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
  const { user, roles } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportItem | null>(null);

  const userRole = useMemo(() => roles.find(r => r.id === user?.roleId), [user, roles]);

  const visibleReports = useMemo(() => {
    if (userRole?.id === 'inspector') {
      return reports.filter(report => {
        const creatorName = report.approvalHistory?.[0]?.actorName;
        return creatorName === user?.name;
      });
    }
    return reports;
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
        <div>
            <h1 className="font-headline text-2xl font-bold">Reporting</h1>
            <p className="text-muted-foreground">
              Select a non-destructive testing method to create a new report or view existing reports.
            </p>
        </div>

        <div className="space-y-8">
          {reportTypes.map((reportType) => {
            const filteredReports = visibleReports.filter(r => r.jobType === reportType.name);
            return (
              <Card key={reportType.name}>
                <CardHeader className="flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <reportType.icon className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="font-headline">{reportType.name}</CardTitle>
                      <CardDescription>{reportType.description}</CardDescription>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={reportType.href}>
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
                            {filteredReports.length > 0 ? (
                              filteredReports.map((report) => {
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
                                  <TableCell colSpan={6} className="h-24 text-center">
                                      No reports found for this method.
                                  </TableCell>
                              </TableRow>
                            )}
                        </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
