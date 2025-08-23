
'use client';

import { type Employee } from '@/lib/employees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { File as FileIcon, Upload, X } from 'lucide-react';
import { getFileNameFromDataUrl } from '@/lib/utils';
import { type NewUploadableDocument } from './employee-form';
import { DatePicker } from './ui/date-picker';
import { useCallback } from 'react';

interface Step6Props {
  employee?: Employee | null;
  newCvFile: File | null;
  setNewCvFile: (file: File | null) => void;
  newQualifications: NewUploadableDocument[];
  setNewQualifications: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>;
  newOtherDocs: NewUploadableDocument[];
  setNewOtherDocs: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>;
}

export function EmployeeFormStep6({
  employee,
  newCvFile,
  setNewCvFile,
  newQualifications,
  setNewQualifications,
  newOtherDocs,
  setNewOtherDocs,
}: Step6Props) {

  const handleFileChange = useCallback((setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({ file, expirationDate: undefined }));
      setter(prev => [...prev, ...newFiles]);
    }
  }, []);

  const removeNewFile = useCallback((setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, index: number) => {
    setter(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleNewDocDateChange = useCallback((setter: React.Dispatch<React.SetStateAction<NewUploadableDocument[]>>, index: number, date?: Date) => {
    setter(prev => {
        const newDocs = [...prev];
        newDocs[index].expirationDate = date ? date.toISOString().split('T')[0] : undefined;
        return newDocs;
    });
  }, []);

  return (
    <div className="space-y-6">
        <div className="space-y-2">
            <Label>Curriculum Vitae (CV)</Label>
            {employee?.cvUrl && <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50"><div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="text-sm truncate">{getFileNameFromDataUrl(employee.cvUrl)}</span></div></div>}
            {newCvFile && <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50"><div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" /><span className="text-sm truncate">{newCvFile.name}</span></div><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewCvFile(null)}><X className="h-4 w-4" /></Button></div>}
            <div className="flex items-center justify-center w-full mt-2"><label htmlFor="cv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload new CV</span></p></div><Input id="cv-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setNewCvFile(e.target.files ? e.target.files[0] : null)} /></label></div>
        </div>
        <div className="space-y-2">
            <Label>Qualification Certificates</Label>
            <div className="mt-2 space-y-2">
                {newQualifications.map((doc, index) => (
                  <div key={`new-qual-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                      <div className="flex items-center gap-2 truncate flex-1">
                          <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{doc.file.name}</span>
                      </div>
                      <div className="w-[240px]">
                          <DatePicker
                              value={doc.expirationDate ? new Date(doc.expirationDate) : undefined}
                              onChange={(date) => handleNewDocDateChange(setNewQualifications, index, date)}
                              placeholder="Expiry date (optional)"
                          />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNewFile(setNewQualifications, index)}>
                          <X className="h-4 w-4" />
                      </Button>
                  </div>
                ))}
            </div>
            <div className="flex items-center justify-center w-full mt-4"><label htmlFor="qual-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p></div><Input id="qual-upload" type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(setNewQualifications, e)} /></label></div>
        </div>
        <div className="space-y-2">
            <Label>Other Documents</Label>
            <div className="mt-2 space-y-2">
                {newOtherDocs.map((doc, index) => (
                  <div key={`new-other-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/50">
                      <div className="flex items-center gap-2 truncate flex-1">
                          <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{doc.file.name}</span>
                      </div>
                      <div className="w-[240px]">
                          <DatePicker
                              value={doc.expirationDate ? new Date(doc.expirationDate) : undefined}
                              onChange={(date) => handleNewDocDateChange(setNewOtherDocs, index, date)}
                              placeholder="Expiry date (optional)"
                          />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeNewFile(setNewOtherDocs, index)}>
                          <X className="h-4 w-4" />
                      </Button>
                  </div>
                ))}
            </div>
            <div className="flex items-center justify-center w-full mt-4"><label htmlFor="other-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p></div><Input id="other-upload" type="file" className="hidden" multiple onChange={(e) => handleFileChange(setNewOtherDocs, e)} /></label></div>
        </div>
    </div>
  );
}
