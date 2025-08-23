

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DropdownMenuSeparator,
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
  FileCog,
  Trash2,
} from 'lucide-react';
import { useTrips } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { type TripStatus, type TripRequest } from '@/lib/trips';
import { format } from 'date-fns';
import { DashboardWidget } from '@/components/dashboard-widget';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { HeaderCard } from '@/components/header-card';

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
  const { trips, deleteTrip } = useTrips();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TripRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTrips = useMemo(() => {
    if (!user) return [];
    // Super admins see all, others see their own requests
    if (user.roleId === 'super-admin') {
      return trips;
    }
    return trips.filter(trip => trip.employeeId === user.uid);
  }, [trips, user]);
  
  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTrips.slice(startIndex, endIndex);
  }, [filteredTrips, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredTrips.length / itemsPerPage);
  }, [filteredTrips]);

  const dashboardStats = useMemo(() => {
    if (!user) return { totalTrips: 0, approved: 0, pending: 0, rejected: 0 };
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
  }, [filteredTrips, user]);
  
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

  const handleDeleteRequest = useCallback((item: TripRequest) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteTrip(itemToDelete.id);
      toast({
        title: 'Trip Deleted',
        description: `Trip request to ${itemToDelete.destination} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };


  return (
    <>
    <div className="space-y-6">
      <HeaderCard
        title="Business Trips"
        description="Manage and track all business trip requests and approvals."
      >
        <Button asChild>
          <Link href="/trips/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Request New Trip
          </Link>
        </Button>
      </HeaderCard>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {widgetData.map((widget, index) => (
          <DashboardWidget key={index} {...widget} />
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
                {paginatedTrips.length > 0 ? (
                  paginatedTrips.map((trip) => (
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
                            {user?.roleId === 'super-admin' && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onSelect={() => handleDeleteRequest(trip)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
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
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </CardFooter>
          )}
      </Card>
    </div>
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trip request for {itemToDelete?.employeeName} to {itemToDelete?.destination}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
