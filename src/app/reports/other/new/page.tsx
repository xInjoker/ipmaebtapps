

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Calendar as CalendarIcon, Save, Upload, File as FileIcon, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DateRange } from 'react-day-picker';
import { Separator } from '@/components/ui/separator';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReports } from '@/context/ReportContext';
import type { ReportItem, OtherReportDetails } from '@/lib/reports';

export default function NewInspectionReportPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { projects } = useProjects();
    const { user, isHqUser, roles } = useAuth();
    const { addReport } = useReports();
    
    const [documents, setDocuments] = useState<File[]>([]);
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    
    const [formData, setFormData] = useState({
        project: '',
        reportNumber: '',
        equipment: '',
        inspector: '',
        vendor: '',
        subVendor: '',
        locationCity: '',
        locationProvince: '',
        regionType: 'Local' as 'Local' | 'Overseas',
        locationType: 'Onshore' as 'Onshore' | 'Offshore',
        result: 'Accept' as 'Accept' | 'Reject',
    });

    const visibleProjects = useMemo(() => {
        if (isHqUser) return projects;
        if (!user) return [];
        return projects.filter(p => p.branchId === user.branchId);
    }, [projects, user, isHqUser]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    }, []);

    const removeDocument = useCallback((index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    }, []);
    
    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleSave = useCallback(async () => {
        if (!formData.reportNumber || !date?.from || !date?.to || !user) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Report number and inspection dates are required.',
            });
            return;
        }

        const reportDetails: Omit<OtherReportDetails, 'documentUrls'> & { documents: File[] } = {
            jobType: 'Other',
            project: formData.project,
            client: projects.find(p => p.name === formData.project)?.client || 'Internal',
            reportNumber: formData.reportNumber,
            startDate: format(date.from, 'yyyy-MM-dd'),
            endDate: format(date.to, 'yyyy-MM-dd'),
            equipment: formData.equipment,
            inspector: formData.inspector,
            vendor: formData.vendor,
            subVendor: formData.subVendor,
            locationCity: formData.locationCity,
            locationProvince: formData.locationProvince,
            regionType: formData.regionType,
            locationType: formData.locationType,
            result: formData.result,
            documents: documents,
        };

        const newReport: Omit<ReportItem, 'id' | 'details'> & { details: typeof reportDetails } = {
            reportNumber: formData.reportNumber,
            jobLocation: `${formData.locationCity}, ${formData.locationProvince}`,
            lineType: 'QMS Inspection',
            jobType: 'Other',
            qtyJoint: 1, // Represents one report
            status: 'Submitted',
            creationDate: format(new Date(), 'yyyy-MM-dd'),
            approvalHistory: [{ actorName: user.name, actorRole: roles.find(r => r.id === user.roleId)?.name || 'N/A', status: 'Submitted', timestamp: new Date().toISOString(), comments: 'Inspection report created.' }],
            details: reportDetails,
        };

        await addReport(newReport as any);

        toast({ title: 'Report Saved', description: 'Inspection report has been saved.' });
        router.push('/reports/other');
    }, [formData, date, user, addReport, toast, router, roles, projects]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/reports/other">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back to Reports</span>
                            </Link>
                        </Button>
                        <div>
                            <CardTitle>New Inspection Report (QMS)</CardTitle>
                            <CardDescription>Fill in the details to create a new report.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Report Details</h3>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="project">Project</Label>
                                <Select value={formData.project} onValueChange={(value) => handleInputChange('project', value)}>
                                    <SelectTrigger id="project"><SelectValue placeholder="Select a project" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Non Project">Non Project</SelectItem>
                                        {visibleProjects.map((p) => (
                                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reportNumber">Report Number</Label>
                                <Input id="reportNumber" value={formData.reportNumber} onChange={(e) => handleInputChange('reportNumber', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dates">Inspection Dates</Label>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="dates"
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                        ) : (
                                        <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="equipment">Equipment/Material</Label>
                                <Input id="equipment" value={formData.equipment} onChange={(e) => handleInputChange('equipment', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="inspector">Inspector</Label>
                                <Input id="inspector" value={formData.inspector} onChange={(e) => handleInputChange('inspector', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="vendor">Vendor</Label>
                                <Input id="vendor" value={formData.vendor} onChange={(e) => handleInputChange('vendor', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subVendor">Sub-vendor/Manufacturer</Label>
                                <Input id="subVendor" value={formData.subVendor} onChange={(e) => handleInputChange('subVendor', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="locationCity">Inspection Location (City)</Label>
                                <Input id="locationCity" value={formData.locationCity} onChange={(e) => handleInputChange('locationCity', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="locationProvince">Inspection Location (Province)</Label>
                                <Input id="locationProvince" value={formData.locationProvince} onChange={(e) => handleInputChange('locationProvince', e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Inspection Parameters</h3>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label>Local / Overseas</Label>
                                <RadioGroup value={formData.regionType} onValueChange={(value) => handleInputChange('regionType', value)} className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Local" id="local" /><Label htmlFor="local">Local</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Overseas" id="overseas" /><Label htmlFor="overseas">Overseas</Label></div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>Offshore / Onshore</Label>
                                <RadioGroup value={formData.locationType} onValueChange={(value) => handleInputChange('locationType', value)} className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Onshore" id="onshore" /><Label htmlFor="onshore">Onshore</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Offshore" id="offshore" /><Label htmlFor="offshore">Offshore</Label></div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>Result</Label>
                                <RadioGroup value={formData.result} onValueChange={(value) => handleInputChange('result', value)} className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Accept" id="accept" /><Label htmlFor="accept">Accept</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Reject" id="reject" /><Label htmlFor="reject">Reject</Label></div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Attachments</h3>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">Any file type</p>
                                    </div>
                                    <Input id="document-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
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
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/reports">Cancel</Link>
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Report
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
