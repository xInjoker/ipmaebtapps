
'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { useReports } from '@/context/ReportContext';
import { useProjects } from '@/context/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { type TripRequest } from '@/lib/trips';
import { type ReportItem, type ReportStatus, type ApprovalAction } from '@/lib/reports';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ApprovalItem = (TripRequest | ReportItem) & { type: 'trip' | 'report' };

export default function ApprovalsPage() {
    const { user } = useAuth();
    const { trips, updateTrip } = useTrips();
    const { reports, updateReport } = useReports();
    const { projects } = useProjects();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
    const [comments, setComments] = useState('');

    const pendingApprovals = useMemo<ApprovalItem[]>(() => {
        if (!user) return [];

        const pendingTrips: ApprovalItem[] = trips
            .filter(trip => {
                if (trip.status !== 'Pending') return false;
                const project = projects.find(p => p.name === trip.project);
                if (!project?.tripApprovalWorkflow || project.tripApprovalWorkflow.length === 0) return false;
                
                const currentApproverIndex = trip.approvalHistory.filter(h => h.status === 'Approved').length;
                if (currentApproverIndex >= project.tripApprovalWorkflow.length) return false;

                const nextApprover = project.tripApprovalWorkflow[currentApproverIndex];
                return nextApprover.approverId === user.id.toString();
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
    }, [user, trips, reports, projects]);

    const handleActionClick = (item: ApprovalItem, action: 'approve' | 'reject') => {
        setSelectedItem(item);
        setApprovalAction(action);
        setComments('');
        setIsDialogOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedItem || !approvalAction || !user) return;
        
        const project = projects.find(p => p.name === (selectedItem.type === 'trip' ? selectedItem.project : selectedItem.details?.project));
        if (!project) return;
        
        if (selectedItem.type === 'trip') {
            const workflow = project.tripApprovalWorkflow;
            const currentApprovalCount = selectedItem.approvalHistory.filter(h => h.status === 'Approved').length;
            const isFinalApproval = currentApprovalCount + 1 === workflow.length;

            const newStatus = approvalAction === 'reject' ? 'Rejected' : (isFinalApproval ? 'Approved' : 'Pending');
            const newHistory: ApprovalAction = { actorName: user.name, actorRole: 'Approver', status: newStatus, comments: comments, timestamp: new Date().toISOString() };
            
            const updatedTrip = { ...selectedItem, status: newStatus, approvalHistory: [...selectedItem.approvalHistory, newHistory] };
            updateTrip(selectedItem.id, updatedTrip);

        } else if (selectedItem.type === 'report') {
            const workflow = project.reportApprovalWorkflow;
            const currentApprovalCount = selectedItem.approvalHistory.filter(h => h.status === 'Reviewed' || h.status === 'Approved').length;
            const isFinalApproval = currentApprovalCount + 1 === workflow.length;
            
            let newStatus: ReportStatus;
            if (approvalAction === 'reject') {
                newStatus = 'Rejected';
            } else {
                newStatus = isFinalApproval ? 'Approved' : 'Reviewed';
            }
            
            const newHistory: ApprovalAction = { actorName: user.name, actorRole: 'Approver', status: newStatus, comments: comments, timestamp: new Date().toISOString() };
            const updatedReport = { ...selectedItem, status: newStatus, approvalHistory: [...selectedItem.approvalHistory, newHistory] };
            updateReport(selectedItem.id, updatedReport);
        }

        toast({ title: `Request ${approvalAction === 'approve' ? 'Approved' : 'Rejected'}`, description: 'The status has been updated successfully.' });
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
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="destructive" onClick={() => handleActionClick(item, 'reject')}>Reject</Button>
                                                <Button size="sm" onClick={() => handleActionClick(item, 'approve')}>Approve</Button>
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
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="destructive" onClick={() => handleActionClick(item, 'reject')}>Reject</Button>
                                                <Button size="sm" onClick={() => handleActionClick(item, 'approve')}>Approve</Button>
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
                        <DialogTitle>Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}</DialogTitle>
                        <DialogDescription>
                            You are about to {approvalAction} this request. Review the details and add comments below.
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
                                        <p><span className="font-semibold w-24 inline-block">Report No:</span> {(selectedItem as ReportItem).reportNumber}</p>
                                        <p><span className="font-semibold w-24 inline-block">Job Type:</span> {(selectedItem as ReportItem).jobType}</p>
                                        <p><span className="font-semibold w-24 inline-block">Project:</span> {(selectedItem as ReportItem).details?.project}</p>
                                        <p><span className="font-semibold w-24 inline-block">Created By:</span> {(selectedItem as ReportItem).approvalHistory[0].actorName}</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="comments">Comments (Optional)</Label>
                        <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmAction} variant={approvalAction === 'reject' ? 'destructive' : 'default'}>
                            Confirm {approvalAction === 'approve' ? 'Approval' : 'Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
