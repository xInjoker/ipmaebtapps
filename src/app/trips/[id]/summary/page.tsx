
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, User, Map, Calendar, Briefcase, Info, Send, Building2, GanttChart, Utensils, Car, UserCheck, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as UiTableFooter } from '@/components/ui/table';
import { allowanceRates } from '@/lib/trips';
import { useProjects } from '@/context/ProjectContext';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}


export default function TripSummaryPage() {
    const router = useRouter();
    const params = useParams();
    const tripId = params.id as string;
    const { getTripById, updateTrip } = useTrips();
    const { toast } = useToast();
    const { user, users } = useAuth();
    const { projects } = useProjects();
    const logoUrl = 'https://i.ibb.co/L09xL5x/sucofindo-logo.png';
    
    const trip = getTripById(tripId);

    const tripProject = useMemo(() => {
        if (!trip || !trip.project) return null;
        return projects.find(p => p.name === trip.project);
    }, [trip, projects]);

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

        if (!tripProject) {
            toast({
                variant: 'destructive',
                title: 'Project Not Found',
                description: 'The associated project could not be found. Cannot determine approval workflow.',
            });
            return;
        }

        if (!tripProject.tripApprovalWorkflow || tripProject.tripApprovalWorkflow.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Approval Workflow Not Configured',
                description: 'Please configure the trip approval workflow for this project first.',
            });
            return;
        }

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

    const handlePrint = () => {
        if (!trip) return;
        const doc = new jsPDF() as jsPDFWithAutoTable;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageMargin = 14;

        // Header
        doc.addImage(logoUrl, 'PNG', pageWidth - pageMargin - 30, 15, 30, 15);
        doc.setFontSize(18);
        doc.text('Business Trip Request', pageMargin, 22, { align: 'left' });
        doc.setFontSize(12);
        doc.text(`Request ID: ${trip.id}`, pageMargin, 30, { align: 'left' });
        doc.text(`Status: ${trip.status}`, pageMargin, 38, { align: 'left' });


        // Trip Details
        const tripDetails = [
            ['Employee', trip.employeeName],
            ['Position', trip.position || 'N/A'],
            ['Destination', trip.destination],
            ['Project', trip.project || 'N/A'],
            ['Dates', `${format(new Date(trip.startDate), 'PPP')} to ${format(new Date(trip.endDate), 'PPP')}`],
            ['Purpose', trip.purpose],
        ];
        doc.autoTable({
            startY: 50,
            head: [['Trip Details', '']],
            body: tripDetails,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
        });

        // Allowance Details
        const allowanceBody = [
            ...mealItems.map(item => [item.name, item.qty, item.unit, formatCurrency(item.rate), formatCurrency(item.total)]),
            ...transportItems.map(item => [item.name, item.qty, item.unit, formatCurrency(item.rate), formatCurrency(item.total)]),
        ];
        doc.autoTable({
            head: [['Allowance Item', 'Qty', 'Unit', 'Rate', 'Total']],
            body: allowanceBody,
            foot: [['', '', '', 'Grand Total', formatCurrency(totalAllowance)]],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' },
            startY: (doc as any).lastAutoTable.finalY + 10,
        });

        // Signature Section
        const signatureBody = trip.approvalHistory
            .filter(h => h.status === 'Approved' || h.status === 'Pending')
            .map(h => {
                const approver = users.find(u => u.id === h.actorId);
                const signatureContent = approver?.signatureUrl
                    ? { image: approver.signatureUrl, width: 40, height: 15 }
                    : '';
                return [
                    { content: `${h.actorName}\n\n\n\n___________________\n(${h.status} on ${format(new Date(h.timestamp), 'PPP')})`, styles: { halign: 'center', minCellHeight: 40 } },
                    { content: signatureContent, styles: { halign: 'center', valign: 'middle', minCellHeight: 40 } },
                ]
            });
        
        doc.autoTable({
            head: [['Approver', 'Signature']],
            body: signatureBody,
            startY: (doc as any).lastAutoTable.finalY + 15,
            theme: 'grid',
            tableWidth: 'wrap'
        });


        doc.save(`TripRequest-${trip.id}.pdf`);
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
    const isApproved = trip.status === 'Approved' || trip.status === 'Booked' || trip.status === 'Completed';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
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
                        {isApproved && (
                             <Button onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                            <div className="flex items-center gap-3"><User className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium text-muted-foreground">Employee</div><div>{trip.employeeName}</div></div></div>
                            <div className="flex items-center gap-3"><Briefcase className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium text-muted-foreground">Position</div><div>{trip.position}</div></div></div>
                            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium text-muted-foreground">Division/Function</div><div>{trip.division}</div></div></div>
                            <div className="flex items-center gap-3"><GanttChart className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium text-muted-foreground">Project</div><div>{trip.project}</div></div></div>
                            <div className="flex items-center gap-3"><Map className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium text-muted-foreground">Destination</div><div>{trip.destination}</div></div></div>
                            <div className="flex items-center gap-3"><Building2 className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium text-muted-foreground">Destination Company</div><div>{trip.destinationCompany || 'N/A'}</div></div></div>
                            <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-muted-foreground" /><div><div className="font-medium text-muted-foreground">Dates</div><div>{format(new Date(trip.startDate), 'PPP')} - {format(new Date(trip.endDate), 'PPP')} ({tripDuration} day(s))</div></div></div>
                            <div className="lg:col-span-3 flex items-start gap-3"><Info className="h-4 w-4 text-muted-foreground mt-0.5" /><div><div className="font-medium text-muted-foreground">Purpose</div><div className="max-w-prose">{trip.purpose}</div></div></div>
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
                            <CardDescription>This request will be routed according to the workflow defined for the project.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ol className="relative border-s border-gray-200 dark:border-gray-700 ml-2">                  
                                {tripProject?.tripApprovalWorkflow.map((stage, index) => {
                                    const approver = users.find(u => u.id.toString() === stage.approverId);
                                    const isLast = index === tripProject.tripApprovalWorkflow.length - 1;
                                    return (
                                        <li key={stage.stage} className={cn(!isLast && "mb-6", "ms-6")}>            
                                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -start-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                                <UserCheck className="w-3.5 h-3.5 text-blue-800 dark:text-blue-300" />
                                            </span>
                                            <h3 className="flex items-center mb-1 text-base font-semibold text-gray-900 dark:text-white">{stage.roleName}</h3>
                                            <p className="block mb-2 text-sm font-normal leading-none text-gray-500 dark:text-gray-500">{approver ? approver.name : 'Not Assigned'}</p>
                                        </li>
                                    );
                                })}
                            </ol>
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
