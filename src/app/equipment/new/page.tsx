
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
import { ArrowLeft, Calendar as CalendarIcon, Save, Upload, File as FileIcon, X, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

export default function NewEquipmentPage() {
  const router = useRouter();
  const { branches, users } = useAuth();
  const { addEquipment } = useEquipment();
  const { toast } = useToast();

  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [personnelCertifications, setPersonnelCertifications] = useState<File[]>([]);

  const [newEquipment, setNewEquipment] = useState<{
    name: string;
    serialNumber: string;
    type: EquipmentType | '';
    owningBranchId: string;
    currentLocation: string;
    calibrationDueDate: string;
    status: EquipmentStatus;
    assignedPersonnelIds: number[];
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
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const handlePersonnelCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setPersonnelCertifications(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };


  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removePersonnelCert = (index: number) => {
    setPersonnelCertifications(prev => prev.filter((_, i) => i !== index));
  };
  
  const handlePersonnelChange = (userId: number) => {
    setNewEquipment(prev => {
        const newAssigned = [...prev.assignedPersonnelIds];
        const index = newAssigned.indexOf(userId);
        if (index > -1) {
            newAssigned.splice(index, 1);
        } else {
            newAssigned.push(userId);
        }
        return {...prev, assignedPersonnelIds: newAssigned};
    });
  };


  const handleSave = () => {
    if (!newEquipment.name || !newEquipment.serialNumber || !newEquipment.type || !newEquipment.owningBranchId || !newEquipment.calibrationDueDate) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    addEquipment({
      name: newEquipment.name,
      serialNumber: newEquipment.serialNumber,
      type: newEquipment.type as EquipmentType,
      owningBranchId: newEquipment.owningBranchId,
      currentLocation: newEquipment.currentLocation,
      calibrationDueDate: newEquipment.calibrationDueDate,
      status: newEquipment.status,
      imageUrls: images.map(file => URL.createObjectURL(file)), // In a real app, you'd upload and get URLs
      documentUrls: documents.map(file => file.name),
      assignedPersonnelIds: newEquipment.assignedPersonnelIds,
      personnelCertificationUrls: personnelCertifications.map(file => file.name),
    });
    
    toast({
        title: 'Equipment Added',
        description: `Successfully added ${newEquipment.name}.`,
    });

    router.push('/equipment');
  };

  const calibrationDate = newEquipment.calibrationDueDate ? new Date(newEquipment.calibrationDueDate) : undefined;

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
                <Card>
                    <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`user-${user.id}`}
                                    checked={newEquipment.assignedPersonnelIds.includes(user.id)}
                                    onCheckedChange={() => handlePersonnelChange(user.id)}
                                />
                                <Label htmlFor={`user-${user.id}`} className="font-normal cursor-pointer">
                                    {user.name}
                                </Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
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
                    {images.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square w-full overflow-hidden rounded-md border flex items-center justify-center bg-muted">
                           <ImageIcon className="h-10 w-10 text-muted-foreground" />
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
                        <Input id="document-upload" type="file" className="hidden" multiple onChange={handleDocumentChange} />
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
            <div className="space-y-2 md:col-span-2">
                <Label>Personnel Certifications</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="cert-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
                        </div>
                        <Input id="cert-upload" type="file" className="hidden" multiple onChange={handlePersonnelCertChange} />
                    </label>
                </div>
                 {personnelCertifications.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {personnelCertifications.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePersonnelCert(index)}>
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
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Equipment
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
