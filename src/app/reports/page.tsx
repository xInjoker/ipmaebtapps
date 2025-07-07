
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, Beaker, Magnet, Waves, Radio, FileText, MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type ReportItem, type ReportStatus } from '@/lib/reports';
import { useReports } from '@/context/ReportContext';

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
  const { reports } = useReports();

  return (
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
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Report Number</TableHead>
                          <TableHead>Job Location</TableHead>
                          <TableHead>Line Type</TableHead>
                          <TableHead>Job Type</TableHead>
                          <TableHead>Qty Joint</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {reports.map((report) => (
                          <TableRow key={report.id}>
                              <TableCell className="font-medium">{report.reportNumber}</TableCell>
                              <TableCell>{report.jobLocation}</TableCell>
                              <TableCell>{report.lineType}</TableCell>
                              <TableCell>{report.jobType}</TableCell>
                              <TableCell>{report.qtyJoint}</TableCell>
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
                                          <DropdownMenuItem>Edit</DropdownMenuItem>
                                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  );
}
