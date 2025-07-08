
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Upload, X, ChevronsUpDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { type ReportItem, type RadiographicTestReportDetails, type RadiographicTestResult } from '@/lib/reports';
import { Badge } from '@/components/ui/badge';
import { useReports } from '@/context/ReportContext';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';

const steps = [
    { id: '01', name: 'General Info' },
    { id: '02', name: 'Test Details' },
    { id: '03', name: 'Test Results' },
    { id: '04', name: 'Summary & Submit' },
];

type TestResult = {
    subjectIdentification: string;
    jointNo: string;
    weldId: string;
    diameter: string;
    thickness: string;
    filmLocation: string;
    weldIndication: string;
    remarks: string;
    result: 'Accept' | 'Reject';
    images: File[];
    imageUrls?: string[];
};

const techniqueOptions = ['SWSI', 'DWSI', 'DWDI', 'Panoramic'];
const penetrameterOptions = ['ASTM #10', 'ASTM #12', 'ASTM #15', 'ASTM #20', 'ISO Wire 10-16', 'ISO Wire 6-12'];
const acceptanceCriteriaOptions = ['API 1104', 'ASME B31.3', 'ASME Sec VIII Div 1', 'AWS D1.1'];
const procedureNoOptions = ['PO/AE.MIG-OPS/35-RT', 'PROJ-SPEC-RT-001'];

