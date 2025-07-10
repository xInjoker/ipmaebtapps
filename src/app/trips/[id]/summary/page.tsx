
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, User, Map, Calendar, Briefcase, Info, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    const { user } = useAuth();
    
    const tripId = params.id as string;
    const trip = getTripById(tripId);

    const { summaryItems, totalAllowance } = useMemo(() => {
        if (!trip?.allowance) return { summaryItems: [], totalAllowance: 0 };
        
        const { allowance } = trip;
        const items = [];
        let total = 0;

        if (allowance.meals.breakfast.enabled && allowance.meals.breakfast.qty > 0) {
            const value = allowanceRates.breakfast * allowance.meals.breakfast.qty;
            items.push({ name: 'Breakfast', qty: allowance.meals.breakfast.qty, rate: allowanceRates.breakfast, unit: 'meal', total: value });
            total += value;
        }
        if (allowance.meals.lunch.enabled && allowance.meals.lunch.qty > 0) {
            const value = allowanceRates.lunch * allowance.meals.lunch.qty;
            items.push({ name: 'Lunch', qty: allowance.meals.lunch.qty, rate: allowanceRates.lunch, unit: 'meal', total: value });
            total += value;
        }
        if (allowance.meals.dinner.enabled && allowance.meals.dinner.qty > 0) {
            const value = allowanceRates.dinner * allowance.meals.dinner.qty;
            items.push({ name: 'Dinner', qty: allowance.meals.dinner.qty, rate: allowanceRates.dinner, unit: 'meal', total: value });
            total += value;
        }
        if (allowance.daily.enabled && allowance.daily.qty > 0) {
            const value = allowanceRates.daily * allowance.daily.qty;
            items.push({ name: 'Daily Allowance', qty: allowance.daily.qty, rate: allowanceRates.daily, unit: 'day', total: value });
            total += value;
        }
        if (allowance.transport.localTransport.enabled && allowance.transport.localTransport.qty > 0) {
            const value = allowanceRates.localTransport * allowance.transport.localTransport.qty;
            items.push({ name: 'Local Transport', qty: allowance.transport.localTransport.qty, rate: allowanceRates.localTransport, unit: 'day', total: value });
            total += value;
        }
        if (allowance.transport.jabodetabekAirport.enabled && allowance.transport.jabodetabekAirport.qty > 0) {
            const value = allowanceRates.jabodetabekAirport * allowance.transport.jabodetabekAirport.qty;
            items.push({ name: 'JABODETABEK Airport', qty: allowance.transport.jabodetabekAirport.qty, rate: allowanceRates.jabodetabekAirport, unit: 'trip', total: value });
            total += value;
        }
        if (allowance.transport.jabodetabekStation.enabled && allowance.transport.jabodetabekStation.qty > 0) {
            const value = allowanceRates.jabodetabekStation * allowance.transport.jabodetabekStation.qty;
            items.push({ name: 'JABODETABEK Station', qty: allowance.transport.jabodetabekStation.qty, rate: allowanceRates.jabodetabekStation, unit: 'trip', total: value });
            total += value;
        }
        if (allowance.transport.otherAirportStation.enabled && allowance.transport.otherAirportStation.qty > 0) {
            const value = allowanceRates.otherAirportStation * allowance.transport.otherAirportStation.qty;
            items.push({ name: 'Other Station/Airport', qty: allowance.transport.otherAirportStation.qty, rate: allowanceRates.otherAirportStation, unit: 'trip', total: value });
            total += value;
        }
        if (allowance.transport.mileage.enabled && allowance.transport.mileage.qty > 0) {
            const value = allowanceRates.mileage * allowance.transport.mileage.qty;
            items.push({ name: 'Mileage', qty: allowance.transport.mileage.qty, rate: allowanceRates.mileage, unit: 'km', total: value });
            total += value;
        }

        return { summaryItems: items, totalAllowance: total };
    }, [trip]);
    
    const handleSubmitForApproval = () => {
        if (!trip || !user) return;

        const updatedTrip = {
            ...trip,
            status: 'Pending' as const,
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
                            <Link href={`/trips/${trip.id}/setup`}>
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back to Setup</span>
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
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Employee</p><p>{trip.employeeName}</p></div></div>
                            <div className="flex items-center gap-2"><Map className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Destination</p><p>{trip.destination}</p></div></div>
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Dates</p><p>{format(new Date(trip.startDate), 'PPP')} - {format(new Date(trip.endDate), 'PPP')}</p></div></div>
                            <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Duration</p><p>{tripDuration} Day(s)</p></div></div>
                            <div className="col-span-2 flex items-start gap-2"><Info className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="font-medium text-muted-foreground">Purpose</p><p>{trip.purpose}</p></div></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Allowance Details</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                    {summaryItems.length > 0 ? (
                                        summaryItems.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.qty} {item.unit}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No allowances selected.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <Separator className="my-4"/>
                            <div className="flex justify-end items-center gap-4 text-lg font-bold">
                                <span>Total Estimated Allowance:</span>
                                <span className="text-primary">{formatCurrency(totalAllowance)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSubmitForApproval}>
                        <Send className="mr-2 h-4 w-4"/>
                        Submit for Approval
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
