
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useInspectors } from '@/context/InspectorContext';
import { inspectorPositions, type Inspector } from '@/lib/inspectors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, File as FileIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EditInspectorPage() {
  const router = useRouter();
  const params = useParams();
  const { getInspectorById, updateInspector } = useInspectors();
  const { toast } = useToast();

  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const [newQualifications, setNewQualifications] = useState<File[]>([]);
  const [newOtherDocs, setNewOtherDocs] = useState<File[]>([]);

  useEffect(() => {
    const inspectorId = params.id as string;
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
  }, [params.id, getInspectorById, router, toast]);

  const removeExistingFile = (field: 'cvUrl' | 'qualificationUrls' | 'otherDocumentUrls', url: string) => {
    if (!inspector) return;
    if (field === 'cvUrl') {
        setInspector({ ...inspector, cvUrl: '' });
    } else {
        setInspector({
            ...inspector,
            [field]: inspector[field].filter(u => u !== url),
        });
    }
  };

  const removeNewFile = (setter: React.Dispatch<React.SetStateAction<File[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!inspector) return;
    if (!inspector.name || !inspector.email || !inspector.position) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
      });
      return;
    }

    // In a real app, you would handle uploads and get new URLs
    const updatedInspectorData: Inspector = {
        ...inspector,
        cvUrl: newCvFile ? newCvFile.name : inspector.cvUrl,
        qualificationUrls: [...inspector.qualificationUrls, ...newQualifications.map(file => file.name)],
        otherDocumentUrls: [...inspector.otherDocumentUrls, ...newOtherDocs.map(file => file.name)],
    };

    updateInspector(inspector.id, updatedInspectorData);
    
    toast({
        title: 'Inspector Updated',
        description: `Successfully updated ${inspector.name}.`,
    });

    router.push('/inspectors');
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
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/inspectors">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Inspectors</span>
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">Edit Inspector</h1>
          <p className="text-muted-foreground">Update the details for {inspector.name}.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inspector Information</CardTitle>
          <CardDescription>Modify the personal and professional details of the inspector.</CardDescription>
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
            
            <div className="space-y-2 md:col-span-2">
                <Label>Curriculum Vitae (CV)</Label>
                {inspector.cvUrl && (
                     <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{inspector.cvUrl.split('/').pop()}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingFile('cvUrl', inspector.cvUrl)}>
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
                    {inspector.qualificationUrls.map((url, index) => (
                    <div key={`existing-qual-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{url.split('/').pop()}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingFile('qualificationUrls', url)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                    {newQualifications.map((file, index) => (
                    <div key={`new-qual-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewFile(setNewQualifications, index)}>
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
                        <Input id="qual-upload" type="file" className="hidden" multiple onChange={(e) => setNewQualifications(prev => [...prev, ...Array.from(e.target.files || [])])} />
                    </label>
                </div>
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label>Other Supporting Documents</Label>
                 <div className="mt-2 space-y-2">
                    {inspector.otherDocumentUrls.map((url, index) => (
                    <div key={`existing-other-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{url.split('/').pop()}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingFile('otherDocumentUrls', url)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                    {newOtherDocs.map((file, index) => (
                    <div key={`new-other-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                        <div className="flex items-center gap-2 truncate">
                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewFile(setNewOtherDocs, index)}>
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
                        <Input id="other-upload" type="file" className="hidden" multiple onChange={(e) => setNewOtherDocs(prev => [...prev, ...Array.from(e.target.files || [])])} />
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
