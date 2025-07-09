
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, X, Search, Wrench, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEquipment } from '@/context/EquipmentContext';
import { equipmentTypes, equipmentStatuses } from '@/lib/equipment';
import { Skeleton } from '@/components/ui/skeleton';
import { EquipmentCard } from '@/components/equipment-card';

export default function EquipmentPage() {
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

  const dashboardStats = useMemo(() => {
    const total = equipmentList.length;
    const normal = equipmentList.filter(e => e.status === 'Normal').length;
    const inMaintenance = equipmentList.filter(e => e.status === 'In Maintenance').length;
    const broken = equipmentList.filter(e => e.status === 'Broken').length;
    return { total, normal, inMaintenance, broken };
  }, [equipmentList]);

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
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Equipment Management</CardTitle>
            <CardDescription>
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
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total}</div>
            <p className="text-xs text-muted-foreground">items in inventory</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.normal}</div>
            <p className="text-xs text-muted-foreground">equipment are operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.inMaintenance}</div>
            <p className="text-xs text-muted-foreground">items under maintenance</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Broken Status</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.broken}</div>
            <p className="text-xs text-muted-foreground">items need repair</p>
          </CardContent>
        </Card>
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
