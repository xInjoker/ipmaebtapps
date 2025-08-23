

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInspectors } from '@/context/InspectorContext';
import { inspectorPositions, employmentStatuses, type Inspector } from '@/lib/inspectors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, File as FileIcon, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { DatePicker } from '@/components/ui/date-picker';

type UploadableDocument = {
  file: File;
  expirationDate?: string;
};

export default function NewInspectorPage() {
  const router = useRouter();
  const { addInspector } = useInspectors();
  const { toast } = useToast();
  const { branches } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [generatedId, setGeneratedId] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [qualifications, setQualifications] = useState<UploadableDocument[]>([]);
  const [otherDocs, setOtherDocs] = useState<UploadableDocument[]>([]);
  
  const [newInspector, setNewInspector] = useState({
    name: '',
    email: '',
    phone: '',
    position: '' as Inspector['position'] | '',
    branchId: '',
    employmentStatus: '' as Inspector['employmentStatus'] | '',
    yearsOfExperience: 0,
  });
  
  useEffect(() => {
    const newId = `INSP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setGeneratedId(newId);
  }, []);

  const handleFileChange = useCallback((setter: React.Dispatch<React.SetStateAction<UploadableDocument[]>>, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, expirationDate: undefined }));
      setter(prev => [...prev, ...newFiles]);
    }
  }, []);
  
  const handleSingleFileChange = useCallback((setter: React.Dispatch<React.SetStateAction<File | null>>, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setter(e.target.files[0] || null);
    }
  }, []);

  const removeFile = useCallback((setter: React.Dispatch<React.SetStateAction<UploadableDocument[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const handleDateChange = useCallback((setter: React.Dispatch<React.SetStateAction<UploadableDocument[]>>, index: number, date?: Date) => {
    setter(prev => {
        const updated = [...prev];
        updated[index].expirationDate = date ? date.toISOString().split('T')[0] : undefined;
        return updated;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!newInspector.name || !newInspector.email || !newInspector.position || !newInspector.branchId || !newInspector.employmentStatus) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields (Name, Email, Position, Branch, Employment Status).',
      });
      return;
    }
    setIsSaving(true);
    try {
        await addInspector({
          ...newInspector,
          position: newInspector.position as Inspector['position'],
          employmentStatus: newInspector.employmentStatus as Inspector['employmentStatus'],
          avatarUrl: '', // Placeholder
          cvFile: cvFile,
          qualifications: qualifications,
          otherDocuments: otherDocs,
        });

        toast({
            title: 'Inspector Added',
            description: `Successfully added ${newInspector.name}.`,
        });

        router.push('/inspectors');
    } catch (error) {
        if (error instanceof Error) {
            toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
        } else {
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not add the new inspector.'});
        }
    } finally {
        setIsSaving(false);
    }
  }, [newInspector, cvFile, qualifications, otherDocs, addInspector, toast, router]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/inspectors">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Inspectors</span>
              </Link>
            </Button>
            <div className="space-y-1.5">
              <CardTitle>Add New Inspector</CardTitle>
              <CardDescription>Fill in the details for the new inspector.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="inspectorId">Inspector ID</Label>
                <Input id="inspectorId" value={generatedId} readOnly />
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newInspector.name} onChange={e => setNewInspector({...newInspector, name: e.target.value})} placeholder="e.g., Budi Santoso" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={newInspector.email} onChange={e => setNewInspector({...newInspector, email: e.target.value})} placeholder="e.g., budi.s@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={newInspector.phone} onChange={e => setNewInspector({...newInspector, phone: e.target.value})} placeholder="e.g., 0812-3456-7890" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={newInspector.position} onValueChange={(value: Inspector['position']) => setNewInspector({...newInspector, position: value})}>
                    <SelectTrigger id="position"><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                        {inspectorPositions.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="employmentStatus">Employment Status</Label>
                <Select value={newInspector.employmentStatus} onValueChange={(value) => setNewInspector({...newInspector, employmentStatus: value as Inspector['employmentStatus']})}>
                    <SelectTrigger id="employmentStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {employmentStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input id="yearsOfExperience" type="number" value={newInspector.yearsOfExperience || ''} onChange={e => setNewInspector({...newInspector, yearsOfExperience: parseInt(e.target.value) || 0})} placeholder="e.g., 5" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={newInspector.branchId} onValueChange={(value) => setNewInspector({...newInspector, branchId: value})}>
                    <SelectTrigger id="branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                        {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Curriculum Vitae (CV)</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="cv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX</p>
                        </div>
                        <Input id="cv-upload" type="file" className="hidden" onChange={(e) => handleSingleFileChange(setCvFile, e)} />
                    </label>
                </div>
                {cvFile && (
                    <div className="mt-2 flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{cvFile.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCvFile(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label>Qualification Certificates</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="qual-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG</p>
                        </div>
                        <Input id="qual-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(setQualifications, e)} />
                    </label>
                </div>
                 {qualifications.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {qualifications.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate flex-1">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{doc.file.name}</span>
                            </div>
                            <div className='w-[240px]'>
                                <DatePicker 
                                    value={doc.expirationDate ? new Date(doc.expirationDate) : undefined} 
                                    onChange={(date) => handleDateChange(setQualifications, index, date)}
                                    placeholder="Expiry date (optional)"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(setQualifications, index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label>Other Supporting Documents</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="other-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">Any file type</p>
                        </div>
                        <Input id="other-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(setOtherDocs, e)} />
                    </label>
                </div>
                 {otherDocs.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {otherDocs.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate flex-1">
                                <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm truncate">{doc.file.name}</span>
                            </div>
                            <div className='w-[240px]'>
                                <DatePicker 
                                    value={doc.expirationDate ? new Date(doc.expirationDate) : undefined} 
                                    onChange={(date) => handleDateChange(setOtherDocs, index, date)}
                                    placeholder="Expiry date (optional)"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFile(setOtherDocs, index)}>
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
                <Link href="/inspectors">Cancel</Link>
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Inspector
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
