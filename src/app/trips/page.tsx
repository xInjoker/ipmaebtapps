
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboardStats.totalTrips}</div>
            <p className="text-xs text-muted-foreground">trips requested</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboardStats.approved}</div>
            <p className="text-xs text-muted-foreground">trips approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboardStats.pending}</div>
            <p className="text-xs text-muted-foreground">trips awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{dashboardStats.rejected}</div>
            <p className="text-xs text-muted-foreground">trips rejected</p>
          </CardContent>
        </Card>
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
                            <DropdownMenuItem disabled>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
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
