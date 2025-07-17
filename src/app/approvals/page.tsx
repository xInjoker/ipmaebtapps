
'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { useReports } from '@/context/ReportContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { type TripRequest } from '@/lib/trips';
import { type ReportItem, type ReportStatus, type ApprovalAction, type RadiographicTestReportDetails, type MagneticParticleTestReportDetails, type PenetrantTestReportDetails, type UltrasonicTestReportDetails } from '@/lib/reports';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { HeaderCard } from '@/components/header-card';
import { useProjects } from '@/context/ProjectContext';

type ApprovalItem = (TripRequest | ReportItem) & { type: 'trip' | 'report' };

export default function ApprovalsPage() {
    const { user, users } = useAuth();
    const { trips, updateTrip, getPendingTripApprovalsForUser } = useTrips();
    const { reports, updateReport, getPendingReportApprovalsForUser } = useReports();
    const { projects } = useProjects();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
    const [comments, setComments] = useState('');

    const pendingTrips = useMemo(() => {
        if (!user) return [];
        return getPendingTripApprovalsForUser(user.id).map(trip => ({ ...trip, type: 'trip' as const }));
    }, [user, getPendingTripApprovalsForUser, trips]); // Add trips to dependency array
    
    const pendingReports = useMemo(() => {
        if (!user) return [];
        return getPendingReportApprovalsForUser(user.id).map(report => ({ ...report, type: 'report' as const }));
    }, [user, getPendingReportApprovalsForUser, reports]); // Add reports to dependency array


    const reportResultSummary = useMemo(() => {
        if (!selectedItem || selectedItem.type !== 'report' || !selectedItem.details) return null;

        const details = selectedItem.details;
        let total = 0;
        let accepted = 0;
        let rejected = 0;

        switch (details.jobType) {
            case 'Penetrant Test':
            case 'Magnetic Particle Test':
            case 'Ultrasonic Test': {
                const testResults = (details as PenetrantTestReportDetails | MagneticParticleTestReportDetails | UltrasonicTestReportDetails).testResults;
                total = testResults.length;
                accepted = testResults.filter(r => r.result === 'Accept').length;
                rejected = testResults.filter(r => r.result === 'Reject').length;
                break;
            }
            case 'Radiographic Test': {
                const rtDetails = details as RadiographicTestReportDetails;
                rtDetails.testResults.forEach(result => {
                    if (result.findings) {
                        total += result.findings.length;
                        accepted += result.findings.filter(f => f.result === 'Accept').length;
                        rejected += result.findings.filter(f => f.result === 'Reject').length;
                    }
                });
                break;
            }
        }
        
        return { total, accepted, rejected };
    }, [selectedItem]);

    const handleActionClick = useCallback((item: ApprovalItem) => {
        setSelectedItem(item);
        setComments('');
        setIsDialogOpen(true);
    }, []);

    const handleConfirmAction = useCallback((action: 'approve' | 'reject') => {
        if (!selectedItem || !user) return;
    
        if (selectedItem.type === 'trip') {
            const project = projects.find(p => p.name === selectedItem.project);
            const workflow = project?.tripApprovalWorkflow || [];
            const currentApprovalCount = selectedItem.approvalHistory.filter(h => h.status === 'Approved').length;
            const isFinalApproval = currentApprovalCount + 1 >= workflow.length;
            
            const newStatus = action === 'reject' ? 'Rejected' : (isFinalApproval ? 'Approved' : 'Pending');
            const newHistory: ApprovalAction = { actorName: user.name, actorRole: 'Approver', status: newStatus, comments: comments, timestamp: new Date().toISOString() };
            
            const updatedTrip = { ...selectedItem, status: newStatus, approvalHistory: [...selectedItem.approvalHistory, newHistory] };
            updateTrip(selectedItem.id, updatedTrip as TripRequest);

        } else if (selectedItem.type === 'report') {
            const project = projects.find(p => p.name === selectedItem.details?.project);
            const workflow = project?.reportApprovalWorkflow || [];
            const currentApprovalCount = selectedItem.approvalHistory.filter(h => h.status === 'Reviewed' || h.status === 'Approved').length;
            const isFinalApproval = currentApprovalCount + 1 >= workflow.length;

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
    }, [selectedItem, user, projects, comments, updateTrip, updateReport, toast]);

    return (
        <div className="space-y-6">
            <HeaderCard
                title="My Approvals"
                description="Review and act on requests that require your approval."
            />

            <Tabs defaultValue="trips">
                <TabsList>
                    <TabsTrigger value="trips">Trip Requests ({pendingTrips.length})</TabsTrigger>
                    <TabsTrigger value="reports">Report Submissions ({pendingReports.length})</TabsTrigger>
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
                                    {pendingTrips.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.employeeName}</TableCell>
                                            <TableCell>{item.destination}</TableCell>
                                            <TableCell>{format(new Date(item.startDate), 'PPP')} - {format(new Date(item.endDate), 'PPP')}</TableCell>
                                            <TableCell>{item.project}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleActionClick(item)}>Review</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingTrips.length === 0 && (
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
                                    {pendingReports.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.reportNumber}</TableCell>
                                            <TableCell>{item.jobType}</TableCell>
                                            <TableCell>{item.details?.project}</TableCell>
                                            <TableCell>{item.approvalHistory[0].actorName}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" onClick={() => handleActionClick(item)}>Review</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {pendingReports.length === 0 && (
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
                                        <p><span className="font-semibold w-24 inline-block">Requester:</span> {selectedItem.employeeName}</p>
                                        <p><span className="font-semibold w-24 inline-block">Destination:</span> {selectedItem.destination}</p>
                                        <p><span className="font-semibold w-24 inline-block">Dates:</span> {format(new Date(selectedItem.startDate), 'PPP')} to {format(new Date(selectedItem.endDate), 'PPP')}</p>
                                        <p><span className="font-semibold w-24 inline-block">Purpose:</span> {selectedItem.purpose}</p>
                                    </>
                                )}
                                {selectedItem.type === 'report' && (
                                    <>
                                        <p><span className="font-semibold w-28 inline-block">Report No:</span> {selectedItem.reportNumber}</p>
                                        <p><span className="font-semibold w-28 inline-block">Job Type:</span> {selectedItem.jobType}</p>
                                        <p><span className="font-semibold w-28 inline-block">Project:</span> {selectedItem.details?.project}</p>
                                        <p><span className="font-semibold w-28 inline-block">Created By:</span> {selectedItem.approvalHistory[0].actorName}</p>
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
