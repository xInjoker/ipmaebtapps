
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, X, Search, Wrench, CheckCircle, BadgeCheck, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEquipment } from '@/context/EquipmentContext';
import { equipmentTypes, equipmentStatuses } from '@/lib/equipment';
import { Skeleton } from '@/components/ui/skeleton';
import { EquipmentCard } from '@/components/equipment-card';
import { getCalibrationStatus } from '@/lib/utils';
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';

type DashboardStats = {
    total: number;
    normal: number;
    validCerts: number;
    expiredCerts: number;
};

export default function EquipmentPage() {
  const { branches, userHasPermission } = useAuth();
  const { equipmentList, isLoading } = useEquipment();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  
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

  return (
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
      
       {isLoading && equipmentList.length === 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {[...Array(6)].map((_, i) => (
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
           ))}
         </div>
       ) : filteredEquipment.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
              <EquipmentCard key={item.id} item={item} branchMap={branchMap} />
          ))}
        </div>
       ) : (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <h3 className="text-lg font-semibold text-muted-foreground">No Equipment Found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </CardContent>
        </Card>
       )}
    </div>
  );
}
