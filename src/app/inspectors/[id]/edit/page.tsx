

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useInspectors } from '@/context/InspectorContext';
import { type Inspector, type InspectorDocument } from '@/lib/inspectors';
import { inspectorPositions, employmentStatuses } from '@/lib/inspectors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, File as FileIcon, X, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

type NewUploadableDocument = {
  file: File;
  expirationDate?: string;
};

export default function EditInspectorPage() {
  const router = useRouter();
  const params = useParams();
  const inspectorId = params.id as string;
  const { getInspectorById, updateInspector, inspectors: inspectorList } = useInspectors();
  const { toast } = useToast();
  const { branches } = useAuth();

  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [newQualifications, setNewQualifications] = useState<NewUploadableDocument[]>([]);
  const [newOtherDocs, setNewOtherDocs] = useState<NewUploadableDocument[]>([]);

  useEffect(() => {
    if (inspectorId) {
      const item = getInspectorById(inspectorId);
      if (item) {
        setInspector(item);
      } else {
        toast({
            variant: 'destructive',
            title: 'Inspector Not Found',
            description: `Could not find inspector with ID ${inspectorId}.`,
        });
        router.push('/inspectors');
      }
    }
  }, [inspectorId, getInspectorById, router, toast, inspectorList]);

  const removeExistingFile = (field: 'qualifications' | 'otherDocuments', url: string) => {
    if (!inspector) return;
    setInspector({
        ...inspector,
        [field]: (inspector[field] as InspectorDocument[]).filter(d => d.url !== url),
    });
  };
  
  const removeExistingCv = () => {
    if (!inspector) return;
    setInspector({ ...inspector, cvUrl: '' });
  };

  const removeNewFile = (setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleExistingDocDateChange = (field: 'qualifications' | 'otherDocuments', index: number, date?: Date) => {
    if (!inspector) return;
    const updatedDocs = [...inspector[field]];
    updatedDocs[index].expirationDate = date ? format(date, 'yyyy-MM-dd') : undefined;
    setInspector({ ...inspector, [field]: updatedDocs });
  };
  
  const handleNewDocDateChange = (setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, index: number, date?: Date) => {
    setter(prev => {
        const newDocs = [...prev];
        newDocs[index].expirationDate = date ? format(date, 'yyyy-MM-dd') : undefined;
        return newDocs;
    });
  };

  const handleFileChange = (setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, expirationDate: undefined }));
      setter(prev => [...prev, ...newFiles]);
    }
  };

  const handleSave = async () => {
    if (!inspector) return;
    if (!inspector.name || !inspector.email || !inspector.position || !inspector.branchId) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    const newQualsToSave: InspectorDocument[] = newQualifications.map(doc => ({
      name: doc.file.name,
      url: doc.file.name,
      expirationDate: doc.expirationDate,
    }));
    
    const newOthersToSave: InspectorDocument[] = newOtherDocs.map(doc => ({
      name: doc.file.name,
      url: doc.file.name,
      expirationDate: doc.expirationDate,
    }));

    const updatedInspectorData: Inspector = {
        ...inspector,
        cvUrl: newCvFile ? newCvFile.name : inspector.cvUrl,
        qualifications: [...inspector.qualifications, ...newQualsToSave],
        otherDocuments: [...inspector.otherDocuments, ...newOthersToSave],
    };

    await updateInspector(inspector.id, updatedInspectorData);
    
    toast({
        title: 'Inspector Updated',
        description: `Successfully updated ${inspector.name}.`,
    });

    router.push(`/inspectors/${inspector.id}`);
  };

  if (!inspector) {
    return (
        <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold">Loading Inspector...</h1>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href={`/inspectors/${inspector.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Inspector</span>
              </Link>
            </Button>
            <div className="space-y-1.5">
              <CardTitle>Edit Inspector</CardTitle>
              <CardDescription>Update the details for {inspector.name}.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={inspector.name} onChange={e => setInspector({...inspector, name: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={inspector.email} onChange={e => setInspector({...inspector, email: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={inspector.phone} onChange={e => setInspector({...inspector, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={inspector.position} onValueChange={(value: Inspector['position']) => setInspector({...inspector, position: value})}>
                    <SelectTrigger id="position"><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                        {inspectorPositions.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select value={inspector.employmentStatus} onValueChange={(value: Inspector['employmentStatus']) => setInspector(inspector ? {...inspector, employmentStatus: value} : null)}>
                    <SelectTrigger id="employmentStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {employmentStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input id="yearsOfExperience" type="number" value={inspector.yearsOfExperience || ''} onChange={e => setInspector(inspector ? {...inspector, yearsOfExperience: parseInt(e.target.value) || 0} : null)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={inspector.branchId} onValueChange={(value) => setInspector(inspector ? {...inspector, branchId: value} : null)}>
                    <SelectTrigger id="branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                        {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
                <Label>Curriculum Vitae (CV)</Label>
                {inspector.cvUrl && (
                     <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{inspector.cvUrl.split('/').pop()}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeExistingCv}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                 {newCvFile && (
                    <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{newCvFile.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewCvFile(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                 <div className="flex items-center justify-center w-full mt-2">
                    <label htmlFor="cv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload new CV</span></p>
                            <p className="text-xs text-muted-foreground">This will replace the existing CV</p>
                        </div>
                        <Input id="cv-upload" type="file" className="hidden" onChange={(e) => setNewCvFile(e.target.files ? e.target.files[0] : null)} />
                    </label>
                </div>
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Qualification Certificates</Label>
                <div className="mt-2 space-y-2">
                    {inspector.qualifications.map((doc, index) => (
                        <div key={`existing-qual-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate flex-1">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{doc.name}</span>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !doc.expirationDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {doc.expirationDate ? format(new Date(doc.expirationDate), "PPP") : <span>Expiry date (optional)</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={doc.expirationDate ? new Date(doc.expirationDate) : undefined} onSelect={(date) => handleExistingDocDateChange('qualifications', index, date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeExistingFile('qualifications', doc.url)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {newQualifications.map((doc, index) => (
                        <div key={`new-qual-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate flex-1">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{doc.file.name}</span>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !doc.expirationDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {doc.expirationDate ? format(new Date(doc.expirationDate), "PPP") : <span>Expiry date (optional)</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={doc.expirationDate ? new Date(doc.expirationDate) : undefined} onSelect={(date) => handleNewDocDateChange(setNewQualifications, index, date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNewFile(setNewQualifications, index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                 <div className="flex items-center justify-center w-full mt-4">
                    <label htmlFor="qual-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <Input id="qual-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(setNewQualifications, e)} />
                    </label>
                </div>
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Other Supporting Documents</Label>
                 <div className="mt-2 space-y-2">
                    {inspector.otherDocuments.map((doc, index) => (
                        <div key={`existing-other-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate flex-1">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{doc.name}</span>
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !doc.expirationDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {doc.expirationDate ? format(new Date(doc.expirationDate), "PPP") : <span>Expiry date (optional)</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={doc.expirationDate ? new Date(doc.expirationDate) : undefined} onSelect={(date) => handleExistingDocDateChange('otherDocuments', index, date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeExistingFile('otherDocuments', doc.url)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {newOtherDocs.map((doc, index) => (
                        <div key={`new-other-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate flex-1">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{doc.file.name}</span>
                            </div>
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !doc.expirationDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {doc.expirationDate ? format(new Date(doc.expirationDate), "PPP") : <span>Expiry date (optional)</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={doc.expirationDate ? new Date(doc.expirationDate) : undefined} onSelect={(date) => handleNewDocDateChange(setNewOtherDocs, index, date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNewFile(setNewOtherDocs, index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                 <div className="flex items-center justify-center w-full mt-4">
                    <label htmlFor="other-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        </div>
                        <Input id="other-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(setNewOtherDocs, e)} />
                    </label>
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href={`/inspectors/${inspector.id}`}>Cancel</Link>
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
