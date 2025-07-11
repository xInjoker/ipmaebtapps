
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Eye,
  Plane,
  CheckCircle,
  Clock,
  XCircle,
  FilePen,
  FileCog,
} from 'lucide-react';
import { useTrips } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { type TripStatus } from '@/lib/trips';
import { format } from 'date-fns';

const getStatusVariant = (status: TripStatus) => {
  switch (status) {
    case 'Approved':
    case 'Booked':
    case 'Completed':
      return 'green' as const;
    case 'Pending':
      return 'yellow' as const;
    case 'Rejected':
      return 'destructive' as const;
    case 'Draft':
      return 'secondary' as const;
    default:
      return 'secondary' as const;
  }
};

export default function TripsPage() {
  const { trips } = useTrips();
  const { user } = useAuth();

  const filteredTrips = useMemo(() => {
    if (!user) return [];
    // Super admins see all, others see their own requests
    if (user.roleId === 'super-admin') {
      return trips;
    }
    return trips.filter(trip => trip.employeeId === user.id);
  }, [trips, user]);

  const dashboardStats = useMemo(() => {
    const statusCounts = filteredTrips.reduce((acc, trip) => {
      acc[trip.status] = (acc[trip.status] || 0) + 1;
      return acc;
    }, {} as Record<TripStatus, number>);

    return {
      totalTrips: filteredTrips.length,
      approved: statusCounts['Approved'] || 0,
      pending: statusCounts['Pending'] || 0,
      rejected: statusCounts['Rejected'] || 0,
    };
  }, [filteredTrips]);
  
   const widgetData = [
    {
        title: 'Total Trips',
        value: `${dashboardStats.totalTrips}`,
        description: 'trips requested',
        icon: Plane,
        iconColor: 'text-blue-500',
        shapeColor: 'text-blue-500/10',
    },
    {
        title: 'Approved',
        value: `${dashboardStats.approved}`,
        description: 'trips approved',
        icon: CheckCircle,
        iconColor: 'text-green-500',
        shapeColor: 'text-green-500/10',
    },
    {
        title: 'Pending',
        value: `${dashboardStats.pending}`,
        description: 'trips awaiting approval',
        icon: Clock,
        iconColor: 'text-amber-500',
        shapeColor: 'text-amber-500/10',
    },
    {
        title: 'Rejected',
        value: `${dashboardStats.rejected}`,
        description: 'trips rejected',
        icon: XCircle,
        iconColor: 'text-rose-500',
        shapeColor: 'text-rose-500/10',
    },
  ];


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Business Trips</CardTitle>
            <CardDescription>
              Manage and track all business trip requests and approvals.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/trips/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Request New Trip
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

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrips.length > 0 ? (
                  filteredTrips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">
                        {trip.employeeName}
                      </TableCell>
                      <TableCell>{trip.destination}</TableCell>
                      <TableCell>
                        {format(new Date(trip.startDate), 'PPP')} - {format(new Date(trip.endDate), 'PPP')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(trip.status)}>
                          {trip.status}
                        </Badge>
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
                                <Link href={`/trips/${trip.id}/summary`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>View Summary</span>
                                </Link>
                            </DropdownMenuItem>
                             {trip.status === 'Draft' && (
                                <DropdownMenuItem asChild>
                                    <Link href={`/trips/${trip.id}/setup`}>
                                        <FileCog className="mr-2 h-4 w-4" />
                                        <span>Setup Allowance</span>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No business trips found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
