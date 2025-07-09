
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, X, Users2, BadgeCheck, Clock, XCircle } from 'lucide-react';
import { useInspectors } from '@/context/InspectorContext';
import { InspectorCard } from '@/components/inspector-card';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { getDocumentStatus, formatQualificationName } from '@/lib/utils';

export default function InspectorsPage() {
  const { inspectors } = useInspectors();
  const { branches, userHasPermission } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const allQualifications = useMemo(() => {
    const qualifications = new Set<string>();
    inspectors.forEach(inspector => {
        inspector.qualifications.forEach(q => {
            qualifications.add(q.name);
        });
    });
    return Array.from(qualifications).sort();
  }, [inspectors]);

  const filteredInspectors = useMemo(() => {
    return inspectors.filter(inspector => {
      const searchMatch = searchTerm.toLowerCase() === '' ||
                          inspector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inspector.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const qualificationMatch = qualificationFilter === 'all' || inspector.qualifications.some(q => q.name === qualificationFilter);
      const branchMatch = branchFilter === 'all' || inspector.branchId === branchFilter;

      const statusMatch = statusFilter === 'all' || inspector.qualifications.some(q => {
          const status = getDocumentStatus(q.expirationDate);
          if (statusFilter === 'valid') return status.variant === 'green';
          if (statusFilter === 'expiring') return status.variant === 'yellow';
          if (statusFilter === 'expired') return status.variant === 'destructive';
          return false;
      });

      return searchMatch && qualificationMatch && branchMatch && statusMatch;
    });
  }, [inspectors, searchTerm, qualificationFilter, branchFilter, statusFilter]);

  const dashboardStats = useMemo(() => {
    const total = filteredInspectors.length;
    let validCerts = 0;
    const inspectorHasExpiringCert = new Set<string>();
    const inspectorHasExpiredCert = new Set<string>();

    filteredInspectors.forEach(inspector => {
        const allDocs = [...inspector.qualifications, ...inspector.otherDocuments];
        let hasExpiring = false;
        let hasExpired = false;

        allDocs.forEach(doc => {
            const status = getDocumentStatus(doc.expirationDate);
            if (status.variant !== 'destructive') {
                validCerts++;
            }

            if (status.variant === 'destructive') {
                hasExpired = true;
            } else if (status.variant === 'yellow') {
                hasExpiring = true;
            }
        });

        if (hasExpired) {
            inspectorHasExpiredCert.add(inspector.id);
        } else if (hasExpiring) {
            inspectorHasExpiringCert.add(inspector.id);
        }
    });

    return { 
        total, 
        validCerts,
        expiringSoon: inspectorHasExpiringCert.size,
        expired: inspectorHasExpiredCert.size
    };
  }, [filteredInspectors]);


  const handleClearFilters = () => {
    setSearchTerm('');
    setQualificationFilter('all');
    setBranchFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Inspector Database</CardTitle>
            <CardDescription>
              Manage all inspectors and their qualifications.
            </CardDescription>
          </div>
          {userHasPermission('manage-inspectors') && (
            <Button asChild>
              <Link href="/inspectors/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Inspector
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={qualificationFilter} onValueChange={setQualificationFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Qualifications</SelectItem>
                  {allQualifications.map(qual => <SelectItem key={qual} value={qual}>{formatQualificationName(qual)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
            <CardTitle className="text-sm font-medium">Total Inspectors</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.total}</div>
            <p className="text-xs text-muted-foreground">inspectors in the database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Valid Certificates</CardTitle>
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.validCerts}</div>
            <p className="text-xs text-muted-foreground">certificates are currently valid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Certificates</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">inspectors with certs expiring soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Certificates</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.expired}</div>
            <p className="text-xs text-muted-foreground">inspectors with expired certs</p>
          </CardContent>
        </Card>
      </div>

      {!isClient ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-40" /></div>
                  <div className="flex items-center gap-2"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-32" /></div>
                  <div className="flex items-center gap-2"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-24" /></div>
                  <div className="flex items-center gap-2"> <Skeleton className="h-4 w-4" /> <Skeleton className="h-4 w-36" /></div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
          ))}
        </div>
      ) : filteredInspectors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInspectors.map((inspector) => (
            <InspectorCard key={inspector.id} inspector={inspector} branchMap={branchMap} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground col-span-full py-12">
          <h3 className="text-lg font-semibold">No Inspectors Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
