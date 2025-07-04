
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEquipment } from '@/context/EquipmentContext';
import {
  equipmentTypes,
  equipmentStatuses,
  type EquipmentType,
  type EquipmentStatus,
  type EquipmentItem,
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

export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const { branches } = useAuth();
  const { getEquipmentById, updateEquipment } = useEquipment();
  const { toast } = useToast();
  
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    const equipmentId = params.id as string;
    if (equipmentId) {
      const item = getEquipmentById(equipmentId);
      if (item) {
        setEquipment({ ...item, calibrationDueDate: new Date(item.calibrationDueDate) });
      } else {
        toast({
            variant: 'destructive',
            title: 'Equipment Not Found',
            description: `Could not find equipment with ID ${equipmentId}.`,
        });
        router.push('/equipment');
      }
    }
  }, [params.id, getEquipmentById, router, toast]);

  const handleSave = () => {
    if (!equipment) return;
    if (!equipment.name || !equipment.type || !equipment.owningBranchId || !equipment.calibrationDueDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    updateEquipment(equipment.id, equipment);
    
    toast({
        title: 'Equipment Updated',
        description: `Successfully updated ${equipment.name}.`,
    });

    router.push('/equipment');
  };

  if (!equipment) {
    return (
        <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold">Loading Equipment...</h1>
        </div>
    );
  }

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
          <h1 className="font-headline text-2xl font-bold">Edit Equipment</h1>
          <p className="text-muted-foreground">Update the details for {equipment.name}.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
          <CardDescription>Modify the information for this piece of equipment.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input id="name" value={equipment.name} onChange={e => setEquipment({...equipment, name: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={equipment.type} onValueChange={(value: EquipmentType) => setEquipment(equipment ? {...equipment, type: value} : null)}>
                    <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        {equipmentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="owningBranch">Owning Branch</Label>
                <Select value={equipment.owningBranchId} onValueChange={(value) => setEquipment(equipment ? {...equipment, owningBranchId: value} : null)}>
                    <SelectTrigger id="owningBranch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                        {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input id="currentLocation" value={equipment.currentLocation} onChange={e => setEquipment(equipment ? {...equipment, currentLocation: e.target.value} : null)} />
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
                              !equipment.calibrationDueDate && "text-muted-foreground"
                          )}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {equipment.calibrationDueDate ? format(equipment.calibrationDueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={equipment.calibrationDueDate}
                          onSelect={(date) => setEquipment(equipment ? {...equipment, calibrationDueDate: date || new Date()} : null)}
                          initialFocus
                      />
                  </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={equipment.status} onValueChange={(value: EquipmentStatus) => setEquipment(equipment ? {...equipment, status: value} : null)}>
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
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