export default function RadiographicTestPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { projects } = useProjects();
    const { user, isHqUser, roles } = useAuth();
    const { reports, addReport } = useReports();
    
    const [currentStep, setCurrentStep] = useState(0);
    const [isProcedureNoPopoverOpen, setIsProcedureNoPopoverOpen] = useState(false);

    const [formData, setFormData] = useState({
        client: '',
        soNumber: '',
        projectExecutor: '',
        project: '',
        jobLocation: '',
        dateOfTest: undefined as Date | undefined,
        reportNumber: '',
        lineType: '',
        procedureNo: 'PO/AE.MIG-OPS/35-RT',
        acceptanceCriteria: 'API 1104',
        examinationStage: '',
        drawingNumber: '',
        source: 'Ir-192',
        sourceSize: '',
        sfd: '',
        screens: '',
        density: '',
        material: '',
        technique: '',
        penetrameter: '',
        curries: '',
        kvp: '',
        mA: '',
        cameraSerialNumber: '',
        surveyMeterSerialNumber: '',
        surveyMeterCertExpDate: undefined as Date | undefined,
        testResults: [] as TestResult[],
    });

    const visibleProjects = useMemo(() => {
        if (isHqUser) return projects;
        if (!user) return [];
        return projects.filter(p => p.branchId === user.branchId);
    }, [projects, user, isHqUser]);

    const selectedProject = useMemo(() => {
        if (!formData.project || formData.project === 'Non Project') {
            return null;
        }
        return visibleProjects.find(p => p.name === formData.project);
    }, [formData.project, visibleProjects]);

    const [newTestResult, setNewTestResult] = useState<TestResult>({
        subjectIdentification: '',
        jointNo: '',
        weldId: '',
        diameter: '',
        thickness: '',
        filmLocation: '',
        weldIndication: 'NRI',
        remarks: 'No Recordable Indication',
        result: 'Accept',
        images: [],
    });

    const [newTestResultImagePreviews, setNewTestResultImagePreviews] = useState<string[]>([]);
    
    useEffect(() => {
        if (!newTestResult.images || newTestResult.images.length === 0) {
            setNewTestResultImagePreviews([]);
            return;
        }
        const objectUrls = newTestResult.images.map(file => URL.createObjectURL(file));
        setNewTestResultImagePreviews(objectUrls);
    
        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newTestResult.images]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
        if (id === 'project') {
            if (value === 'Non Project') {
                setFormData(prev => ({ ...prev, project: 'Non Project', client: '', projectExecutor: '', reportNumber: '', soNumber: '' }));
                return;
            }
            const selectedProject = visibleProjects.find(p => p.name === value);
            if (selectedProject) {
                const currentYear = new Date().getFullYear();
                const rtReportsThisYear = reports.filter(r => r.jobType === 'Radiographic Test' && r.reportNumber.includes(`-${currentYear}-`)).length;
                const newReportNumber = `RT-${currentYear}-${String(rtReportsThisYear + 1).padStart(3, '0')}`;
                setFormData(prev => ({ ...prev, project: value, client: selectedProject.client, projectExecutor: selectedProject.contractExecutor, reportNumber: newReportNumber, soNumber: '' }));
            }
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleDateChange = (date: Date | undefined, field: 'dateOfTest' | 'surveyMeterCertExpDate') => {
        setFormData(prev => ({ ...prev, [field]: date }));
    };

    const handleNewResultChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setNewTestResult(prev => ({ ...prev, [id]: value }));
    };

    const handleNewResultSelectChange = (id: 'result', value: string) => {
        setNewTestResult(prev => ({ ...prev, [id]: value as 'Accept' | 'Reject' }));
    };

    const handleAddResult = () => {
        if (!newTestResult.subjectIdentification || !newTestResult.jointNo || !newTestResult.weldId) {
            toast({ variant: 'destructive', title: 'Incomplete Result', description: 'Please enter at least a Subject ID, Joint No. and Weld/Part ID.' });
            return;
        }
        const newResultWithUrls = { ...newTestResult, imageUrls: newTestResult.images.map(file => URL.createObjectURL(file)) };
        setFormData(prev => ({ ...prev, testResults: [...prev.testResults, newResultWithUrls] }));
        setNewTestResult({ subjectIdentification: '', jointNo: '', weldId: '', diameter: '', thickness: '', filmLocation: '', weldIndication: 'NRI', remarks: 'No Recordable Indication', result: 'Accept', images: [] });
    };

    const handleNewResultImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewTestResult(prev => ({ ...prev, images: [...prev.images, ...Array.from(e.target.files!)] }));
        }
    };

    const removeNewResultImage = (index: number) => {
        setNewTestResult(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };
    
    const removeTestResult = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            testResults: prev.testResults.filter((_, index) => index !== indexToRemove)
        }));
    };

    const next = () => currentStep < steps.length - 1 && setCurrentStep(step => step + 1);
    const prev = () => currentStep > 0 && setCurrentStep(step => step - 1);

    const handleSubmit = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }
        const reportDetails: RadiographicTestReportDetails = {
            jobType: 'Radiographic Test',
            client: formData.client,
            soNumber: formData.soNumber,
            projectExecutor: formData.projectExecutor,
            project: formData.project,
            dateOfTest: formData.dateOfTest ? format(formData.dateOfTest, 'yyyy-MM-dd') : undefined,
            procedureNo: formData.procedureNo,
            acceptanceCriteria: formData.acceptanceCriteria,
            examinationStage: formData.examinationStage,
            drawingNumber: formData.drawingNumber,
            source: formData.source,
            sourceSize: formData.sourceSize,
            sfd: formData.sfd,
            screens: formData.screens,
            density: formData.density,
            material: formData.material,
            technique: formData.technique,
            penetrameter: formData.penetrameter,
            curries: formData.curries,
            kvp: formData.kvp,
            mA: formData.mA,
            cameraSerialNumber: formData.cameraSerialNumber,
            surveyMeterSerialNumber: formData.surveyMeterSerialNumber,
            surveyMeterCertExpDate: formData.surveyMeterCertExpDate ? format(formData.surveyMeterCertExpDate, 'yyyy-MM-dd') : undefined,
            testResults: formData.testResults.map(r => ({ ...r, imageUrls: r.imageUrls || [] })),
        };
        const newReport: Omit<ReportItem, 'id'> = {
            reportNumber: formData.reportNumber,
            jobLocation: formData.jobLocation,
            lineType: formData.lineType,
            jobType: 'Radiographic Test',
            qtyJoint: formData.testResults.length,
            status: 'Submitted',
            details: reportDetails,
            creationDate: format(new Date(), 'yyyy-MM-dd'),
            approvalHistory: [{ actorName: user.name, actorRole: roles.find(r => r.id === user.roleId)?.name || 'N/A', status: 'Submitted', timestamp: new Date().toISOString(), comments: 'Report created.' }],
        };
        addReport(newReport);
        toast({ title: 'Report Submitted', description: `Report ${formData.reportNumber} has been successfully submitted.` });
        router.push('/reports/radiographic');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon"><Link href="/reports/radiographic"><ArrowLeft className="h-4 w-4" /><span className="sr-only">Back to Reports</span></Link></Button>
                <div><h1 className="font-headline text-2xl font-bold">Radiographic Test Report</h1><p className="text-muted-foreground">Follow the steps to create a new report.</p></div>
            </div>
            <Card>
                <CardHeader>
                    <nav aria-label="Progress">
                        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
                            {steps.map((step, index) => (
                            <li key={step.name} className="md:flex-1">
                                {currentStep > index ? (
                                <div className="group flex w-full flex-col border-l-4 border-primary py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                    <span className="text-sm font-medium text-primary transition-colors">{step.id}</span>
                                    <span className="text-sm font-medium">{step.name}</span>
                                </div>
                                ) : currentStep === index ? (
                                <div className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4" aria-current="step">
                                    <span className="text-sm font-medium text-primary">{step.id}</span>
                                    <span className="text-sm font-medium">{step.name}</span>
                                </div>
                                ) : (
                                <div className="group flex w-full flex-col border-l-4 border-border py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                                    <span className="text-sm font-medium text-muted-foreground transition-colors">{step.id}</span>
                                    <span className="text-sm font-medium">{step.name}</span>
                                </div>
                                )}
                            </li>
                            ))}
                        </ol>
                    </nav>
                </CardHeader>
                <CardContent>
                    {currentStep === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                             <div className="space-y-2"><Label htmlFor="project">Project</Label><Select value={formData.project} onValueChange={(value) => handleSelectChange('project', value)}><SelectTrigger id="project"><SelectValue placeholder="Select a project" /></SelectTrigger><SelectContent><SelectItem value="Non Project">Non Project</SelectItem>{visibleProjects.map((project) => (<SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>))}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="client">Client</Label><Input id="client" value={formData.client} onChange={handleInputChange} disabled={!!formData.project && formData.project !== 'Non Project'} /></div>
                            <div className="space-y-2">
                                <Label htmlFor="soNumber">Service Order</Label>
                                {formData.project && formData.project !== 'Non Project' ? (
                                    <Select
                                        value={formData.soNumber}
                                        onValueChange={(value) => handleSelectChange('soNumber', value)}
                                        disabled={!selectedProject}
                                    >
                                        <SelectTrigger id="soNumber">
                                            <SelectValue placeholder="Select a Service Order" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedProject?.serviceOrders.map((so) => (
                                                <SelectItem key={so.id} value={so.soNumber}>
                                                    {so.soNumber} - {so.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input
                                        id="soNumber"
                                        value={formData.soNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter SO Number manually"
                                        disabled={!!formData.project && formData.project !== 'Non Project'}
                                    />
                                )}
                            </div>
                            <div className="space-y-2"><Label htmlFor="projectExecutor">Project Executor</Label><Input id="projectExecutor" value={formData.projectExecutor} onChange={handleInputChange} disabled={!!formData.project && formData.project !== 'Non Project'} /></div>
                            <div className="space-y-2"><Label htmlFor="dateOfTest">Date of Test</Label><Popover><PopoverTrigger asChild><Button id="dateOfTest" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.dateOfTest && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.dateOfTest ? format(formData.dateOfTest, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.dateOfTest} onSelect={(date) => handleDateChange(date, 'dateOfTest')} initialFocus /></PopoverContent></Popover></div>
                            <div className="space-y-2"><Label htmlFor="lineType">Line Type</Label><Input id="lineType" value={formData.lineType} onChange={handleInputChange} placeholder="e.g. Pipeline, Structural Weld" /></div>
                            <div className="space-y-2"><Label htmlFor="jobLocation">Job Location</Label><Input id="jobLocation" value={formData.jobLocation} onChange={handleInputChange} placeholder="e.g. Workshop or Site Name" /></div>
                            <div className="space-y-2"><Label htmlFor="reportNumber">Report Number</Label><Input id="reportNumber" value={formData.reportNumber} onChange={handleInputChange} disabled={!!formData.project && formData.project !== 'Non Project'} /></div>
                        </div>
                    )}
                    {currentStep === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="procedureNo">Procedure No.</Label>
                                <Popover open={isProcedureNoPopoverOpen} onOpenChange={setIsProcedureNoPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" aria-expanded={isProcedureNoPopoverOpen} className="w-full justify-between font-normal">
                                            {formData.procedureNo || "Select or type procedure..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search or type procedure..." value={formData.procedureNo} onValueChange={(value) => handleSelectChange('procedureNo', value)} />
                                            <CommandList>
                                                <CommandEmpty>No procedure found.</CommandEmpty>
                                                <CommandGroup>
                                                    {procedureNoOptions.map((option) => (
                                                        <CommandItem key={option} value={option} onSelect={(currentValue) => { handleSelectChange('procedureNo', currentValue === formData.procedureNo ? "" : currentValue); setIsProcedureNoPopoverOpen(false); }}>
                                                            <Check className={cn("mr-2 h-4 w-4", formData.procedureNo.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0")} />
                                                            {option}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="acceptanceCriteria">Acceptance Criteria</Label>
                                <Select value={formData.acceptanceCriteria} onValueChange={(v) => handleSelectChange('acceptanceCriteria', v)}>
                                    <SelectTrigger id="acceptanceCriteria"><SelectValue placeholder="Select criteria"/></SelectTrigger>
                                    <SelectContent>
                                        {acceptanceCriteriaOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label htmlFor="drawingNumber">Drawing Number</Label><Input id="drawingNumber" value={formData.drawingNumber} onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="examinationStage">Examination Stage</Label><Select value={formData.examinationStage} onValueChange={(v) => handleSelectChange('examinationStage', v)}><SelectTrigger><SelectValue placeholder="Select Stage"/></SelectTrigger><SelectContent><SelectItem value="Before PWHT">Before PWHT</SelectItem><SelectItem value="After PWHT">After PWHT</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="material">Material</Label><Input id="material" value={formData.material} onChange={handleInputChange}/></div>
                            <div className="space-y-2">
                                <Label htmlFor="technique">Technique</Label>
                                <Select value={formData.technique} onValueChange={(v) => handleSelectChange('technique', v)}>
                                    <SelectTrigger id="technique"><SelectValue placeholder="Select technique"/></SelectTrigger>
                                    <SelectContent>
                                        {techniqueOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label htmlFor="source">Source</Label><Select value={formData.source} onValueChange={(v) => handleSelectChange('source', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="X-Ray">X-Ray</SelectItem><SelectItem value="Ir-192">Ir-192</SelectItem><SelectItem value="Se-75">Se-75</SelectItem><SelectItem value="Co-60">Co-60</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="sourceSize">Source Size / Focal Spot</Label><Input id="sourceSize" value={formData.sourceSize} onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="curries">Curries</Label><Input id="curries" value={formData.curries} onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="kvp">KVP</Label><Input id="kvp" value={formData.kvp} onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="mA">mA</Label><Input id="mA" value={formData.mA} onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="sfd">Source to Film Distance</Label><Input id="sfd" value={formData.sfd} onChange={handleInputChange} placeholder="e.g. 700mm"/></div>
                            <div className="space-y-2"><Label htmlFor="screens">Screens</Label><Input id="screens" value={formData.screens} onChange={handleInputChange} placeholder="e.g. Lead 0.1mm"/></div>
                            <div className="space-y-2">
                                <Label htmlFor="penetrameter">Penetrameter (IQI)</Label>
                                <Select value={formData.penetrameter} onValueChange={(v) => handleSelectChange('penetrameter', v)}>
                                    <SelectTrigger id="penetrameter"><SelectValue placeholder="Select penetrameter"/></SelectTrigger>
                                    <SelectContent>
                                        {penetrameterOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label htmlFor="density">Density</Label><Input id="density" value={formData.density} onChange={handleInputChange} placeholder="e.g. 2.0-4.0"/></div>
                            <div className="space-y-2"><Label htmlFor="cameraSerialNumber">Camera Serial Number</Label><Input id="cameraSerialNumber" value={formData.cameraSerialNumber} onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="surveyMeterSerialNumber">Survey Meter Serial Number</Label><Input id="surveyMeterSerialNumber" value={formData.surveyMeterSerialNumber} onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="surveyMeterCertExpDate">Survey Meter Expiry Date</Label><Popover><PopoverTrigger asChild><Button id="surveyMeterCertExpDate" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.surveyMeterCertExpDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{formData.surveyMeterCertExpDate ? format(formData.surveyMeterCertExpDate, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.surveyMeterCertExpDate} onSelect={(date) => handleDateChange(date, 'surveyMeterCertExpDate')} initialFocus /></PopoverContent></Popover></div>
                        </div>
                    )}
                    {currentStep === 2 && (
                         <div className="pt-6 space-y-4">
                            <Card>
                                <CardHeader><CardTitle>Add Test Result</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="space-y-2"><Label htmlFor="subjectIdentification">Subject ID</Label><Input id="subjectIdentification" value={newTestResult.subjectIdentification} onChange={handleNewResultChange} /></div>
                                        <div className="space-y-2"><Label htmlFor="jointNo">Joint No.</Label><Input id="jointNo" value={newTestResult.jointNo} onChange={handleNewResultChange} /></div>
                                        <div className="space-y-2"><Label htmlFor="weldId">Weld/Part ID</Label><Input id="weldId" value={newTestResult.weldId} onChange={handleNewResultChange} /></div>
                                        <div className="space-y-2"><Label htmlFor="diameter">Diameter</Label><Input id="diameter" value={newTestResult.diameter} onChange={handleNewResultChange} placeholder='e.g., 12"'/></div>
                                        <div className="space-y-2"><Label htmlFor="thickness">Thickness</Label><Input id="thickness" value={newTestResult.thickness} onChange={handleNewResultChange} placeholder='e.g., 25.4mm' /></div>
                                    </div>
                                    <Separator className="my-4"/>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2"><Label htmlFor="filmLocation">Film Location</Label><Input id="filmLocation" value={newTestResult.filmLocation} onChange={handleNewResultChange} /></div>
                                        <div className="space-y-2"><Label htmlFor="weldIndication">Weld Indication</Label><Input id="weldIndication" value={newTestResult.weldIndication} onChange={handleNewResultChange} /></div>
                                        <div className="space-y-2 col-span-full"><Label htmlFor="remarks">Remarks</Label><Textarea id="remarks" value={newTestResult.remarks} onChange={handleNewResultChange} /></div>
                                        <div className="space-y-2"><Label htmlFor="result">Result</Label><Select value={newTestResult.result} onValueChange={(v) => handleNewResultSelectChange('result', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Accept">Accept</SelectItem><SelectItem value="Reject">Reject</SelectItem></SelectContent></Select></div>
                                    </div>
                                    <Separator className="my-4"/>
                                    <div className="space-y-2"><Label>Evidence Images</Label><div className="flex items-center justify-center w-full"><label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 mb-3 text-muted-foreground" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p></div><Input id="image-upload" type="file" className="hidden" multiple onChange={handleNewResultImageChange} accept="image/*" /></label></div>
                                        {newTestResultImagePreviews.length > 0 && (<div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{newTestResultImagePreviews.map((url, index) => (<div key={index} className="relative group"><div className="aspect-square w-full overflow-hidden rounded-md border"><Image src={url} alt={`Preview ${index + 1}`} width={100} height={100} className="h-full w-full object-cover" data-ai-hint="test result" /></div><div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeNewResultImage(index)}><X className="h-4 w-4" /></Button></div><p className="text-xs text-muted-foreground truncate mt-1">{newTestResult.images[index]?.name}</p></div>))}</div>)}
                                    </div>
                                    <div className="mt-4 flex justify-end"><Button onClick={handleAddResult}>Add Result</Button></div>
                                </CardContent>
                            </Card>
                            <div className="mt-6"><h3 className="text-lg font-semibold mb-2">Results Summary</h3>
                                <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Joint No.</TableHead>
                                            <TableHead>Film Location</TableHead>
                                            <TableHead>Weld Indication</TableHead>
                                            <TableHead>Result</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formData.testResults.map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{result.jointNo}</TableCell>
                                            <TableCell>{result.filmLocation}</TableCell>
                                            <TableCell>{result.weldIndication}</TableCell>
                                            <TableCell><Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge></TableCell>
                                            <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => removeTestResult(index)}><X className="h-4 w-4"/></Button></TableCell>
                                        </TableRow>
                                        ))}
                                        {formData.testResults.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24">No results added yet.</TableCell>
                                        </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div className="pt-6 space-y-6">
                            <h2 className="text-xl font-bold">Report Summary</h2>
                            <p>Review the information before submitting.</p>
                             <Card>
                                <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Project</p><p>{formData.project}</p></div>
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Client</p><p>{formData.client}</p></div>
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Service Order</p><p>{formData.soNumber}</p></div>
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Project Executor</p><p>{formData.projectExecutor}</p></div>
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Job Location</p><p>{formData.jobLocation}</p></div>
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Date of Test</p><p>{formData.dateOfTest ? format(formData.dateOfTest, 'PPP') : 'N/A'}</p></div>
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Report Number</p><p>{formData.reportNumber}</p></div>
                                    <div className="col-span-1"><p className="font-medium text-muted-foreground">Line Type</p><p>{formData.lineType}</p></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div><p className="font-medium text-muted-foreground">Procedure No.</p><p>{formData.procedureNo}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Acceptance Criteria</p><p>{formData.acceptanceCriteria}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Material</p><p>{formData.material}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Technique</p><p>{formData.technique}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Source</p><p>{formData.source} ({formData.sourceSize})</p></div>
                                    <div><p className="font-medium text-muted-foreground">Curries</p><p>{formData.curries}</p></div>
                                    <div><p className="font-medium text-muted-foreground">KVP / mA</p><p>{formData.kvp || 'N/A'} / {formData.mA || 'N/A'}</p></div>
                                    <div><p className="font-medium text-muted-foreground">SFD</p><p>{formData.sfd}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Screens</p><p>{formData.screens}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Density</p><p>{formData.density}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Penetrameter (IQI)</p><p>{formData.penetrameter}</p></div>
                                    <div><p className="font-medium text-muted-foreground">Camera S/N</p><p>{formData.cameraSerialNumber}</p></div>
                                    <div className="col-span-2"><p className="font-medium text-muted-foreground">Survey Meter S/N</p><p>{formData.surveyMeterSerialNumber} (Expires: {formData.surveyMeterCertExpDate ? format(new Date(formData.surveyMeterCertExpDate), 'PPP') : 'N/A'})</p></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Joint No.</TableHead>
                                                <TableHead>Weld ID</TableHead>
                                                <TableHead>Film Location</TableHead>
                                                <TableHead>Weld Indication</TableHead>
                                                <TableHead>Result</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {formData.testResults.map((r, i) => (
                                                <TableRow key={i}>
                                                    <TableCell>{r.jointNo}</TableCell>
                                                    <TableCell>{r.weldId}</TableCell>
                                                    <TableCell>{r.filmLocation}</TableCell>
                                                    <TableCell>{r.weldIndication}</TableCell>
                                                    <TableCell><Badge variant={r.result === 'Accept' ? 'green' : 'destructive'}>{r.result}</Badge></TableCell>
                                                </TableRow>
                                            ))}
                                            {formData.testResults.length === 0 && (
                                                <TableRow><TableCell colSpan={5} className="text-center h-24">No results added.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div>{currentStep > 0 && (<Button variant="outline" onClick={prev}><ChevronLeft className="h-4 w-4 mr-2" /> Previous</Button>)}</div>
                    <div>{currentStep < steps.length - 1 && (<Button onClick={next}>Next <ChevronRight className="h-4 w-4 ml-2" /></Button>)}{currentStep === steps.length - 1 && (<Button onClick={handleSubmit}><Check className="h-4 w-4 mr-2" /> Submit Report</Button>)}</div>
                </CardFooter>
            </Card>
        </div>
    );
}
