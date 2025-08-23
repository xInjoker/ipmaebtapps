

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useEquipment } from '@/context/EquipmentContext';
import {
  equipmentTypes,
  equipmentStatuses,
  type EquipmentType,
  type EquipmentStatus,
  type EquipmentItem,
  type EquipmentDocument,
} from '@/lib/equipment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Loader2, Save, Upload, File as FileIcon, X, PlusCircle, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { cn, getAvatarColor, getInitials, fileToBase64 } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useInspectors } from '@/context/InspectorContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DatePicker } from '@/components/ui/date-picker';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ImageItem = {
    id: string;
    url: string;
    file?: File;
    type: 'existing' | 'new';
};

const SortableImage = ({ image, onRemove }: { image: ImageItem; onRemove: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group aspect-square">
            <div className="aspect-square w-full overflow-hidden rounded-md border bg-muted">
                <Image
                    src={image.url}
                    alt={`Equipment image`}
                    width={100}
                    height={100}
                    className="h-full w-full object-cover"
                    data-ai-hint="equipment"
                />
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="destructive" size="icon" className="h-8 w-8 absolute top-1 right-1 z-10" onClick={onRemove}>
                    <X className="h-4 w-4" />
                </Button>
                <div {...attributes} {...listeners} className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-6 w-6 text-white" />
                </div>
            </div>
            {image.file && <p className="text-xs text-muted-foreground truncate mt-1">{image.file.name}</p>}
        </div>
    );
};


export default function EditEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  const { branches } = useAuth();
  const { inspectors } = useInspectors();
  const { getEquipmentById, updateEquipment, equipmentList } = useEquipment();
  const { toast } = useToast();
  
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [isPersonnelPopoverOpen, setIsPersonnelPopoverOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const sensors = useSensors(useSensor(PointerSensor));


  useEffect(() => {
    if (equipmentId) {
      const item = getEquipmentById(equipmentId);
      if (item) {
        setEquipment({ 
            ...item,
            imageUrls: item.imageUrls || [],
            documentUrls: item.documentUrls || [],
            assignedPersonnelIds: item.assignedPersonnelIds || [],
        });
        const existingImages: ImageItem[] = (item.imageUrls || []).map((url, index) => ({
            id: `existing-${url}-${index}`,
            url,
            type: 'existing',
        }));
        setImages(existingImages);
      } else {
        toast({
            variant: 'destructive',
            title: 'Equipment Not Found',
            description: `Could not find equipment with ID ${equipmentId}.`,
        });
        router.push('/equipment');
      }
    }
  }, [equipmentId, getEquipmentById, router, toast, equipmentList]);

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
        acc[branch.id] = branch.name;
        return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const assignedInspectors = useMemo(() => {
    if (!equipment) return [];
    return inspectors.filter(inspector => (equipment.assignedPersonnelIds || []).includes(inspector.id));
  }, [equipment, inspectors]);

  const unassignedInspectors = useMemo(() => {
      if (!equipment) return [];
      return inspectors.filter(inspector => !(equipment.assignedPersonnelIds || []).includes(inspector.id));
  }, [equipment, inspectors]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File[]>>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        setter(prev => [...prev, ...files]);
    }
  };
  
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        const filePromises = files.map(async file => ({
            id: `new-${file.name}-${Date.now()}`,
            url: await fileToBase64(file) as string,
            file,
            type: 'new' as const,
        }));
        const newImageItems = await Promise.all(filePromises);
        setImages(prev => [...prev, ...newImageItems]);
    }
  }, []);

  const removeImage = useCallback((idToRemove: string) => {
    setImages(prev => prev.filter(img => img.id !== idToRemove));
  }, []);

  const removeNewDocument = useCallback((index: number) => {
    setNewDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const removeExistingDocument = useCallback((urlToRemove: string) => {
    if (equipment && equipment.documentUrls) {
      setEquipment({
        ...equipment,
        documentUrls: equipment.documentUrls.filter(doc => doc.url !== urlToRemove),
      });
    }
  }, [equipment]);
  
  const handlePersonnelChange = useCallback((inspectorId: string) => {
    if (!equipment) return;
    const currentAssigned = equipment.assignedPersonnelIds || [];
    const newAssigned = [...currentAssigned];
    const index = newAssigned.indexOf(inspectorId);
    if (index > -1) {
        newAssigned.splice(index, 1);
    } else {
        newAssigned.push(inspectorId);
    }
    setEquipment({...equipment, assignedPersonnelIds: newAssigned});
  }, [equipment]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over!.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!equipment) return;
    if (!equipment.name || !equipment.serialNumber || !equipment.type || !equipment.owningBranchId || !equipment.calibrationDueDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }
    setIsSaving(true);
    try {
        const existingImageUrls = images.filter(img => img.type === 'existing').map(img => img.url);
        const newImageFiles = images.filter(img => img.type === 'new').map(img => img.file!);

        const updatedData = { ...equipment, imageUrls: existingImageUrls };

        await updateEquipment(equipment.id, updatedData, {
            newImages: newImageFiles,
            newDocuments: newDocuments,
        });
        
        toast({
            title: 'Equipment Updated',
            description: `Successfully updated ${equipment.name}.`,
        });

        router.push(`/equipment/${equipment.id}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        } else {
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save equipment changes.'});
        }
    } finally {
        setIsSaving(false);
    }
  }, [equipment, images, newDocuments, router, toast, updateEquipment]);

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
              <CardTitle>Edit Equipment</CardTitle>
              <CardDescription>Update the details for {equipment.name}.</CardDescription>
            </div>
          </div>
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
                <DatePicker 
                    value={calibrationDate} 
                    onChange={(date) => setEquipment(equipment ? {...equipment, calibrationDueDate: date ? format(date, 'yyyy-MM-dd') : ''} : null)} 
                />
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
                <Label>Authorized Personnel (Optional)</Label>
                <div className="space-y-2">
                    {assignedInspectors.length === 0 && (
                        <div className="text-sm text-center text-muted-foreground p-4 border rounded-md">
                            No personnel assigned. This is a general tool.
                        </div>
                    )}
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
                            Add/Remove Personnel
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((image) => (
                                <SortableImage key={image.id} image={image} onRemove={() => removeImage(image.id)} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
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
                    {(equipment.documentUrls || []).map((doc, index) => (
                    doc && <div key={`existing-doc-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{doc.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingDocument(doc.url)}>
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
                        <Input id="document-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(e, setNewDocuments)} />
                    </label>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/equipment">Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
