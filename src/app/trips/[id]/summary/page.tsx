
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, User, Map, Calendar, Briefcase, Info, Send, Building2, GanttChart, Utensils, Car, UserCheck, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as UiTableFooter } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const allowanceRates = {
    breakfast: 75000,
    lunch: 100000,
    dinner: 100000,
    daily: 150000,
    localTransport: 100000,
    jabodetabekAirport: 350000,
    jabodetabekStation: 250000,
    otherAirportStation: 150000,
    mileage: 3500,
};

export default function TripSummaryPage() {
    const router = useRouter();
    const params = useParams();
    const { getTripById, updateTrip } = useTrips();
    const { toast } = useToast();
    const { user, users } = useAuth();
    
    const tripId = params.id as string;
    const trip = getTripById(tripId);

    const [verifierId, setVerifierId] = useState('');
    const [approverId, setApproverId] = useState('');
    
    useEffect(() => {
        if (trip?.approvers) {
            setVerifierId(trip.approvers.managerId);
            setApproverId(trip.approvers.financeId);
        }
    }, [trip]);

    const { mealItems, transportItems, mealsSubtotal, transportSubtotal, totalAllowance } = useMemo(() => {
        if (!trip?.allowance) return { mealItems: [], transportItems: [], mealsSubtotal: 0, transportSubtotal: 0, totalAllowance: 0 };
        
        const { allowance } = trip;
        const meals = [];
        let mealTotal = 0;

        if (allowance.meals.breakfast.enabled && allowance.meals.breakfast.qty > 0) {
            const value = allowanceRates.breakfast * allowance.meals.breakfast.qty;
            meals.push({ name: 'Breakfast', qty: allowance.meals.breakfast.qty, rate: allowanceRates.breakfast, unit: 'meal', total: value });
            mealTotal += value;
        }
        if (allowance.meals.lunch.enabled && allowance.meals.lunch.qty > 0) {
            const value = allowanceRates.lunch * allowance.meals.lunch.qty;
            meals.push({ name: 'Lunch', qty: allowance.meals.lunch.qty, rate: allowanceRates.lunch, unit: 'meal', total: value });
            mealTotal += value;
        }
        if (allowance.meals.dinner.enabled && allowance.meals.dinner.qty > 0) {
            const value = allowanceRates.dinner * allowance.meals.dinner.qty;
            meals.push({ name: 'Dinner', qty: allowance.meals.dinner.qty, rate: allowanceRates.dinner, unit: 'meal', total: value });
            mealTotal += value;
        }
        if (allowance.daily.enabled && allowance.daily.qty > 0) {
            const value = allowanceRates.daily * allowance.daily.qty;
            meals.push({ name: 'Daily Allowance', qty: allowance.daily.qty, rate: allowanceRates.daily, unit: 'day', total: value });
            mealTotal += value;
        }

        const transport = [];
        let transportTotal = 0;
        if (allowance.transport.localTransport.enabled && allowance.transport.localTransport.qty > 0) {
            const value = allowanceRates.localTransport * allowance.transport.localTransport.qty;
            transport.push({ name: 'Local Transport', qty: allowance.transport.localTransport.qty, rate: allowanceRates.localTransport, unit: 'day', total: value });
            transportTotal += value;
        }
        if (allowance.transport.jabodetabekAirport.enabled && allowance.transport.jabodetabekAirport.qty > 0) {
            const value = allowanceRates.jabodetabekAirport * allowance.transport.jabodetabekAirport.qty;
            transport.push({ name: 'JABODETABEK Airport', qty: allowance.transport.jabodetabekAirport.qty, rate: allowanceRates.jabodetabekAirport, unit: 'trip', total: value });
            transportTotal += value;
        }
        if (allowance.transport.jabodetabekStation.enabled && allowance.transport.jabodetabekStation.qty > 0) {
            const value = allowanceRates.jabodetabekStation * allowance.transport.jabodetabekStation.qty;
            transport.push({ name: 'JABODETABEK Station', qty: allowance.transport.jabodetabekStation.qty, rate: allowanceRates.jabodetabekStation, unit: 'trip', total: value });
            transportTotal += value;
        }
        if (allowance.transport.otherAirportStation.enabled && allowance.transport.otherAirportStation.qty > 0) {
            const value = allowanceRates.otherAirportStation * allowance.transport.otherAirportStation.qty;
            transport.push({ name: 'Other Station/Airport', qty: allowance.transport.otherAirportStation.qty, rate: allowanceRates.otherAirportStation, unit: 'trip', total: value });
            transportTotal += value;
        }
        if (allowance.transport.mileage.enabled && allowance.transport.mileage.qty > 0) {
            const value = allowanceRates.mileage * allowance.transport.mileage.qty;
            transport.push({ name: 'Mileage', qty: allowance.transport.mileage.qty, rate: allowanceRates.mileage, unit: 'km', total: value });
            transportTotal += value;
        }

        return { mealItems: meals, transportItems: transport, mealsSubtotal: mealTotal, transportSubtotal: transportTotal, totalAllowance: mealTotal + transportTotal };
    }, [trip]);
    
    const handleSubmitForApproval = () => {
        if (!trip || !user) return;

        if (!verifierId || !approverId) {
            toast({
                variant: 'destructive',
                title: 'Approval Setup Required',
                description: 'Please select both a verifier and an approver.',
            });
            return;
        }

        const updatedTrip = {
            ...trip,
            status: 'Pending' as const,
            approvers: {
                managerId: verifierId,
                financeId: approverId,
            },
            approvalHistory: [
                ...trip.approvalHistory,
                {
                    actorId: user.id,
                    actorName: user.name,
                    status: 'Pending' as const,
                    comments: "Submitted for approval",
                    timestamp: new Date().toISOString()
                }
            ]
        };

        updateTrip(trip.id, updatedTrip);
        toast({ title: 'Trip Submitted', description: 'Your business trip request has been submitted for approval.' });
        router.push('/trips');
    };
    
    const assignedVerifierName = useMemo(() => {
        if (!trip?.approvers?.managerId) return 'Not Assigned';
        return users.find(u => u.id.toString() === trip.approvers?.managerId)?.name || 'Unknown User';
    }, [trip?.approvers, users]);

    const assignedApproverName = useMemo(() => {
        if (!trip?.approvers?.financeId) return 'Not Assigned';
        return users.find(u => u.id.toString() === trip.approvers?.financeId)?.name || 'Unknown User';
    }, [trip?.approvers, users]);

    if (!trip) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Not Found</CardTitle>
                        <CardDescription>The trip you are looking for could not be found.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                         <Button asChild><Link href="/trips">Return to Trips</Link></Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href={trip.status === 'Draft' ? `/trips/${trip.id}/setup` : '/trips'}>
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back</span>
                            </Link>
                        </Button>
                        <div className="space-y-1.5">
                            <CardTitle>Trip Request Summary</CardTitle>
                            <CardDescription>Review the details of the business trip and allowance before submitting for approval.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                            <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Employee</p><p>{trip.employeeName}</p></div></div>
                            <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Position</p><p>{trip.position}</p></div></div>
                            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Division/Function</p><p>{trip.division}</p></div></div>
                            <div className="flex items-center gap-3"><GanttChart className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Project</p><p>{trip.project}</p></div></div>
                            <div className="flex items-center gap-3"><Map className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Destination</p><p>{trip.destination}</p></div></div>
                            <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Dates</p><p>{format(new Date(trip.startDate), 'PPP')} - {format(new Date(trip.endDate), 'PPP')} ({tripDuration} day(s))</p></div></div>
                            <div className="lg:col-span-3 flex items-start gap-3"><Info className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="font-medium text-muted-foreground">Purpose</p><p className="max-w-prose">{trip.purpose}</p></div></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Allowance Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="flex items-center gap-2 font-semibold mb-2"><Utensils className="h-4 w-4"/>Meals & Daily Allowance</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Rate</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mealItems.length > 0 ? (
                                            mealItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-center">{item.qty} {item.unit}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No meal allowances selected.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <UiTableFooter>
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-semibold">Subtotal</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(mealsSubtotal)}</TableCell>
                                        </TableRow>
                                    </UiTableFooter>
                                </Table>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 font-semibold mb-2"><Car className="h-4 w-4"/>Transport Allowance</h4>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Rate</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transportItems.length > 0 ? (
                                            transportItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-center">{item.qty} {item.unit}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No transport allowances selected.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                     <UiTableFooter>
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-right font-semibold">Subtotal</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(transportSubtotal)}</TableCell>
                                        </TableRow>
                                    </UiTableFooter>
                                </Table>
                            </div>
                            <Separator className="my-4"/>
                            <div className="flex justify-end items-center gap-4 text-lg font-bold">
                                <span>Total Estimated Allowance:</span>
                                <span className="text-primary">{formatCurrency(totalAllowance)}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Approval Process</CardTitle>
                            <CardDescription>Select the users responsible for verifying and approving this trip.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {trip.status === 'Draft' ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="verifier" className="flex items-center gap-2"><UserCheck className="h-4 w-4" />Verified By</Label>
                                        <Select value={verifierId} onValueChange={setVerifierId}>
                                            <SelectTrigger id="verifier"><SelectValue placeholder="Select a verifier..."/></SelectTrigger>
                                            <SelectContent>
                                            {users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="approver" className="flex items-center gap-2"><UserCog className="h-4 w-4" />Approved By</Label>
                                        <Select value={approverId} onValueChange={setApproverId}>
                                            <SelectTrigger id="approver"><SelectValue placeholder="Select an approver..."/></SelectTrigger>
                                            <SelectContent>
                                            {users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3"><UserCheck className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Verified By</p><p>{assignedVerifierName}</p></div></div>
                                    <div className="flex items-center gap-3"><UserCog className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Approved By</p><p>{assignedApproverName}</p></div></div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </CardContent>
                {trip.status === 'Draft' && (
                    <CardFooter className="flex justify-end">
                        <Button onClick={handleSubmitForApproval}>
                            <Send className="mr-2 h-4 w-4"/>
                            Submit for Approval
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
