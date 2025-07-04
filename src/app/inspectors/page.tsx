
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, X } from 'lucide-react';
import { useInspectors } from '@/context/InspectorContext';
import { inspectorPositions } from '@/lib/inspectors';
import { InspectorCard } from '@/components/inspector-card';
import { useAuth } from '@/context/AuthContext';

export default function InspectorsPage() {
  const { inspectors } = useInspectors();
  const { branches } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const filteredInspectors = useMemo(() => {
    return inspectors.filter(inspector => {
      const searchMatch = searchTerm.toLowerCase() === '' ||
                          inspector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inspector.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const positionMatch = positionFilter === 'all' || inspector.position === positionFilter;
      const branchMatch = branchFilter === 'all' || inspector.branchId === branchFilter;

      return searchMatch && positionMatch && branchMatch;
    });
  }, [inspectors, searchTerm, positionFilter, branchFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setPositionFilter('all');
    setBranchFilter('all');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Inspector Database</CardTitle>
            <CardDescription>
              Manage all inspectors and their qualifications.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/inspectors/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Inspector
            </Link>
          </Button>
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
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {inspectorPositions.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
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

      {filteredInspectors.length > 0 ? (
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
