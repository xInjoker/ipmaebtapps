
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
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
import { type ReportItem, type PenetrantTestReportDetails, acceptanceCriteriaOptions, ptProcedureNoOptions } from '@/lib/reports';
import { Badge } from '@/components/ui/badge';
import { useReports } from '@/context/ReportContext';
import { useToast } from '@/hooks/use-toast';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';


const steps = [
    { id: '01', name: 'General Info', fields: ['client', 'project', 'reportNumber', 'dateOfTest'] },
    { id: '02', name: 'Test Details', fields: ['procedureNo', 'acceptanceCriteria', 'material', 'weldingProcess'] },
    { id: '03', name: 'Test Results', fields: [] },
    { id: '04', name: 'Summary & Save', fields: [] },
];

type FormData = Omit<PenetrantTestReportDetails, 'jobType' | 'dateOfTest' | 'testResults'> & {
    jobLocation: string;
    reportNumber: string;
    lineType: string;
    dateOfTest: Date | undefined;
    testResults: TestResult[];
};

type TestResult = {
    subjectIdentification: string;
    jointNo: string;
    weldId: string;
    diameter: string;
    thickness: string;
    linearIndication: string;
    roundIndication: string;
    result: 'Accept' | 'Reject';
    images: File[];
    imageUrls?: string[];
};

function createReportDetails(formData: FormData): PenetrantTestReportDetails {
    return {
        jobType: 'Penetrant Test',
        client: formData.client,
        soNumber: formData.soNumber,
        projectExecutor: formData.projectExecutor,
        project: formData.project,
        dateOfTest: formData.dateOfTest ? format(formData.dateOfTest, 'yyyy-MM-dd') : undefined,
        procedureNo: formData.procedureNo,
        acceptanceCriteria: formData.acceptanceCriteria,
        visualInspection: formData.visualInspection,
        surfaceCondition: formData.surfaceCondition,
        examinationStage: formData.examinationStage,
        material: formData.material,
        weldingProcess: formData.weldingProcess,
        drawingNumber: formData.drawingNumber,
        testExtent: formData.testExtent,
        testTemperature: formData.testTemperature,
        penetrantType: formData.penetrantType,
        penetrantBrand: formData.penetrantBrand,
        penetrantBatch: formData.penetrantBatch,
        removerType: formData.removerType,
        removerBrand: formData.removerBrand,
        removerBatch: formData.removerBatch,
        developerType: formData.developerType,
        developerBrand: formData.developerBrand,
        developerBatch: formData.developerBatch,
        testEquipment: formData.testEquipment,
        testResults: formData.testResults.map(result => ({
            ...result,
            imageUrls: result.imageUrls || [],
        })),
    };
}


