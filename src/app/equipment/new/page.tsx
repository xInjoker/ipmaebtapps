

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { ArrowLeft, Calendar as CalendarIcon, Loader2, Save, Upload, File as FileIcon, X, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useInspectors } from '@/context/InspectorContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { fileToBase64 } from '@/lib/utils';


export default function NewEquipmentPage() {
  const router = useRouter();
  const { branches } = useAuth();
  const { inspectors } = useInspectors();
  const { addEquipment } = useEquipment();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [images, setImages] = useState<{file: File, url: string}[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isPersonnelPopoverOpen, setIsPersonnelPopoverOpen] = useState(false);

  const [newEquipment, setNewEquipment] = useState<{
    name: string;
    serialNumber: string;
    type: EquipmentType | '';
    owningBranchId: string;
    currentLocation: string;
    calibrationDueDate: string;
    status: EquipmentStatus;
    assignedPersonnelIds: string[];
  }>({
    name: '',
    serialNumber: '',
    type: '',
    owningBranchId: '',
    currentLocation: '',
    calibrationDueDate: '',
    status: 'Normal',
    assignedPersonnelIds: [],
  });
  
  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
        acc[branch.id] = branch.name;
        return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const assignedInspectors = useMemo(() => {
      return inspectors.filter(inspector => newEquipment.assignedPersonnelIds.includes(inspector.id));
  }, [newEquipment, inspectors]);

  const unassignedInspectors = useMemo(() => {
      return inspectors.filter(inspector => !newEquipment.assignedPersonnelIds.includes(inspector.id));
  }, [newEquipment, inspectors]);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const filePromises = files.map(async file => ({
            file,
            url: await fileToBase64(file) as string,
        }));
        const newFiles = await Promise.all(filePromises);
        setImages(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setter(prev => [...prev, ...files]);
    }
  }, []);


  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const removeDocument = useCallback((index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handlePersonnelChange = useCallback((inspectorId: string) => {
    setNewEquipment(prev => {
        const newAssigned = [...prev.assignedPersonnelIds];
        const index = newAssigned.indexOf(inspectorId);
        if (index > -1) {
            newAssigned.splice(index, 1);
        } else {
            newAssigned.push(inspectorId);
        }
        return {...prev, assignedPersonnelIds: newAssigned};
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!newEquipment.name || !newEquipment.serialNumber || !newEquipment.type || !newEquipment.owningBranchId || !newEquipment.calibrationDueDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }
    setIsSaving(true);
    try {
        await addEquipment({
          name: newEquipment.name,
          serialNumber: newEquipment.serialNumber,
          type: newEquipment.type as EquipmentType,
          owningBranchId: newEquipment.owningBranchId,
          currentLocation: newEquipment.currentLocation,
          calibrationDueDate: newEquipment.calibrationDueDate,
          status: newEquipment.status,
          assignedPersonnelIds: newEquipment.assignedPersonnelIds,
          images: images.map(img => img.file),
          documents: documents,
        });
        
        toast({
            title: 'Equipment Added',
            description: `Successfully added ${newEquipment.name}.`,
        });

        setTimeout(() => router.push('/equipment'), 500);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not add the new equipment.' });
    } finally {
        setIsSaving(false);
    }

  }, [newEquipment, images, documents, addEquipment, toast, router]);

  const calibrationDate = newEquipment.calibrationDueDate ? new Date(newEquipment.calibrationDueDate) : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/equipment">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Equipment</span>
              </Link>
            </Button>
            <div className="space-y-1.5">
              <CardTitle>Add New Equipment</CardTitle>
              <CardDescription>Fill in the details for the new equipment.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="name">Equipment Name</Label>
                <Input id="name" value={newEquipment.name} onChange={e => setNewEquipment({...newEquipment, name: e.target.value})} placeholder="e.g., GUL Wavemaker G4" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" value={newEquipment.serialNumber} onChange={e => setNewEquipment({...newEquipment, serialNumber: e.target.value})} placeholder="e.g., G4-2021-001" />
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
                              !calibrationDate && "text-muted-foreground"
                          )}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {calibrationDate ? format(calibrationDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={calibrationDate}
                          onSelect={(date) => setNewEquipment({...newEquipment, calibrationDueDate: date ? format(date, 'yyyy-MM-dd') : ''})}
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
            <div className="space-y-2 md:col-span-2">
                <Label>Authorized Personnel</Label>
                <div className="space-y-2">
                    {assignedInspectors.map(inspector => {
                        const avatarColor = getAvatarColor(inspector.name);
                        return (
                            <Card key={inspector.id} className="flex items-center justify-between p-2">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        {inspector.avatarUrl ? <AvatarImage src={inspector.avatarUrl} alt={inspector.name} /> : null}
                                        <AvatarFallback
                                            style={{
                                                backgroundColor: avatarColor.background,
                                                color: avatarColor.color,
                                            }}
                                        >
                                            {getInitials(inspector.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{inspector.name}</p>
                                        <p className="text-sm text-muted-foreground">{branchMap[inspector.branchId] || 'Unknown Branch'}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handlePersonnelChange(inspector.id)}>
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">Remove {inspector.name}</span>
                                </Button>
                            </Card>
                        )
                    })}
                </div>
                <Popover open={isPersonnelPopoverOpen} onOpenChange={setIsPersonnelPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-2">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Personnel
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search personnel..." />
                            <CommandList>
                                <CommandEmpty>No personnel found.</CommandEmpty>
                                <CommandGroup>
                                    {unassignedInspectors.map(inspector => {
                                        const avatarColor = getAvatarColor(inspector.name);
                                        return (
                                            <CommandItem
                                                key={inspector.id}
                                                onSelect={() => {
                                                    handlePersonnelChange(inspector.id);
                                                    setIsPersonnelPopoverOpen(false);
                                                }}
                                                className="flex items-center justify-between cursor-pointer"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        {inspector.avatarUrl ? <AvatarImage src={inspector.avatarUrl} alt={inspector.name} /> : null}
                                                        <AvatarFallback
                                                            style={{
                                                                backgroundColor: avatarColor.background,
                                                                color: avatarColor.color,
                                                            }}
                                                        >
                                                            {getInitials(inspector.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{inspector.name}</p>
                                                        <p className="text-sm text-muted-foreground">{branchMap[inspector.branchId] || 'Unknown Branch'}</p>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Equipment Images</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                        </div>
                        <Input id="image-upload" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/*" />
                    </label>
                </div>
                 {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map(({ file, url }, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square w-full overflow-hidden rounded-md border flex items-center justify-center bg-muted">
                           <Image src={url} alt={file.name} width={100} height={100} className="h-full w-full object-cover"/>
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeImage(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Supporting Documents</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX</p>
                        </div>
                        <Input id="document-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(e, setDocuments)} />
                    </label>
                </div>
                 {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDocument(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/equipment">Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Equipment
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
