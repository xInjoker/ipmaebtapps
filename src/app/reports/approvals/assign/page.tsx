'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { useReports } from '@/context/ReportContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCheck, UserCog, Send } from 'lucide-react';

function ApprovalAssignment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { reports, assignApproversAndSubmit } = useReports();
  const { user, users, roles } = useAuth();

  const [selectedReviewer, setSelectedReviewer] = useState<string>('');
  const [selectedApprover, setSelectedApprover] = useState<string>('');

  const reportIds = useMemo(() => searchParams.get('ids')?.split(',') || [], [searchParams]);
  const selectedReports = useMemo(() => reports.filter(r => reportIds.includes(r.id)), [reports, reportIds]);

  const reviewers = useMemo(() => users.filter(u => {
      const role = roles.find(r => r.id === u.roleId);
      return role?.permissions.includes('review-reports');
  }), [users, roles]);
  
  const approvers = useMemo(() => users.filter(u => {
      const role = roles.find(r => r.id === u.roleId);
      return role?.permissions.includes('approve-reports');
  }), [users, roles]);

  useEffect(() => {
    if (selectedReports.length === 0 && reportIds.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Reports not found',
        description: 'Could not find the selected reports. You may have already processed them.',
      });
      router.push('/reports/approvals');
    }
  }, [selectedReports, reportIds, router, toast]);

  const handleSubmit = () => {
    if (!selectedReviewer || !selectedApprover) {
      toast({
        variant: 'destructive',
        title: 'Reviewer & Approver Required',
        description: 'Please select both a reviewer and an approver.',
      });
      return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error' });
        return;
    }

    const userRole = roles.find(r => r.id === user.roleId)?.name || 'Unknown Role';

    assignApproversAndSubmit(reportIds, selectedReviewer, selectedApprover, user.name, userRole);

    toast({
      title: 'Reports Submitted',
      description: `${reportIds.length} report(s) have been sent for approval.`,
    });
    router.push('/reports');
  };

  if (reportIds.length === 0) {
    return (
      <div className="text-center">
        <p>No reports selected. Please go back and select reports to approve.</p>
        <Button asChild className="mt-4"><Link href="/reports/approvals">Go Back</Link></Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Approval Setup: Assign Roles</CardTitle>
        <CardDescription>You have selected {selectedReports.length} report(s). Assign a reviewer and approver below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="font-semibold text-lg">Selected Reports</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {selectedReports.map(r => <li key={r.id}>{r.reportNumber} ({r.jobType})</li>)}
          </ul>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reviewer" className="flex items-center gap-2"><UserCheck className="h-4 w-4" />Assign Reviewer (Client QAQC)</Label>
          <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
            <SelectTrigger id="reviewer"><SelectValue placeholder="Select a reviewer..."/></SelectTrigger>
            <SelectContent>
              {reviewers.map(r => <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
         <div className="space-y-2">
          <Label htmlFor="approver" className="flex items-center gap-2"><UserCog className="h-4 w-4" />Assign Approver (Client Representative)</Label>
          <Select value={selectedApprover} onValueChange={setSelectedApprover}>
            <SelectTrigger id="approver"><SelectValue placeholder="Select an approver..."/></SelectTrigger>
            <SelectContent>
              {approvers.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/reports/approvals"><ArrowLeft className="mr-2 h-4 w-4"/>Back</Link>
        </Button>
        <Button onClick={handleSubmit}><Send className="mr-2 h-4 w-4"/>Send for Approval</Button>
      </CardFooter>
    </Card>
  );
}


export default function AssignApprovalPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ApprovalAssignment />
        </Suspense>
    )
}