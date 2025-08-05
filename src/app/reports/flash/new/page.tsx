

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
import { Textarea } from '@/components/ui/textarea';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReports } from '@/context/ReportContext';
import type { ReportItem, FlashReportDetails, ReportStatus } from '@/lib/reports';
import { Separator } from '@/components/ui/separator';


export default function NewFlashReportPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { projects } = useProjects();
    const { user, isHqUser, roles } = useAuth();
    const { addReport } = useReports();

    const [project, setProject] = useState('');
    const [client, setClient] = useState('');
    const [reportNumber, setReportNumber] = useState('');
    const [inspectionDate, setInspectionDate] = useState<Date | undefined>();
    const [inspectionItem, setInspectionItem] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [itemDescription, setItemDescription] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [inspectorName, setInspectorName] = useState('');
    const [locationCity, setLocationCity] = useState('');
    const [locationProvince, setLocationProvince] = useState('');
    const [status, setStatus] = useState<ReportStatus>('Submitted');
    const [documents, setDocuments] = useState<File[]>([]);
    
    const visibleProjects = useMemo(() => {
        if (isHqUser) return projects;
        if (!user) return [];
        return projects.filter(p => p.branchId === user.branchId);
    }, [projects, user, isHqUser]);

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
        if (!reportNumber || !inspectionDate || !inspectionItem || !quantity || !user) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all required fields.',
            });
            return;
        }

        const reportDetails: Omit<FlashReportDetails, 'documentUrls'> & { documents: File[] } = {
            jobType: 'Flash Report',
            project: project === 'Non Project' ? undefined : project,
            client,
            reportNumber,
            inspectionDate: format(inspectionDate, 'yyyy-MM-dd'),
            inspectionItem,
            quantity: Number(quantity),
            itemDescription,
            vendorName,
            inspectorName,
            locationCity,
            locationProvince,
            documents: documents,
        };

        const newReport: Omit<ReportItem, 'id' | 'details'> & { details: typeof reportDetails } = {
            reportNumber,
            jobLocation: `${locationCity}, ${locationProvince}`,
            lineType: 'Flash Report',
            jobType: 'Flash Report',
            qtyJoint: Number(quantity),
            status: status,
            creationDate: format(new Date(), 'yyyy-MM-dd'),
            approvalHistory: [{ actorName: user.name, actorRole: roles.find(r => r.id === user.roleId)?.name || 'N/A', status: status, timestamp: new Date().toISOString(), comments: 'Flash report created.' }],
            details: reportDetails,
        };

        await addReport(newReport as any); // Cast to any to bypass strict type checking, as addReport expects a union type
        
        toast({
            title: 'Report Saved',
            description: 'Flash Report has been saved.',
        });
        router.push('/reports/flash');
    }, [
        project, client, reportNumber, inspectionDate, inspectionItem, quantity,
        itemDescription, vendorName, inspectorName, locationCity, locationProvince,
        status, documents,
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
                            <CardTitle>New Flash Report (QMS)</CardTitle>
                            <CardDescription>Fill in the details for the new flash report.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Input id="client" value={client} onChange={e => setClient(e.target.value)} disabled={project !== 'Non Project' && project !== ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reportNumber">Report Number</Label>
                        <Input id="reportNumber" value={reportNumber} onChange={e => setReportNumber(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="inspectionDate">Inspection Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="inspectionDate"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !inspectionDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {inspectionDate ? format(inspectionDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={inspectionDate} onSelect={setInspectionDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="inspectionItem">Inspection Item</Label>
                        <Input id="inspectionItem" value={inspectionItem} onChange={e => setInspectionItem(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))} />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="itemDescription">Item Description</Label>
                        <Textarea id="itemDescription" value={itemDescription} onChange={e => setItemDescription(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="vendorName">Manufacturer/Vendor Name</Label>
                        <Input id="vendorName" value={vendorName} onChange={e => setVendorName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="inspectorName">Inspector Name</Label>
                        <Input id="inspectorName" value={inspectorName} onChange={e => setInspectorName(e.target.value)} />
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
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(value: ReportStatus) => setStatus(value)}>
                            <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Submitted">Submitted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
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
