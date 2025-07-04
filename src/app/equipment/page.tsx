
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { format, isPast, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type EquipmentStatus = 'Normal' | 'Broken' | 'In Maintenance';
type EquipmentType = 'LRUT' | 'PEC' | 'MFL' | 'UT' | 'RT' | 'Drone' | 'Other';

type EquipmentItem = {
  id: string;
  name: string;
  type: EquipmentType;
  owningBranchId: string;
  currentLocation: string;
  calibrationDueDate: Date;
  status: EquipmentStatus;
};

const initialEquipment: EquipmentItem[] = [
  { id: 'EQ-001', name: 'GUL Wavemaker G4', type: 'LRUT', owningBranchId: 'jakarta', currentLocation: 'On-site Project Alpha', calibrationDueDate: new Date('2025-01-15'), status: 'Normal' },
  { id: 'EQ-002', name: 'Lyft PEC System', type: 'PEC', owningBranchId: 'surabaya', currentLocation: 'Cabang Surabaya', calibrationDueDate: new Date('2024-08-20'), status: 'Normal' },
  { id: 'EQ-003', name: 'MFL 2000 Pipe Scanner', type: 'MFL', owningBranchId: 'jakarta', currentLocation: 'Cabang Jakarta', calibrationDueDate: new Date('2024-07-30'), status: 'In Maintenance' },
  { id: 'EQ-004', name: 'Olympus EPOCH 650', type: 'UT', owningBranchId: 'pekanbaru', currentLocation: 'On-site Project Gamma', calibrationDueDate: new Date(), status: 'Normal' },
  { id: 'EQ-005', name: 'AGFA D7 X-ray Film', type: 'RT', owningBranchId: 'balikpapan', currentLocation: 'Cabang Balikpapan', calibrationDueDate: new Date('2025-03-22'), status: 'Normal' },
  { id: 'EQ-006', name: 'DJI Matrice 300 RTK', type: 'Drone', owningBranchId: 'hq', currentLocation: 'On loan to Cabang Jakarta', calibrationDueDate: new Date('2024-11-10'), status: 'Normal' },
  { id: 'EQ-007', name: 'In-house UT probe', type: 'UT', owningBranchId: 'samarinda', currentLocation: 'Cabang Samarinda', calibrationDueDate: new Date('2024-06-25'), status: 'Broken' },
];

const equipmentTypes: EquipmentType[] = ['LRUT', 'PEC', 'MFL', 'UT', 'RT', 'Drone', 'Other'];
const equipmentStatuses: EquipmentStatus[] = ['Normal', 'Broken', 'In Maintenance'];

export default function EquipmentPage() {
  const { branches } = useAuth();
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(initialEquipment);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentItem, setCurrentItem] = useState<EquipmentItem | null>(null);

  const [newEquipment, setNewEquipment] = useState<{
    id: string;
    name: string;
    type: EquipmentType | '';
    owningBranchId: string;
    currentLocation: string;
    calibrationDueDate?: Date;
    status: EquipmentStatus;
  }>({
    id: '',
    name: '',
    type: '',
    owningBranchId: '',
    currentLocation: '',
    status: 'Normal',
  });
  
  const branchMap = useMemo(() => {
      return branches.reduce((acc, branch) => {
          acc[branch.id] = branch.name;
          return acc;
      }, {} as Record<string, string>);
  }, [branches]);


  const getCalibrationStatus = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cleanDueDate = new Date(dueDate);
    cleanDueDate.setHours(0, 0, 0, 0);

    if (isPast(cleanDueDate)) {
      return { text: 'Expired', variant: 'destructive' as const };
    }
    const daysLeft = differenceInDays(cleanDueDate, today);
    if (daysLeft <= 30) {
      return { text: `Expires in ${daysLeft} days`, variant: 'yellow' as const };
    }
    return { text: 'Valid', variant: 'green' as const };
  };

  const handleOpenDialog = (mode: 'add' | 'edit', item?: EquipmentItem) => {
      setDialogMode(mode);
      if(mode === 'edit' && item) {
          setCurrentItem(item);
          setNewEquipment({
              ...item,
              type: item.type || '',
          });
      } else {
          setCurrentItem(null);
          setNewEquipment({
              id: '', name: '', type: '', owningBranchId: '', currentLocation: '', status: 'Normal',
          });
      }
      setIsDialogOpen(true);
  }

  const handleSaveEquipment = () => {
    if (!newEquipment.name || !newEquipment.type || !newEquipment.owningBranchId || !newEquipment.calibrationDueDate) {
        // Simple validation
        return;
    }
    
    if (dialogMode === 'add') {
        const newId = `EQ-${String(equipmentList.length + 1).padStart(3, '0')}`;
        const finalNewItem: EquipmentItem = {
            id: newId,
            name: newEquipment.name,
            type: newEquipment.type as EquipmentType,
            owningBranchId: newEquipment.owningBranchId,
            currentLocation: newEquipment.currentLocation,
            calibrationDueDate: newEquipment.calibrationDueDate,
            status: newEquipment.status
        };
        setEquipmentList([...equipmentList, finalNewItem]);
    } else if (currentItem) {
        const updatedItem: EquipmentItem = {
            ...currentItem,
            ...newEquipment,
            type: newEquipment.type as EquipmentType,
            calibrationDueDate: newEquipment.calibrationDueDate as Date,
        };
        setEquipmentList(equipmentList.map(item => item.id === currentItem.id ? updatedItem : item));
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Equipment Management</CardTitle>
            <CardDescription>
              Monitor and manage all operational equipment.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog('add')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {equipmentList.map((item) => {
                const calibration = getCalibrationStatus(new Date(item.calibrationDueDate));
                return (
                  <Card key={item.id} className="flex flex-col">
                    <CardHeader className="flex-row items-start justify-between">
                      <div>
                          <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
                          <CardDescription>{item.type}</CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleOpenDialog('edit', item)}>
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                      <div className="aspect-video w-full overflow-hidden rounded-md border">
                          <Image
                              src={`https://placehold.co/400x225.png`}
                              alt={item.name}
                              width={400}
                              height={225}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                              data-ai-hint={`${item.type.toLowerCase()} equipment`}
                          />
                      </div>
                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={item.status === 'Normal' ? 'green' : item.status === 'Broken' ? 'destructive' : 'yellow'}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Owning Branch</span>
                            <span className="font-medium text-right">{branchMap[item.owningBranchId] || item.owningBranchId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Location</span>
                            <span className="font-medium text-right">{item.currentLocation}</span>
                          </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2 border-t bg-muted/50 p-4">
                        <div className="flex w-full justify-between text-sm">
                            <span className="text-muted-foreground">Calibration Due</span>
                            <span className="font-medium">{format(item.calibrationDueDate, 'PPP')}</span>
                        </div>
                        <div className="flex w-full items-center justify-between">
                          <span className="text-muted-foreground text-sm">Validity</span>
                          <Badge variant={calibration.variant} className="text-xs">
                              {calibration.text}
                          </Badge>
                        </div>
                    </CardFooter>
                  </Card>
                );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
              <DialogHeader>
                  <DialogTitle>{dialogMode === 'add' ? 'Add New Equipment' : 'Edit Equipment'}</DialogTitle>
                  <DialogDescription>
                      Fill in the details for the equipment.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="name">Equipment Name</Label>
                      <Input id="name" value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} />
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
                      <Input id="currentLocation" value={newEquipment.currentLocation} onChange={e => setNewEquipment({...newEquipment, currentLocation: e.target.value})} />
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
              </div>
              <DialogFooter>
                  <Button onClick={handleSaveEquipment}>Save Equipment</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
