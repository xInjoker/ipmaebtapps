
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { type ReportItem, type OtherReportDetails } from '@/lib/reports';
import { useReports } from '@/context/ReportContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { HeaderCard } from '@/components/header-card';

export default function OtherReportListPage() {
  const { reports, deleteReport } = useReports();
  const { user, roles, userHasPermission } = useAuth();
  const { toast } = useToast();

  const otherReports = useMemo(() => {
    return reports.filter(r => r.jobType === 'Other');
  }, [reports]);

  return (
    <div className="space-y-6">
      <HeaderCard
          title="Inspection Reports (QMS)"
          description="View and manage all other inspection reports."
      >
          <Button asChild>
            <Link href="/reports/other/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Report
            </Link>
          </Button>
      </HeaderCard>
      
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
                        <TableHead>Equipment/Material</TableHead>
                        <TableHead>Vendor/Subcontractor</TableHead>
                        <TableHead>Inspector</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {otherReports.length > 0 ? (
                      otherReports.map((report) => {
                        const details = report.details as OtherReportDetails | null;
                        return (
                            <TableRow key={report.id}>
                                <TableCell className="font-medium">{report.reportNumber}</TableCell>
                                <TableCell>{details?.equipmentMaterial || 'N/A'}</TableCell>
                                <TableCell>{details?.vendor || 'N/A'}</TableCell>
                                <TableCell>{details?.inspector || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={details?.result === 'Accept' ? 'green' : 'destructive'}>{details?.result}</Badge>
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
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                              No inspection reports found.
                          </TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
