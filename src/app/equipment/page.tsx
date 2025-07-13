
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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

type DashboardStats = {
    total: number;
    normal: number;
    validCerts: number;
    expiredCerts: number;
};

export default function EquipmentPage() {
  useSearchParams();
  const { user, isHqUser, branches, userHasPermission } = useAuth();
  const { equipmentList } = useEquipment();
  const [isClient, setIsClient] = useState(false);
  const initialFilterSet = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  
  useEffect(() => {
    if (user && !isHqUser && !initialFilterSet.current) {
      setBranchFilter(user.branchId);
      initialFilterSet.current = true;
    }
  }, [user, isHqUser]);

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(item => {
        const searchMatch = searchTerm.toLowerCase() === '' ||
                            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch = statusFilter === 'all' || item.status === statusFilter;
        const typeMatch = typeFilter === 'all' || item.type === typeFilter;
        const branchMatch = branchFilter === 'all' || item.owningBranchId === branchFilter;

        return searchMatch && statusMatch && typeMatch && branchMatch;
    });
  }, [equipmentList, searchTerm, statusFilter, typeFilter, branchFilter]);

  useEffect(() => {
    if (isClient) {
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
    }
  }, [filteredEquipment, isClient]);
  
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    if (isHqUser) {
        setBranchFilter('all');
    } else if (user) {
        setBranchFilter(user.branchId);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <svg
            className="absolute -right-16 -top-24 text-amber-500"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
            transform="translate(100 100)"
            />
        </svg>
        <svg
            className="absolute -left-20 -bottom-24 text-primary-foreground/10"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
            d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
            transform="translate(100 100)"
            />
        </svg>
        <CardHeader className="flex flex-row items-start justify-between z-10 relative">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Equipment Management</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Monitor and manage all operational equipment.
            </CardDescription>
          </div>
          {userHasPermission('manage-equipment') && (
            <Button asChild>
              <Link href="/equipment/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Equipment
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
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
                <Select value={branchFilter} onValueChange={setBranchFilter} disabled={!isHqUser}>
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

       {!isClient ? (
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
