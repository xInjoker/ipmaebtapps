
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, X, Search, Wrench, CheckCircle, BadgeCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEquipment } from '@/context/EquipmentContext';
import { equipmentTypes, equipmentStatuses, type EquipmentItem } from '@/lib/equipment';
import { Skeleton } from '@/components/ui/skeleton';
import { EquipmentCard } from '@/components/equipment-card';
import { getCalibrationStatus } from '@/lib/utils';
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type DashboardStats = {
    total: number;
    normal: number;
    validCerts: number;
    expiredCerts: number;
};

export default function EquipmentPage() {
  const { branches, userHasPermission } = useAuth();
  const { equipmentList, isLoading, deleteEquipment } = useEquipment();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EquipmentItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total: 0,
    normal: 0,
    validCerts: 0,
    expiredCerts: 0,
  });

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const filteredEquipment = useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return equipmentList.filter(item => {
        const searchMatch = lowercasedTerm === '' ||
                            item.name.toLowerCase().includes(lowercasedTerm) ||
                            item.serialNumber.toLowerCase().includes(lowercasedTerm);

        const statusMatch = statusFilter === 'all' || item.status === statusFilter;
        const typeMatch = typeFilter === 'all' || item.type === typeFilter;
        const branchMatch = branchFilter === 'all' || item.owningBranchId === branchFilter;

        return searchMatch && statusMatch && typeMatch && branchMatch;
    });
  }, [equipmentList, searchTerm, statusFilter, typeFilter, branchFilter]);

  useEffect(() => {
    const total = filteredEquipment.length;
    const normal = filteredEquipment.filter(e => e.status === 'Normal').length;
    
    let validCerts = 0;
    let expiredCerts = 0;

    filteredEquipment.forEach(e => {
        if (e.calibrationDueDate) {
            const status = getCalibrationStatus(new Date(e.calibrationDueDate));
            if (status.variant === 'destructive') {
                expiredCerts++;
            } else {
                validCerts++;
            }
        }
    });
    setDashboardStats({ total, normal, validCerts, expiredCerts });
  }, [filteredEquipment]);
  
  const paginatedEquipment = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEquipment.slice(startIndex, endIndex);
  }, [filteredEquipment, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredEquipment.length / itemsPerPage);
  }, [filteredEquipment]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, branchFilter]);
  
  const widgetData = [
    {
        title: 'Total Equipment',
        value: `${dashboardStats.total}`,
        description: 'items in inventory',
        icon: Wrench,
        iconColor: 'text-blue-500',
        shapeColor: 'text-blue-500/10',
    },
    {
        title: 'Normal Status',
        value: `${dashboardStats.normal}`,
        description: 'equipment are operational',
        icon: CheckCircle,
        iconColor: 'text-green-500',
        shapeColor: 'text-green-500/10',
    },
    {
        title: 'Valid Certificates',
        value: `${dashboardStats.validCerts}`,
        description: 'equipment with valid calibration',
        icon: BadgeCheck,
        iconColor: 'text-amber-500',
        shapeColor: 'text-amber-500/10',
    },
    {
        title: 'Expired Certificates',
        value: `${dashboardStats.expiredCerts}`,
        description: 'items require calibration',
        icon: XCircle,
        iconColor: 'text-rose-500',
        shapeColor: 'text-rose-500/10',
    },
  ];

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setBranchFilter('all');
  }, []);

  const handleDeleteRequest = useCallback((item: EquipmentItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteEquipment(itemToDelete.id);
      toast({
        title: 'Equipment Deleted',
        description: `${itemToDelete.name} has been removed.`,
      });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
    <div className="space-y-6">
      <HeaderCard
        title="Equipment Management"
        description="Monitor and manage all operational equipment."
      >
        {userHasPermission('manage-equipment') && (
            <Button asChild>
              <Link href="/equipment/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Equipment
              </Link>
            </Button>
          )}
      </HeaderCard>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {widgetData.map((widget, index) => (
            <DashboardWidget key={index} {...widget} />
        ))}
      </div>

       <Card>
        <CardContent className="p-4">
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center z-10 relative">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or serial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                />
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {equipmentStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {equipmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Filter by branch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Button variant="ghost" onClick={handleClearFilters} className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" /> Clear
                </Button>
            </div>
           </div>
        </CardContent>
      </Card>
      
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {isLoading && paginatedEquipment.length === 0 ? (
           [...Array(6)].map((_, i) => (
             <Card key={i}>
               <CardHeader>
                 <Skeleton className="h-5 w-3/4" />
                 <Skeleton className="h-4 w-1/2" />
               </CardHeader>
               <CardContent>
                 <Skeleton className="aspect-video w-full rounded-md" />
                 <div className="space-y-2 mt-4">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-2/3" />
                 </div>
               </CardContent>
               <CardFooter className="flex-col items-start gap-2 border-t bg-muted/50 p-4">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-6 w-1/3" />
               </CardFooter>
             </Card>
           ))
         ) : paginatedEquipment.length > 0 ? (
          paginatedEquipment.map((item) => (
              <EquipmentCard key={item.id} item={item} branchMap={branchMap} onDelete={() => handleDeleteRequest(item)} />
          ))
       ) : (
        <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-lg font-semibold text-muted-foreground">No Equipment Found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
        </Card>
       )}
        </div>
        {totalPages > 1 && (
            <Card>
                <CardFooter className="flex items-center justify-between pt-6">
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
            </Card>
        )}
    </div>
     <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the equipment "{itemToDelete?.name}".
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