export default function EditPenetrantTestPage() {
    const router = useRouter();
    const params = useParams();
    const { getReportById, updateReport, reports } = useReports();
    const { projects } = useProjects();
    const { user, isHqUser } = useAuth();
    const { toast } = useToast();

    const [currentStep, setCurrentStep] = useState(0);
    const [originalReport, setOriginalReport] = useState<ReportItem | null>(null);
    const [isAcceptanceCriteriaPopoverOpen, setIsAcceptanceCriteriaPopoverOpen] = useState(false);
    const [isProcedureNoPopoverOpen, setIsProcedureNoPopoverOpen] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        client: '',
        soNumber: '',
        projectExecutor: '',
        project: '',
        jobLocation: '',
        dateOfTest: undefined,
        reportNumber: '',
        lineType: '',
        procedureNo: '',
        acceptanceCriteria: '',
        visualInspection: 'Acceptable',
        surfaceCondition: 'As Welded',
        examinationStage: '',
        material: '',
        weldingProcess: '',
        drawingNumber: '',
        testExtent: '100%',
        testTemperature: '',
        penetrantType: '',
        penetrantBrand: '',
        penetrantBatch: '',
        removerType: '',
        removerBrand: '',
        removerBatch: '',
        developerType: '',
        developerBrand: '',
        developerBatch: '',
        testEquipment: '',
        testResults: [],
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
        linearIndication: '',
        roundIndication: '',
        result: 'Accept',
        images: [],
        imageUrls: [],
    });

    const [newTestResultImagePreviews, setNewTestResultImagePreviews] = useState<string[]>([]);
    
    useEffect(() => {
        const reportId = params.id as string;
        if (reportId) {
            const item = getReportById(reportId);
            if (item && item.details && item.details.jobType === 'Penetrant Test') {
                setOriginalReport(item);
                const details = item.details as PenetrantTestReportDetails;
                setFormData({
                    jobLocation: item.jobLocation || '',
                    reportNumber: item.reportNumber || '',
                    lineType: item.lineType || '',
                    client: details.client || '',
                    soNumber: details.soNumber || '',
                    projectExecutor: details.projectExecutor || '',
                    project: details.project || '',
                    dateOfTest: details.dateOfTest ? new Date(details.dateOfTest) : undefined,
                    procedureNo: details.procedureNo || '',
                    acceptanceCriteria: details.acceptanceCriteria || '',
                    visualInspection: details.visualInspection || 'Acceptable',
                    surfaceCondition: details.surfaceCondition || 'As Welded',
                    examinationStage: details.examinationStage || '',
                    material: details.material || '',
                    weldingProcess: details.weldingProcess || '',
                    drawingNumber: details.drawingNumber || '',
                    testExtent: details.testExtent || '100%',
                    testTemperature: details.testTemperature || '',
                    penetrantType: details.penetrantType || '',
                    penetrantBrand: details.penetrantBrand || '',
                    penetrantBatch: details.penetrantBatch || '',
                    removerType: details.removerType || '',
                    removerBrand: details.removerBrand || '',
                    removerBatch: details.removerBatch || '',
                    developerType: details.developerType || '',
                    developerBrand: details.developerBrand || '',
                    developerBatch: details.developerBatch || '',
                    testEquipment: details.testEquipment || '',
                    testResults: (details.testResults || []).map(tr => ({
                        ...tr,
                        images: [],
                        imageUrls: tr.imageUrls || [],
                    })),
                });
            } else {
                toast({ variant: 'destructive', title: 'Report not found', description: `Could not find a valid Penetrant Test report with ID ${reportId}.` });
                router.push('/reports/penetrant');
            }
        }
    }, [params.id, getReportById, router, toast, reports]);

    useEffect(() => {
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
                setFormData(prev => ({
                    ...prev,
                    project: 'Non Project',
                    client: '',
                    projectExecutor: '',
                    soNumber: '',
                }));
                return;
            }
    
            const selectedProject = visibleProjects.find(p => p.name === value);
            if (selectedProject) {
                setFormData(prev => ({
                    ...prev,
                    project: value,
                    client: selectedProject.client,
                    projectExecutor: selectedProject.contractExecutor,
                    soNumber: '',
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };
    
    const handleDateChange = (date: Date | undefined) => {
        setFormData(prev => ({ ...prev, dateOfTest: date }));
    };

    const handleNewResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setNewTestResult(prev => ({ ...prev, [id]: value }));
    };
    
    const handleNewResultSelectChange = (id: 'result', value: string) => {
        setNewTestResult(prev => ({ ...prev, [id]: value as 'Accept' | 'Reject'}));
    };
    
    const handleAddResult = () => {
        if (!newTestResult.subjectIdentification || !newTestResult.jointNo || !newTestResult.weldId) {
             toast({
                variant: 'destructive',
                title: 'Incomplete Result',
                description: 'Please enter at least a Subject ID, Joint No. and Weld/Part ID.',
            });
            return;
        }

        setFormData(prev => ({
            ...prev,
            testResults: [...prev.testResults, newTestResult]
        }));

        setNewTestResult({ subjectIdentification: '', jointNo: '', weldId: '', diameter: '', thickness: '', linearIndication: '', roundIndication: '', result: 'Accept', images: [], imageUrls: [] });
    };
    
    const handleNewResultImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewTestResult(prev => ({
                ...prev,
                images: [...prev.images, ...Array.from(e.target.files!)]
            }));
        }
    };

    const removeNewResultImage = (index: number) => {
        setNewTestResult(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };
    
    const removeTestResult = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            testResults: prev.testResults.filter((_, index) => index !== indexToRemove)
        }));
    };

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(step => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(step => step - 1);
        }
    };

    const handleSave = () => {
        if (!originalReport) return;

        const reportDetails = createReportDetails(formData);

        const updatedReport: ReportItem = {
            ...originalReport,
            reportNumber: formData.reportNumber,
            jobLocation: formData.jobLocation,
            lineType: formData.lineType,
            qtyJoint: formData.testResults.length,
            status: 'Submitted', // Or maybe keep original status? For now, let's assume editing re-submits it.
            details: reportDetails,
        };
    
        updateReport(originalReport.id, updatedReport, { testResults: formData.testResults });
    
        toast({
            title: 'Report Updated',
            description: `Report ${updatedReport.reportNumber} has been successfully updated.`,
        });
    
        router.push(`/reports/${originalReport.id}`);
    };

    if (!originalReport) {
        return <div className="flex h-screen items-center justify-center">Loading report...</div>;
    }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/reports/penetrant">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Reports</span>
          </Link>
        </Button>
        <div>
          <h1 className="font-headline text-2xl font-bold">Edit Penetrant Test Report</h1>
          <p className="text-muted-foreground">Editing report: {originalReport.reportNumber}</p>
        </div>
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
                        <div
                            className="flex w-full flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                            aria-current="step"
                        >
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
                    <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <Select value={formData.project} onValueChange={(value) => handleSelectChange('project', value)}>
                            <SelectTrigger id="project"><SelectValue placeholder="Select a project" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Non Project">Non Project</SelectItem>
                                {visibleProjects.map((project) => (
                                    <SelectItem key={project.id} value={project.name}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="client">Client</Label>
                        <Input id="client" value={formData.client} onChange={handleInputChange} disabled={!!formData.project && formData.project !== 'Non Project'} />
                    </div>
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
                     <div className="space-y-2">
                        <Label htmlFor="projectExecutor">Project Executor</Label>
                        <Input id="projectExecutor" value={formData.projectExecutor} onChange={handleInputChange} disabled={!!formData.project && formData.project !== 'Non Project'} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobLocation">Job Location</Label>
                        <Input id="jobLocation" value={formData.jobLocation} onChange={handleInputChange} placeholder="e.g. Workshop or Site Name" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="dateOfTest">Date of Test</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="dateOfTest"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !formData.dateOfTest && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.dateOfTest ? format(formData.dateOfTest, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={formData.dateOfTest} onSelect={handleDateChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="lineType">Line Type</Label>
                        <Input id="lineType" value={formData.lineType} onChange={handleInputChange} placeholder="e.g. Pipeline, Structural Weld" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="reportNumber">Report Number</Label>
                        <Input id="reportNumber" value={formData.reportNumber} onChange={handleInputChange} />
                    </div>
                </div>
            )}

            {currentStep === 1 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="procedureNo">Procedure No.</Label>
                        <Popover open={isProcedureNoPopoverOpen} onOpenChange={setIsProcedureNoPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isProcedureNoPopoverOpen}
                                    className="w-full justify-between font-normal"
                                >
                                    {formData.procedureNo || "Select or type procedure..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search or type procedure..."
                                        value={formData.procedureNo}
                                        onValueChange={(value) => handleSelectChange('procedureNo', value)}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No procedure found.</CommandEmpty>
                                        <CommandGroup>
                                            {ptProcedureNoOptions.map((option) => (
                                                <CommandItem
                                                    key={option}
                                                    value={option}
                                                    onSelect={(currentValue) => {
                                                        handleSelectChange('procedureNo', currentValue === formData.procedureNo ? "" : currentValue);
                                                        setIsProcedureNoPopoverOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.procedureNo.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
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
                        <Popover open={isAcceptanceCriteriaPopoverOpen} onOpenChange={setIsAcceptanceCriteriaPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={isAcceptanceCriteriaPopoverOpen}
                                    className="w-full justify-between font-normal"
                                >
                                    {formData.acceptanceCriteria || "Select or type criteria..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search or type criteria..."
                                        value={formData.acceptanceCriteria}
                                        onValueChange={(value) => handleSelectChange('acceptanceCriteria', value)}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No criteria found.</CommandEmpty>
                                        <CommandGroup>
                                            {acceptanceCriteriaOptions.map((option) => (
                                                <CommandItem
                                                    key={option}
                                                    value={option}
                                                    onSelect={(currentValue) => {
                                                        handleSelectChange('acceptanceCriteria', currentValue === formData.acceptanceCriteria ? "" : currentValue);
                                                        setIsAcceptanceCriteriaPopoverOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.acceptanceCriteria.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
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
                        <Label htmlFor="visualInspection">Visual Inspection</Label>
                        <Select value={formData.visualInspection} onValueChange={(value) => handleSelectChange('visualInspection', value)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Acceptable">Acceptable</SelectItem>
                                <SelectItem value="Not Acceptable">Not Acceptable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="surfaceCondition">Surface Condition</Label>
                        <Select value={formData.surfaceCondition} onValueChange={(value) => handleSelectChange('surfaceCondition', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="As Welded">As Welded</SelectItem>
                                <SelectItem value="Grinded">Grinded</SelectItem>
                                <SelectItem value="As Rolled">As Rolled</SelectItem>
                                <SelectItem value="Machined">Machined</SelectItem>
                                <SelectItem value="As Forged">As Forged</SelectItem>
                                <SelectItem value="Wire Brushed">Wire Brushed</SelectItem>
                                <SelectItem value="As Cast">As Cast</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="examinationStage">Examination Stage</Label>
                        <Select value={formData.examinationStage} onValueChange={(value) => handleSelectChange('examinationStage', value)}>
                            <SelectTrigger id="examinationStage"><SelectValue placeholder="Select stage" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Before PWHT">Before PWHT</SelectItem>
                                <SelectItem value="After PWHT">After PWHT</SelectItem>
                                <SelectItem value="Before Hydrostatic Test">Before Hydrostatic Test</SelectItem>
                                <SelectItem value="After Hydrostatic Test">After Hydrostatic Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Input id="material" value={formData.material} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="weldingProcess">Welding Process</Label>
                        <Input id="weldingProcess" value={formData.weldingProcess} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="drawingNumber">Drawing Number</Label>
                        <Input id="drawingNumber" value={formData.drawingNumber} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="testExtent">Test Extent</Label>
                        <Select value={formData.testExtent} onValueChange={(value) => handleSelectChange('testExtent', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="100%">100%</SelectItem>
                                <SelectItem value="50%">50%</SelectItem>
                                <SelectItem value="25%">25%</SelectItem>
                                <SelectItem value="Spot">Spot</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="testTemperature">Test Temperature</Label>
                        <Input id="testTemperature" value={formData.testTemperature} onChange={handleInputChange} placeholder="e.g. 25°C" />
                    </div>

                    <h3 className="text-lg font-semibold col-span-full pt-4">Equipment & Materials</h3>
                    <div className="space-y-2">
                        <Label htmlFor="penetrantType">Penetrant Type</Label>
                        <Select value={formData.penetrantType} onValueChange={(value) => handleSelectChange('penetrantType', value)}>
                            <SelectTrigger id="penetrantType"><SelectValue placeholder="Select type"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Visible">Visible</SelectItem>
                                <SelectItem value="Solvent Removable">Solvent Removable</SelectItem>
                                <SelectItem value="Fluorescent">Fluorescent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="penetrantBrand">Penetrant Brand</Label>
                        <Input id="penetrantBrand" value={formData.penetrantBrand} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="penetrantBatch">Penetrant Batch No.</Label>
                        <Input id="penetrantBatch" value={formData.penetrantBatch} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="removerType">Remover Type</Label>
                        <Select value={formData.removerType} onValueChange={(value) => handleSelectChange('removerType', value)}>
                            <SelectTrigger id="removerType"><SelectValue placeholder="Select type"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="water-washable">Water-washable</SelectItem>
                                <SelectItem value="solvent-removable">Solvent-removable</SelectItem>
                                <SelectItem value="post-emulsifiable">Post-emulsifiable</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="removerBrand">Remover Brand</Label>
                        <Input id="removerBrand" value={formData.removerBrand} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="removerBatch">Remover Batch No.</Label>
                        <Input id="removerBatch" value={formData.removerBatch} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="developerType">Developer Type</Label>
                        <Select value={formData.developerType} onValueChange={(value) => handleSelectChange('developerType', value)}>
                            <SelectTrigger id="developerType"><SelectValue placeholder="Select type"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dry powder">Dry Powder</SelectItem>
                                <SelectItem value="water soluble">Water Soluble</SelectItem>
                                <SelectItem value="water suspendible">Water Suspendible</SelectItem>
                                <SelectItem value="non-aqueous">Non-aqueous</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="developerBrand">Developer Brand</Label>
                        <Input id="developerBrand" value={formData.developerBrand} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="developerBatch">Developer Batch No.</Label>
                        <Input id="developerBatch" value={formData.developerBatch} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2 col-span-full">
                        <Label htmlFor="testEquipment">Test Equipment</Label>
                        <Input id="testEquipment" value={formData.testEquipment} onChange={handleInputChange} />
                    </div>
                </div>
            )}
            
            {currentStep === 2 && (
                <div className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Test Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label htmlFor="subjectIdentification">Subject Identification</Label>
                                    <Input id="subjectIdentification" value={newTestResult.subjectIdentification} onChange={handleNewResultChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jointNo">Joint No.</Label>
                                    <Input id="jointNo" value={newTestResult.jointNo} onChange={handleNewResultChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weldId">Weld/Part ID</Label>
                                    <Input id="weldId" value={newTestResult.weldId} onChange={handleNewResultChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diameter">Diameter</Label>
                                    <Input id="diameter" value={newTestResult.diameter} onChange={handleNewResultChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="thickness">Thickness (mm)</Label>
                                    <Input id="thickness" value={newTestResult.thickness} onChange={handleNewResultChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="linearIndication">Linear Indication (mm)</Label>
                                    <Input id="linearIndication" value={newTestResult.linearIndication} onChange={handleNewResultChange} placeholder="e.g., 5mm or N/A" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="roundIndication">Round Indication (mm)</Label>
                                    <Input id="roundIndication" value={newTestResult.roundIndication} onChange={handleNewResultChange} placeholder="e.g., 2mm or N/A" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="result">Result</Label>
                                    <Select value={newTestResult.result} onValueChange={(value) => handleNewResultSelectChange('result', value)}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Accept">Accept</SelectItem>
                                            <SelectItem value="Reject">Reject</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="col-span-full space-y-2 mt-4">
                                <Label>Evidence Images</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                                        </div>
                                        <Input id="image-upload" type="file" className="hidden" multiple onChange={handleNewResultImageChange} accept="image/*" />
                                    </label>
                                </div>
                                {newTestResultImagePreviews.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {newTestResultImagePreviews.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square w-full overflow-hidden rounded-md border">
                                                    <Image
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        width={100}
                                                        height={100}
                                                        className="h-full w-full object-cover"
                                                        data-ai-hint="test result"
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeNewResultImage(index)}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate mt-1">{newTestResult.images[index]?.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button onClick={handleAddResult}>Add Result</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Results Summary</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject ID</TableHead>
                                    <TableHead>Joint No.</TableHead>
                                    <TableHead>Weld/Part ID</TableHead>
                                    <TableHead>Images</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {formData.testResults.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.subjectIdentification}</TableCell>
                                        <TableCell>{result.jointNo}</TableCell>
                                        <TableCell>{result.weldId}</TableCell>
                                        <TableCell>{(result.imageUrls?.length || 0) + (result.images?.length || 0)}</TableCell>
                                        <TableCell>
                                            <Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => removeTestResult(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {formData.testResults.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No results added yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="pt-6 space-y-6">
                    <h2 className="text-xl font-bold">Report Summary</h2>
                    <p>Please review all the information below before saving the changes.</p>
                    
                    <Card>
                        <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div><p className="font-medium text-muted-foreground">Client</p><p>{formData.client}</p></div>
                            <div><p className="font-medium text-muted-foreground">Service Order</p><p>{formData.soNumber}</p></div>
                            <div><p className="font-medium text-muted-foreground">Project Executor</p><p>{formData.projectExecutor}</p></div>
                            <div><p className="font-medium text-muted-foreground">Project</p><p>{formData.project}</p></div>
                            <div><p className="font-medium text-muted-foreground">Job Location</p><p>{formData.jobLocation}</p></div>
                            <div><p className="font-medium text-muted-foreground">Date of Test</p><p>{formData.dateOfTest ? format(formData.dateOfTest, 'PPP') : 'N/A'}</p></div>
                            <div><p className="font-medium text-muted-foreground">Report Number</p><p>{formData.reportNumber}</p></div>
                            <div><p className="font-medium text-muted-foreground">Line Type</p><p>{formData.lineType}</p></div>
                             <div><p className="font-medium text-muted-foreground">Created By</p><p>{originalReport.approvalHistory?.[0]?.actorName || 'N/A'}</p></div>
                            <div><p className="font-medium text-muted-foreground">Date of Creation</p><p>{originalReport.creationDate ? format(new Date(originalReport.creationDate), 'PPP') : 'N/A'}</p></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                           <div><p className="font-medium text-muted-foreground">Procedure No.</p><p>{formData.procedureNo}</p></div>
                           <div><p className="font-medium text-muted-foreground">Acceptance Criteria</p><p>{formData.acceptanceCriteria}</p></div>
                           <div><p className="font-medium text-muted-foreground">Visual Inspection</p><p>{formData.visualInspection}</p></div>
                           <div><p className="font-medium text-muted-foreground">Surface Condition</p><p>{formData.surfaceCondition}</p></div>
                           <div><p className="font-medium text-muted-foreground">Examination Stage</p><p>{formData.examinationStage}</p></div>
                           <div><p className="font-medium text-muted-foreground">Material</p><p>{formData.material}</p></div>
                           <div><p className="font-medium text-muted-foreground">Welding Process</p><p>{formData.weldingProcess}</p></div>
                           <div><p className="font-medium text-muted-foreground">Drawing Number</p><p>{formData.drawingNumber}</p></div>
                           <div><p className="font-medium text-muted-foreground">Test Extent</p><p>{formData.testExtent}</p></div>
                           <div><p className="font-medium text-muted-foreground">Test Temperature</p><p>{formData.testTemperature}</p></div>
                           <div className="col-span-full"><p className="font-medium text-muted-foreground">Test Equipment</p><p>{formData.testEquipment}</p></div>

                           <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Penetrant</h4></div>
                           <div><p className="font-medium text-muted-foreground">Type</p><p>{formData.penetrantType}</p></div>
                           <div><p className="font-medium text-muted-foreground">Brand</p><p>{formData.penetrantBrand}</p></div>
                           <div><p className="font-medium text-muted-foreground">Batch No.</p><p>{formData.penetrantBatch}</p></div>

                           <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Remover</h4></div>
                           <div><p className="font-medium text-muted-foreground">Type</p><p>{formData.removerType}</p></div>
                           <div><p className="font-medium text-muted-foreground">Brand</p><p>{formData.removerBrand}</p></div>
                           <div><p className="font-medium text-muted-foreground">Batch No.</p><p>{formData.removerBatch}</p></div>
                           
                           <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Developer</h4></div>
                           <div><p className="font-medium text-muted-foreground">Type</p><p>{formData.developerType}</p></div>
                           <div><p className="font-medium text-muted-foreground">Brand</p><p>{formData.developerBrand}</p></div>
                           <div><p className="font-medium text-muted-foreground">Batch No.</p><p>{formData.developerBatch}</p></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject ID</TableHead>
                                        <TableHead>Joint No.</TableHead>
                                        <TableHead>Weld/Part ID</TableHead>
                                        <TableHead>Diameter</TableHead>
                                        <TableHead>Thickness</TableHead>
                                        <TableHead>Linear Ind.</TableHead>
                                        <TableHead>Round Ind.</TableHead>
                                        <TableHead>Images</TableHead>
                                        <TableHead>Result</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.testResults.map((result, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{result.subjectIdentification}</TableCell>
                                            <TableCell>{result.jointNo}</TableCell>
                                            <TableCell>{result.weldId}</TableCell>
                                            <TableCell>{result.diameter}</TableCell>
                                            <TableCell>{result.thickness}</TableCell>
                                            <TableCell>{result.linearIndication}</TableCell>
                                            <TableCell>{result.roundIndication}</TableCell>
                                            <TableCell>{(result.imageUrls?.length || 0) + (result.images?.length || 0)}</TableCell>
                                            <TableCell><Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                    {formData.testResults.length === 0 && (
                                        <TableRow><TableCell colSpan={9} className="text-center">No results added.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <div>
                {currentStep > 0 && (
                     <Button variant="outline" onClick={prev}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                )}
            </div>
            <div>
                 {currentStep < steps.length - 1 && (
                    <Button onClick={next}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                 {currentStep === steps.length - 1 && (
                     <Button onClick={handleSave}>
                        <Check className="h-4 w-4 mr-2" /> Save Changes
                    </Button>
                 )}
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
