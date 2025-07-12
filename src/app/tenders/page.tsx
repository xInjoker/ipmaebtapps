
'use client';

import { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, User, Users, CheckCircle, XCircle, Clock, Calendar as CalendarIcon, X } from 'lucide-react';
import { useTenders } from '@/context/TenderContext';
import { type TenderStatus, tenderStatuses } from '@/lib/tenders';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { isSameDay, isWithinInterval, startOfDay, addDays } from 'date-fns';
import { getTenderStatusVariant } from '@/lib/utils';

export default function TendersPage() {
    use(useSearchParams());
    const { tenders, updateTender } = useTenders();
    const { branches } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [tendersForSelectedDate, setTendersForSelectedDate] = useState<typeof tenders>([]);

    const dashboardStats = useMemo(() => {
        const statusCounts = tenders.reduce((acc, tender) => {
            acc[tender.status] = (acc[tender.status] || 0) + 1;
            return acc;
        }, {} as Record<TenderStatus, number>);

        return {
            totalTenders: tenders.length,
            inProgress: (statusCounts['Aanwijzing'] || 0) + (statusCounts['Bidding'] || 0) + (statusCounts['Evaluation'] || 0),
            awarded: statusCounts['Awarded'] || 0,
            lostOrCancelled: (statusCounts['Lost'] || 0) + (statusCounts['Cancelled'] || 0),
        };
    }, [tenders]);
    
    const widgetData = [
        {
            title: 'Total Tenders',
            value: `${dashboardStats.totalTenders}`,
            description: 'tenders being tracked',
            icon: Users,
            iconColor: 'text-blue-500',
            shapeColor: 'text-blue-500/10',
        },
        {
            title: 'In Progress',
            value: `${dashboardStats.inProgress}`,
            description: 'tenders currently active',
            icon: Clock,
            iconColor: 'text-amber-500',
            shapeColor: 'text-amber-500/10',
        },
        {
            title: 'Awarded',
            value: `${dashboardStats.awarded}`,
            description: 'tenders successfully won',
            icon: CheckCircle,
            iconColor: 'text-green-500',
            shapeColor: 'text-green-500/10',
        },
        {
            title: 'Lost / Cancelled',
            value: `${dashboardStats.lostOrCancelled}`,
            description: 'tenders not won or cancelled',
            icon: XCircle,
            iconColor: 'text-rose-500',
            shapeColor: 'text-rose-500/10',
        },
    ];

    const branchMap = useMemo(() => {
        return branches.reduce((acc, branch) => {
            acc[branch.id] = branch.name;
            return acc;
        }, {} as Record<string, string>);
    }, [branches]);
    
    const submissionDates = useMemo(() => {
        return tenders.map(tender => new Date(tender.submissionDate));
    }, [tenders]);

    const upcomingTenders = useMemo(() => {
        const today = startOfDay(new Date());
        const nextSevenDays = addDays(today, 7);
        return tenders.filter(tender => {
            const submissionDate = new Date(tender.submissionDate);
            return isWithinInterval(submissionDate, { start: today, end: nextSevenDays });
        }).sort((a,b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime());
    }, [tenders]);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            const eventsOnDate = tenders.filter(tender => isSameDay(new Date(tender.submissionDate), date));
            setTendersForSelectedDate(eventsOnDate);
        } else {
            setTendersForSelectedDate([]);
        }
    }

    const handleStatusUpdate = (tenderId: string, status: TenderStatus) => {
        const tenderToUpdate = tenders.find(t => t.id === tenderId);
        if (tenderToUpdate) {
            updateTender(tenderId, { ...tenderToUpdate, status });
        }
    };

    return (
        <div className="space-y-6">
            <Card className="relative overflow-hidden">
                <svg
                    className="absolute -right-20 -top-20 text-amber-500 -z-1"
                    width="300"
                    height="300"
                    viewBox="0 0 200 200"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        fill="currentColor"
                        d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
                        transform="translate(100 100)"
                    />
                </svg>
                 <svg
                    className="absolute bottom-0 left-0 w-1/3 text-primary/5 -z-1"
                    viewBox="0 0 433 384"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M382 314.5C232 458 55.5003 403 0.500244 314.5C-54.4998 226 103.5 125.5 103.5 0.500002"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="M325.5 383.5C175.5 527.5 -0.999756 472.5 -55.9998 384C-111 295.5 47 195 47 69.9999"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1.5 z-10">
                        <CardTitle className="font-headline">Tender Monitoring</CardTitle>
                        <CardDescription>Track and manage all ongoing and past tenders.</CardDescription>
                    </div>
                    <Button asChild className="z-10">
                        <Link href="/tenders/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Tender
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {widgetData.map((widget, index) => (
                <Card key={index} className="relative overflow-hidden">
                    <svg
                        className={`absolute -top-1 -right-1 h-24 w-24 ${widget.shapeColor}`}
                        fill="currentColor"
                        viewBox="0 0 200 200"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M62.3,-53.5C78.2,-41.5,86.8,-20.8,86.4,-0.4C86,20,76.6,40,61.9,54.1C47.2,68.2,27.1,76.4,5.4,75.3C-16.3,74.2,-32.7,63.7,-47.5,51.3C-62.3,38.8,-75.6,24.5,-80.5,6.7C-85.4,-11.1,-82,-32.5,-69.3,-45.5C-56.6,-58.5,-34.7,-63.1,-15.6,-64.3C3.5,-65.5,26.4,-65.5,43.2,-61.7C59.9,-57.9,59.9,-57.9,62.3,-53.5Z"
                        transform="translate(100 100)"
                        />
                    </svg>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {widget.title}
                        </CardTitle>
                        <widget.icon className={`h-8 w-8 ${widget.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold font-headline sm:text-lg md:text-xl lg:text-2xl">{widget.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {widget.description}
                        </p>
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming 7 Days</CardTitle>
                            <CardDescription>Tenders with submission deadlines in the next week.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {upcomingTenders.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {upcomingTenders.map(tender => (
                                        <li key={tender.id} className="p-2 rounded-md bg-blue-500/10">
                                            <p className="font-semibold">{tender.title}</p>
                                            <p className="text-xs text-muted-foreground">{tender.client} &bull; Due: {format(new Date(tender.submissionDate), 'PPP')}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming submissions in the next 7 days.</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5"/>Tender Calendar</CardTitle>
                            <CardDescription>Click a date to see submission deadlines.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                modifiers={{
                                    due: submissionDates,
                                }}
                                modifiersClassNames={{
                                    due: 'bg-primary text-primary-foreground rounded-full',
                                }}
                            />
                        </CardContent>
                    </Card>
                    {selectedDate && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Submissions on {format(selectedDate, 'PPP')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {tendersForSelectedDate.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {tendersForSelectedDate.map(tender => (
                                            <li key={tender.id} className="p-2 rounded-md bg-blue-500/10">
                                                <p className="font-semibold">{tender.title}</p>
                                                <p className="text-xs text-muted-foreground">{tender.client}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No tender submissions on this date.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Tender List</CardTitle>
                                <CardDescription>
                                    Showing all tenders.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="rounded-md border-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tender Title</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenders.length > 0 ? (
                                        tenders.map((tender) => (
                                            <TableRow key={tender.id}>
                                                <TableCell className="font-medium">{tender.title}</TableCell>
                                                <TableCell>{tender.client}</TableCell>
                                                <TableCell>{tender.branchId ? branchMap[tender.branchId] : 'N/A'}</TableCell>
                                                <TableCell>{format(new Date(tender.submissionDate), 'PPP')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getTenderStatusVariant(tender.status)}>{tender.status}</Badge>
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
                                                                <Link href={`/tenders/${tender.id}`}>View Details</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/tenders/${tender.id}/edit`}>Edit</Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSub>
                                                                <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                                                <DropdownMenuPortal>
                                                                    <DropdownMenuSubContent>
                                                                        {tenderStatuses.map(status => (
                                                                            <DropdownMenuItem key={status} onSelect={() => handleStatusUpdate(tender.id, status)}>
                                                                                {status}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuPortal>
                                                            </DropdownMenuSub>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No tenders found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
