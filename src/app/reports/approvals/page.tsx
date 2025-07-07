'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReports } from '@/context/ReportContext';
import { useAuth } from '@/context/AuthContext';
import { FileSearch, ChevronRight } from 'lucide-react';
import { type ReportStatus } from '@/lib/reports';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

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

export default function ApprovalSetupPage() {
  const router = useRouter();
  const { userHasPermission } = useAuth();
  const { reports } = useReports();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userHasPermission('view-approvals')) {
      router.push('/');
    }
  }, [userHasPermission, router]);

  const submittedReports = useMemo(() => {
    return reports.filter((report) => report.status === 'Submitted');
  }, [reports]);

  const numSelected = Object.keys(rowSelection).length;
  const numReports = submittedReports.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection: Record<string, boolean> = {};
      submittedReports.forEach((report) => {
        newSelection[report.id] = true;
      });
      setRowSelection(newSelection);
    } else {
      setRowSelection({});
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setRowSelection((prev) => {
      const newSelection = { ...prev };
      if (checked) {
        newSelection[id] = true;
      } else {
        delete newSelection[id];
      }
      return newSelection;
    });
  };

  const selectedIds = useMemo(() => Object.keys(rowSelection), [rowSelection]);
  const queryString = new URLSearchParams({
    ids: selectedIds.join(','),
  }).toString();

  if (!userHasPermission('view-approvals')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Approval Setup Wizard</CardTitle>
          <CardDescription>
            Step 1: Select the reports you want to send for approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {numReports > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          numSelected === numReports && numReports > 0
                            ? true
                            : numSelected > 0
                            ? 'indeterminate'
                            : false
                        }
                        onCheckedChange={(checked) =>
                          handleSelectAll(checked === true)
                        }
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Report Number</TableHead>
                    <TableHead>Job Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Creation Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedReports.map((report) => (
                    <TableRow
                      key={report.id}
                      data-state={rowSelection[report.id] && 'selected'}
                    >
                      <TableCell>
                        <Checkbox
                          checked={!!rowSelection[report.id]}
                          onCheckedChange={(checked) =>
                            handleSelectRow(report.id, !!checked)
                          }
                          aria-label={`Select report ${report.reportNumber}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {report.reportNumber}
                      </TableCell>
                      <TableCell>{report.jobType}</TableCell>
                      <TableCell>{report.jobLocation}</TableCell>
                      <TableCell>
                        {format(new Date(report.creationDate), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-md border-2 border-dashed">
              <FileSearch className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No Reports Awaiting Approval
              </h3>
              <p className="text-sm text-muted-foreground">
                There are no reports with "Submitted" status.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t bg-muted/50 px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {numSelected} of {numReports} row(s) selected.
          </div>
          <Button asChild disabled={numSelected === 0}>
            <Link href={`/reports/approvals/assign?${queryString}`}>
                Next: Assign Reviewer <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}