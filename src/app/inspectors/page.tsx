
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
  
  const widgetData = [
    {
        title: 'Total Inspectors',
        value: `${dashboardStats.total}`,
        description: 'inspectors in the database',
        icon: Users2,
        iconColor: 'text-blue-500',
        shapeColor: 'text-blue-500/10',
    },
    {
        title: 'Total Valid Certificates',
        value: `${dashboardStats.validCerts}`,
        description: 'certificates are currently valid',
        icon: BadgeCheck,
        iconColor: 'text-green-500',
        shapeColor: 'text-green-500/10',
    },
    {
        title: 'Expiring Certificates',
        value: `${dashboardStats.expiringSoon}`,
        description: 'inspectors with certs expiring soon',
        icon: Clock,
        iconColor: 'text-amber-500',
        shapeColor: 'text-amber-500/10',
    },
    {
        title: 'Expired Certificates',
        value: `${dashboardStats.expired}`,
        description: 'inspectors with expired certs',
        icon: XCircle,
        iconColor: 'text-rose-500',
        shapeColor: 'text-rose-500/10',
    },
  ];


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
