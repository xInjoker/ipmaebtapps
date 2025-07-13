
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { useReports } from '@/context/ReportContext';
import { useProjects } from '@/context/ProjectContext';
import { useEmployees } from '@/context/EmployeeContext'; // Import useEmployees
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { type TripRequest } from '@/lib/trips';
import { type ReportItem, type ReportStatus, type ApprovalAction, type RadiographicTestReportDetails } from '@/lib/reports';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

type ApprovalItem = (TripRequest | ReportItem) & { type: 'trip' | 'report' };

export default function ApprovalsPage() {
    const { user } = useAuth();
    const { trips, updateTrip } = useTrips();
    const { reports, updateReport } = useReports();
    const { projects } = useProjects();
    const { employees } = useEmployees(); // Get employees data
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
    const [comments, setComments] = useState('');

    const pendingApprovals = useMemo<ApprovalItem[]>(() => {
        if (!user) return [];

        const pendingTrips: ApprovalItem[] = trips
            .filter(trip => {
                if (trip.status !== 'Pending') return false;
                
                // Get the employee who requested the trip
                const requestingEmployee = employees.find(e => e.id === trip.employeeId.toString());
                if (!requestingEmployee?.reportingManagerId) return false;

                // For now, the first approver is always the direct manager.
                const nextApproverId = requestingEmployee.reportingManagerId;
                const isFinalApproval = true; // Simplified for now
                const currentApprovalCount = trip.approvalHistory.filter(h => h.status === 'Approved').length;

                // Only show if the current user is the next approver and it's the first approval step
                return nextApproverId === user.id.toString() && currentApprovalCount === 0;
            })
            .map(trip => ({ ...trip, type: 'trip' }));

        const pendingReports: ApprovalItem[] = reports
            .filter(report => {
                if (report.status !== 'Submitted' && report.status !== 'Reviewed') return false;
                
                const project = projects.find(p => p.name === report.details?.project);
                if (!project?.reportApprovalWorkflow || project.reportApprovalWorkflow.length === 0) return false;

                const currentApprovalCount = report.approvalHistory.filter(h => h.status === 'Reviewed' || h.status === 'Approved').length;
                
                const nextApproverIndex = currentApprovalCount;

                if (nextApproverIndex >= project.reportApprovalWorkflow.length) return false;

                const nextApprover = project.reportApprovalWorkflow[nextApproverIndex];
                return nextApprover.approverId === user.id.toString();
            })
            .map(report => ({ ...report, type: 'report' }));

        return [...pendingTrips, ...pendingReports];
    }, [user, trips, reports, projects, employees]);
    
    const reportResultSummary = useMemo(() => {
        if (!selectedItem || selectedItem.type !== 'report' || !selectedItem.details) return null;

        const details = selectedItem.details;
        let total = 0;
        let accepted = 0;
        let rejected = 0;

        if ('testResults' in details && details.testResults) {
            // This works for PT, MT, UT
            if (details.jobType !== 'Radiographic Test') {
                total = details.testResults.length;
                details.testResults.forEach(result => {
                    if ('result' in result) {
                        if (result.result === 'Accept') accepted++;
                        else if (result.result === 'Reject') rejected++;
                    }
                });
            } else { 
                // Specific logic for Radiographic Test
                const rtDetails = details as RadiographicTestReportDetails;
                rtDetails.testResults.forEach(result => {
                    if (result.findings) {
                        total += result.findings.length;
                        result.findings.forEach(finding => {
                             if (finding.result === 'Accept') accepted++;
                             else if (finding.result === 'Reject') rejected++;
                        });
                    }
                });
            }
        }
        
        return { total, accepted, rejected };
    }, [selectedItem]);

    const handleActionClick = (item: ApprovalItem) => {
        setSelectedItem(item);
        setComments('');
        setIsDialogOpen(true);
    };

    const handleConfirmAction = (action: 'approve' | 'reject') => {
        if (!selectedItem || !user) return;
        
        if (selectedItem.type === 'trip') {
            const isFinalApproval = true; // Simplified for this implementation
            const newStatus = action === 'reject' ? 'Rejected' : (isFinalApproval ? 'Approved' : 'Pending');
            const newHistory: ApprovalAction = { actorName: user.name, actorRole: 'Approver', status: newStatus, comments: comments, timestamp: new Date().toISOString() };
            
            const updatedTrip = { ...selectedItem, status: newStatus, approvalHistory: [...selectedItem.approvalHistory, newHistory] };
            updateTrip(selectedItem.id, updatedTrip);

        } else if (selectedItem.type === 'report') {
            const project = projects.find(p => p.name === selectedItem.details?.project);
            if (!project) return;
            const workflow = project.reportApprovalWorkflow;
            const currentApprovalCount = selectedItem.approvalHistory.filter(h => h.status === 'Reviewed' || h.status === 'Approved').length;
            const isFinalApproval = currentApprovalCount + 1 === workflow.length;
            
            let newStatus: ReportStatus;
            if (action === 'reject') {
                newStatus = 'Rejected';
            } else {
                newStatus = isFinalApproval ? 'Approved' : 'Reviewed';
            }
            
            const newHistory: ApprovalAction = { actorName: user.name, actorRole: 'Approver', status: newStatus, comments: comments, timestamp: new Date().toISOString() };
            const updatedReport = { ...selectedItem, status: newStatus, approvalHistory: [...selectedItem.approvalHistory, newHistory] };
            updateReport(selectedItem.id, updatedReport);
        }

        toast({ title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`, description: 'The status has been updated successfully.' });
        setIsDialogOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Approvals</CardTitle>
                    <CardDescription>Review and act on requests that require your approval.</CardDescription>
                </CardHeader>
            </Card>

            <Tabs defaultValue="trips">
                <TabsList>
                    <TabsTrigger value="trips">Trip Requests ({pendingApprovals.filter(a => a.type === 'trip').length})</TabsTrigger>
                    <TabsTrigger value="reports">Report Submissions ({pendingApprovals.filter(a => a.type === 'report').length})</TabsTrigger>
                </TabsList>
                <TabsContent value="trips">
                     <Card>
                        <CardContent className="p-0">
                           <div className="rounded-md border-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Requester</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApprovals.filter(item => item.type === 'trip').map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{(item as TripRequest).employeeName}</TableCell>
                                            <TableCell>{(item as TripRequest).destination}</TableCell>
                                            <TableCell>{format(new Date((item as TripRequest).startDate), 'PPP')} - {format(new Date((item as TripRequest).endDate), 'PPP')}</TableCell>
                                            <TableCell>{(item as TripRequest).project}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleActionClick(item)}>Review</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingApprovals.filter(item => item.type === 'trip').length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No pending trip requests.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="reports">
                    <Card>
                        <CardContent className="p-0">
                           <div className="rounded-md border-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Report Number</TableHead>
                                        <TableHead>Job Type</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingApprovals.filter(item => item.type === 'report').map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{(item as ReportItem).reportNumber}</TableCell>
                                            <TableCell>{(item as ReportItem).jobType}</TableCell>
                                            <TableCell>{(item as ReportItem).details?.project}</TableCell>
                                            <TableCell>{(item as ReportItem).approvalHistory[0].actorName}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleActionClick(item)}>Review</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingApprovals.filter(item => item.type === 'report').length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No pending report submissions.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Request</DialogTitle>
                        <DialogDescription>
                            Review the details below and take action.
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedItem && (
                        <Card className="my-4">
                            <CardHeader>
                                <CardTitle className="text-base">Request Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                {selectedItem.type === 'trip' && (
                                    <>
                                        <p><span className="font-semibold w-24 inline-block">Requester:</span> {(selectedItem as TripRequest).employeeName}</p>
                                        <p><span className="font-semibold w-24 inline-block">Destination:</span> {(selectedItem as TripRequest).destination}</p>
                                        <p><span className="font-semibold w-24 inline-block">Dates:</span> {format(new Date((selectedItem as TripRequest).startDate), 'PPP')} to {format(new Date((selectedItem as TripRequest).endDate), 'PPP')}</p>
                                        <p><span className="font-semibold w-24 inline-block">Purpose:</span> {(selectedItem as TripRequest).purpose}</p>
                                    </>
                                )}
                                {selectedItem.type === 'report' && (
                                    <>
                                        <p><span className="font-semibold w-28 inline-block">Report No:</span> {(selectedItem as ReportItem).reportNumber}</p>
                                        <p><span className="font-semibold w-28 inline-block">Job Type:</span> {(selectedItem as ReportItem).jobType}</p>
                                        <p><span className="font-semibold w-28 inline-block">Project:</span> {(selectedItem as ReportItem).details?.project}</p>
                                        <p><span className="font-semibold w-28 inline-block">Created By:</span> {(selectedItem as ReportItem).approvalHistory[0].actorName}</p>
                                        {reportResultSummary && (
                                            <>
                                                <Separator className="my-3"/>
                                                <h4 className="font-semibold mb-1">Results Summary</h4>
                                                <p><span className="font-semibold w-28 inline-block">Total Items:</span> {reportResultSummary.total}</p>
                                                <p><span className="font-semibold w-28 inline-block">Accepted:</span> {reportResultSummary.accepted}</p>
                                                <p><span className="font-semibold w-28 inline-block">Rejected:</span> {reportResultSummary.rejected}</p>
                                            </>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                         {selectedItem?.type === 'report' && (
                            <Button variant="secondary" asChild>
                                <Link href={`/reports/${selectedItem.id}`} target="_blank">
                                    View Full Report
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <div className="flex-grow"/>
                        <Button variant="destructive" onClick={() => handleConfirmAction('reject')}>Reject</Button>
                        <Button onClick={() => handleConfirmAction('approve')}>Approve</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
