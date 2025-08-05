
'use client';

import { useState, useCallback, useMemo } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReports } from '@/context/ReportContext';
import type { ReportItem, OtherReportDetails } from '@/lib/reports';
import { DateRange } from 'react-day-picker';
import { useProjects } from '@/context/ProjectContext';

export default function NewInspectionReportPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, roles } = useAuth();
    const { addReport } = useReports();
    const { projects } = useProjects();

    const [reportNumber, setReportNumber] = useState('');
    const [project, setProject] = useState('');
    const [client, setClient] = useState('');
    const [date, setDate] = useState<DateRange | undefined>(undefined);
    const [equipmentMaterial, setEquipmentMaterial] = useState('');
    const [inspector, setInspector] = useState('');
    const [travelType, setTravelType] = useState<'Local' | 'Overseas'>('Local');
    const [locationType, setLocationType] = useState<'Onshore' | 'Offshore'>('Onshore');
    const [subVendor, setSubVendor] = useState('');
    const [locationCity, setLocationCity] = useState('');
    const [locationProvince, setLocationProvince] = useState('');
    const [result, setResult] = useState<'Accept' | 'Reject'>('Accept');
    const [documents, setDocuments] = useState<File[]>([]);
    
    const visibleProjects = useMemo(() => {
        if (!user) return [];
        return projects;
    }, [projects, user]);

    const handleProjectChange = (value: string) => {
        if (value === 'Non Project') {
            setProject('Non Project');
            setClient('');
        } else {
            const selectedProject = visibleProjects.find(p => p.name === value);
            if (selectedProject) {
                setProject(selectedProject.name);
                setClient(selectedProject.client);
            }
        }
    };

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    }, []);

    const removeDocument = useCallback((index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleSave = useCallback(async () => {
        if (!reportNumber || !date?.from || !date?.to || !user) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out Report Number and Dates.',
            });
            return;
        }

        const reportDetails: Omit<OtherReportDetails, 'documentUrls'> & { documents: File[] } = {
            jobType: 'Inspection Report',
            project: project,
            vendor: client, // The vendor field now takes the client name
            reportNumber,
            startDate: format(date.from, 'yyyy-MM-dd'),
            endDate: format(date.to, 'yyyy-MM-dd'),
            equipmentMaterial,
            inspector,
            travelType,
            locationType,
            subVendor,
            locationCity,
            locationProvince,
            result,
            documents: documents,
        };

        const newReport: Omit<ReportItem, 'id' | 'details'> & { details: typeof reportDetails } = {
            reportNumber,
            jobLocation: `${locationCity}, ${locationProvince}`,
            lineType: 'Inspection Report (QMS)',
            jobType: 'Inspection Report',
            qtyJoint: 0,
            status: 'Submitted',
            creationDate: format(new Date(), 'yyyy-MM-dd'),
            approvalHistory: [{ actorName: user.name, actorRole: roles.find(r => r.id === user.roleId)?.name || 'N/A', status: 'Submitted', timestamp: new Date().toISOString(), comments: 'Inspection report created.' }],
            details: reportDetails,
        };

        await addReport(newReport as any);
        
        toast({
            title: 'Report Saved',
            description: 'Inspection Report has been saved.',
        });
        router.push('/reports/inspection');
    }, [
        reportNumber, date, equipmentMaterial, inspector, travelType, locationType, client, subVendor,
        locationCity, locationProvince, result, documents, project,
        user, addReport, toast, router, roles
    ]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/reports">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back to Reports</span>
                            </Link>
                        </Button>
                        <div className="space-y-1.5">
                            <CardTitle>New Inspection Report (QMS)</CardTitle>
                            <CardDescription>Fill in the details for the new inspection report.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <Select value={project} onValueChange={handleProjectChange}>
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
                        <Label htmlFor="client">Client</Label>
                        <Input id="client" value={client} onChange={e => setClient(e.target.value)} disabled={project !== 'Non Project' && project !== ''} placeholder="Autofilled from project" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reportNumber">Report Number</Label>
                        <Input id="reportNumber" value={reportNumber} onChange={e => setReportNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="dates">Inspection Dates</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button id="dates" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (date.to ? (<>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="inspector">Inspector</Label>
                        <Input id="inspector" value={inspector} onChange={e => setInspector(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="equipmentMaterial">Equipment/Material</Label>
                        <Input id="equipmentMaterial" value={equipmentMaterial} onChange={e => setEquipmentMaterial(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="travelType">Local/Overseas</Label>
                        <Select value={travelType} onValueChange={(v: 'Local'|'Overseas') => setTravelType(v)}>
                            <SelectTrigger id="travelType"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Local">Local</SelectItem>
                                <SelectItem value="Overseas">Overseas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="locationType">Onshore/Offshore</Label>
                        <Select value={locationType} onValueChange={(v: 'Onshore'|'Offshore') => setLocationType(v)}>
                            <SelectTrigger id="locationType"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Onshore">Onshore</SelectItem>
                                <SelectItem value="Offshore">Offshore</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="subVendor">Sub-vendor/Manufacturer</Label>
                        <Input id="subVendor" value={subVendor} onChange={e => setSubVendor(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="locationCity">Inspection Location (City)</Label>
                        <Input id="locationCity" value={locationCity} onChange={e => setLocationCity(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="locationProvince">Inspection Location (Province)</Label>
                        <Input id="locationProvince" value={locationProvince} onChange={e => setLocationProvince(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="result">Result</Label>
                        <Select value={result} onValueChange={(v: 'Accept'|'Reject') => setResult(v)}>
                            <SelectTrigger id="result"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Accept">Accept</SelectItem>
                                <SelectItem value="Reject">Reject</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                        <Label>Attachments</Label>
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
