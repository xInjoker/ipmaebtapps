'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ArrowLeft, Calendar as CalendarIcon, Save, Upload, File as FileIcon, X, Image as ImageIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useInspectors } from '@/context/InspectorContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const { branches } = useAuth();
  const { inspectors } = useInspectors();
  const { getEquipmentById, updateEquipment } = useEquipment();
  const { toast } = useToast();
  
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [newPersonnelCerts, setNewPersonnelCerts] = useState<File[]>([]);
  const [isPersonnelPopoverOpen, setIsPersonnelPopoverOpen] = useState(false);

  useEffect(() => {
    const equipmentId = params.id as string;
    if (equipmentId) {
      const item = getEquipmentById(equipmentId);
      if (item) {
        setEquipment({ 
            ...item,
            imageUrls: item.imageUrls || [],
            documentUrls: item.documentUrls || [],
            assignedPersonnelIds: item.assignedPersonnelIds || [],
            personnelCertificationUrls: item.personnelCertificationUrls || [],
        });
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

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
        acc[branch.id] = branch.name;
        return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const assignedInspectors = useMemo(() => {
    if (!equipment) return [];
    return inspectors.filter(inspector => equipment.assignedPersonnelIds.includes(inspector.id));
  }, [equipment, inspectors]);

  const unassignedInspectors = useMemo(() => {
      if (!equipment) return [];
      return inspectors.filter(inspector => !equipment.assignedPersonnelIds.includes(inspector.id));
  }, [equipment, inspectors]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const handlePersonnelCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setNewPersonnelCerts(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (url: string) => {
    if (equipment) {
      setEquipment({
        ...equipment,
        imageUrls: equipment.imageUrls.filter(u => u !== url),
      });
    }
  };

  const removeNewDocument = (index: number) => {
    setNewDocuments(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingDocument = (url: string) => {
    if (equipment) {
      setEquipment({
        ...equipment,
        documentUrls: equipment.documentUrls.filter(u => u !== url),
      });
    }
  };
  
  const removeNewPersonnelCert = (index: number) => {
    setNewPersonnelCerts(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPersonnelCert = (url: string) => {
    if (equipment) {
      setEquipment({
        ...equipment,
        personnelCertificationUrls: equipment.personnelCertificationUrls.filter(u => u !== url),
      });
    }
  };

  const handlePersonnelChange = (inspectorId: string) => {
    if (!equipment) return;
    const newAssigned = [...equipment.assignedPersonnelIds];
    const index = newAssigned.indexOf(inspectorId);
    if (index > -1) {
        newAssigned.splice(index, 1);
    } else {
        newAssigned.push(inspectorId);
    }
    setEquipment({...equipment, assignedPersonnelIds: newAssigned});
  };

  const handleSave = () => {
    if (!equipment) return;
    if (!equipment.name || !equipment.serialNumber || !equipment.type || !equipment.owningBranchId || !equipment.calibrationDueDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    const updatedEquipmentData: EquipmentItem = {
        ...equipment,
        imageUrls: [...equipment.imageUrls, ...newImages.map(file => URL.createObjectURL(file))], // In a real app, you'd upload and get URLs
        documentUrls: [...equipment.documentUrls, ...newDocuments.map(file => file.name)],
        personnelCertificationUrls: [...equipment.personnelCertificationUrls, ...newPersonnelCerts.map(file => file.name)],
    };

    updateEquipment(equipment.id, updatedEquipmentData);
    
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

  const calibrationDate = equipment.calibrationDueDate ? new Date(equipment.calibrationDueDate) : undefined;

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
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" value={equipment.serialNumber} onChange={e => setEquipment(equipment ? {...equipment, serialNumber: e.target.value} : null)} />
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
                          onSelect={(date) => setEquipment(equipment ? {...equipment, calibrationDueDate: date ? format(date, 'yyyy-MM-dd') : ''} : null)}
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
                                        <AvatarFallback className={cn(avatarColor.background, avatarColor.text)}>
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
                                                        <AvatarFallback className={cn(avatarColor.background, avatarColor.text)}>
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
                 <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {equipment.imageUrls.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="aspect-square w-full overflow-hidden rounded-md border flex items-center justify-center bg-muted">
                           <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeExistingImage(url)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{url.split('/').pop()}</p>
                      </div>
                    ))}
                    {newImages.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="aspect-square w-full overflow-hidden rounded-md border flex items-center justify-center bg-muted">
                           <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeNewImage(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-1">{file.name}</p>
                      </div>
                    ))}
                  </div>
                <div className="flex items-center justify-center w-full mt-4">
                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                        </div>
                        <Input id="image-upload" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/*" />
                    </label>
                </div>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Supporting Documents</Label>
                <div className="mt-2 space-y-2">
                    {equipment.documentUrls.map((url, index) => (
                    <div key={`existing-doc-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{url.split('/').pop()}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingDocument(url)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                    {newDocuments.map((file, index) => (
                    <div key={`new-doc-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewDocument(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
                <div className="flex items-center justify-center w-full mt-4">
                    <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX</p>
                        </div>
                        <Input id="document-upload" type="file" className="hidden" multiple onChange={handleDocumentChange} />
                    </label>
                </div>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Personnel Certifications</Label>
                 <div className="mt-2 space-y-2">
                    {equipment.personnelCertificationUrls.map((url, index) => (
                    <div key={`existing-cert-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{url.split('/').pop()}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingPersonnelCert(url)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                    {newPersonnelCerts.map((file, index) => (
                    <div key={`new-cert-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewPersonnelCert(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </div>
                <div className="flex items-center justify-center w-full mt-4">
                    <label htmlFor="cert-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
                        </div>
                        <Input id="cert-upload" type="file" className="hidden" multiple onChange={handlePersonnelCertChange} />
                    </label>
                </div>
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
