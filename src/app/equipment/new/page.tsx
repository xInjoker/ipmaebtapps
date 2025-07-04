
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEquipment } from '@/context/EquipmentContext';
import {
  equipmentTypes,
  equipmentStatuses,
  type EquipmentType,
  type EquipmentStatus,
} from '@/lib/equipment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function NewEquipmentPage() {
  const router = useRouter();
  const { branches } = useAuth();
  const { addEquipment } = useEquipment();
  const { toast } = useToast();

  const [newEquipment, setNewEquipment] = useState<{
    name: string;
    type: EquipmentType | '';
    owningBranchId: string;
    currentLocation: string;
    calibrationDueDate?: Date;
    status: EquipmentStatus;
  }>({
    name: '',
    type: '',
    owningBranchId: '',
    currentLocation: '',
    status: 'Normal',
  });

  const handleSave = () => {
    if (!newEquipment.name || !newEquipment.type || !newEquipment.owningBranchId || !newEquipment.calibrationDueDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    addEquipment({
      name: newEquipment.name,
      type: newEquipment.type as EquipmentType,
      owningBranchId: newEquipment.owningBranchId,
      currentLocation: newEquipment.currentLocation,
      calibrationDueDate: newEquipment.calibrationDueDate,
      status: newEquipment.status,
    });
    
    toast({
        title: 'Equipment Added',
        description: `Successfully added ${newEquipment.name}.`,
    });

    router.push('/equipment');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/equipment">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Equipment</span>
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">Add New Equipment</h1>
          <p className="text-muted-foreground">Fill in the details for the new equipment.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
          <CardDescription>Enter the information for the new piece of equipment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input id="name" value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} placeholder="e.g., GUL Wavemaker G4" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={newEquipment.type} onValueChange={(value: EquipmentType) => setNewEquipment({...newEquipment, type: value})}>
                    <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        {equipmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="owningBranch">Owning Branch</Label>
                <Select value={newEquipment.owningBranchId} onValueChange={(value) => setNewEquipment({...newEquipment, owningBranchId: value})}>
                    <SelectTrigger id="owningBranch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                        {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input id="currentLocation" value={newEquipment.currentLocation} onChange={e => setNewEquipment({...newEquipment, currentLocation: e.target.value})} placeholder="e.g., On-site Project Alpha" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="calibrationDate">Calibration Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                      <Button
                          id="calibrationDate"
                          variant={"outline"}
                          className={cn(
                              "w-full justify-start text-left font-normal",
                              !newEquipment.calibrationDueDate && "text-muted-foreground"
                          )}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newEquipment.calibrationDueDate ? format(newEquipment.calibrationDueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={newEquipment.calibrationDueDate}
                          onSelect={(date) => setNewEquipment({...newEquipment, calibrationDueDate: date})}
                          initialFocus
                      />
                  </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newEquipment.status} onValueChange={(value: EquipmentStatus) => setNewEquipment({...newEquipment, status: value})}>
                    <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {equipmentStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/equipment">Cancel</Link>
            </Button>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Equipment
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
