
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useReports } from '@/context/ReportContext';
import { type ReportItem, type ReportDetails } from '@/lib/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

// --- Detail View Components ---

const PenetrantTestDetailsView = ({ details, report }: { details: Extract<ReportDetails, { jobType: 'Penetrant Test' }>, report: ReportItem }) => {
    const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="font-medium text-muted-foreground">Procedure No.</p><p>{details.procedureNo}</p></div>
                    <div><p className="font-medium text-muted-foreground">Acceptance Criteria</p><p>{details.acceptanceCriteria}</p></div>
                    <div><p className="font-medium text-muted-foreground">Visual Inspection</p><p>{details.visualInspection}</p></div>
                    <div><p className="font-medium text-muted-foreground">Surface Condition</p><p>{details.surfaceCondition}</p></div>
                    <div><p className="font-medium text-muted-foreground">Examination Stage</p><p>{details.examinationStage}</p></div>
                    <div><p className="font-medium text-muted-foreground">Material</p><p>{details.material}</p></div>
                    <div><p className="font-medium text-muted-foreground">Welding Process</p><p>{details.weldingProcess}</p></div>
                    <div><p className="font-medium text-muted-foreground">Drawing Number</p><p>{details.drawingNumber}</p></div>
                    <div><p className="font-medium text-muted-foreground">Test Extent</p><p>{details.testExtent}</p></div>
                    <div><p className="font-medium text-muted-foreground">Test Temperature</p><p>{details.testTemperature}</p></div>
                    <div className="col-span-full"><p className="font-medium text-muted-foreground">Test Equipment</p><p>{details.testEquipment}</p></div>

                    <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Penetrant</h4></div>
                    <div><p className="font-medium text-muted-foreground">Type</p><p>{details.penetrantType}</p></div>
                    <div><p className="font-medium text-muted-foreground">Brand</p><p>{details.penetrantBrand}</p></div>
                    <div><p className="font-medium text-muted-foreground">Batch No.</p><p>{details.penetrantBatch}</p></div>

                    <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Remover</h4></div>
                    <div><p className="font-medium text-muted-foreground">Type</p><p>{details.removerType}</p></div>
                    <div><p className="font-medium text-muted-foreground">Brand</p><p>{details.removerBrand}</p></div>
                    <div><p className="font-medium text-muted-foreground">Batch No.</p><p>{details.removerBatch}</p></div>

                    <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Developer</h4></div>
                    <div><p className="font-medium text-muted-foreground">Type</p><p>{details.developerType}</p></div>
                    <div><p className="font-medium text-muted-foreground">Brand</p><p>{details.developerBrand}</p></div>
                    <div><p className="font-medium text-muted-foreground">Batch No.</p><p>{details.developerBatch}</p></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Subject ID</TableHead><TableHead>Joint No.</TableHead><TableHead>Weld/Part ID</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {details.testResults.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell>{result.subjectIdentification}</TableCell><TableCell>{result.jointNo}</TableCell><TableCell>{result.weldId}</TableCell>
                                    <TableCell><Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {allImages.length > 0 && <ImageGallery allImages={allImages} />}
        </div>
    );
};

const MagneticParticleTestDetailsView = ({ details }: { details: Extract<ReportDetails, { jobType: 'Magnetic Particle Test' }> }) => {
    const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="font-medium text-muted-foreground">Procedure No.</p><p>{details.procedureNo}</p></div>
                    <div><p className="font-medium text-muted-foreground">Acceptance Criteria</p><p>{details.acceptanceCriteria}</p></div>
                    <div><p className="font-medium text-muted-foreground">Magnetization Technique</p><p>{details.magnetizationTechnique}</p></div>
                    <div><p className="font-medium text-muted-foreground">Current Type</p><p>{details.currentType}</p></div>
                    <div><p className="font-medium text-muted-foreground">Amperage</p><p>{details.amperage}</p></div>
                    <div><p className="font-medium text-muted-foreground">Particles Type</p><p>{details.magneticParticlesType}</p></div>
                    <div><p className="font-medium text-muted-foreground">Particle Brand/Batch</p><p>{details.particleBrand} / {details.particleBatch}</p></div>
                    <div><p className="font-medium text-muted-foreground">Equipment</p><p>{details.equipment}</p></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Subject ID</TableHead><TableHead>Joint No.</TableHead><TableHead>Indication</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {details.testResults.map((result, index) => (
                                <TableRow key={index}><TableCell>{result.subjectIdentification}</TableCell><TableCell>{result.jointNo}</TableCell><TableCell>{result.indicationDetails}</TableCell><TableCell><Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge></TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {allImages.length > 0 && <ImageGallery allImages={allImages} />}
        </div>
    )
}

const UltrasonicTestDetailsView = ({ details }: { details: Extract<ReportDetails, { jobType: 'Ultrasonic Test' }> }) => {
     const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="font-medium text-muted-foreground">Procedure No.</p><p>{details.procedureNo}</p></div>
                    <div><p className="font-medium text-muted-foreground">Acceptance Criteria</p><p>{details.acceptanceCriteria}</p></div>
                    <div><p className="font-medium text-muted-foreground">Examination Stage</p><p>{details.examinationStage}</p></div>
                    <div><p className="font-medium text-muted-foreground">Drawing Number</p><p>{details.drawingNumber}</p></div>
                    <div><p className="font-medium text-muted-foreground">Material</p><p>{details.material}</p></div>
                    <div><p className="font-medium text-muted-foreground">Surface Condition</p><p>{details.surfaceCondition}</p></div>
                    <div><p className="font-medium text-muted-foreground">Welding Process</p><p>{details.weldingProcess}</p></div>
                    <div><p className="font-medium text-muted-foreground">Equipment</p><p>{details.equipment}</p></div>
                    <div><p className="font-medium text-muted-foreground">Transducer</p><p>{details.transducer}</p></div>
                    <div><p className="font-medium text-muted-foreground">Calibration Block</p><p>{details.calibrationBlock}</p></div>
                    <div><p className="font-medium text-muted-foreground">Couplant</p><p>{details.couplant}</p></div>
                    <div><p className="font-medium text-muted-foreground">Scanning Sensitivity</p><p>{details.scanningSensitivity}</p></div>
                    <div><p className="font-medium text-muted-foreground">Scanning Technique</p><p>{details.scanningTechnique}</p></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead rowSpan={2} className="align-bottom">Subject ID</TableHead>
                                <TableHead rowSpan={2} className="align-bottom">Joint No.</TableHead>
                                <TableHead rowSpan={2} className="align-bottom">Weld ID</TableHead>
                                <TableHead rowSpan={2} className="align-bottom">Thickness</TableHead>
                                <TableHead rowSpan={2} className="align-bottom">Probe Angle</TableHead>
                                <TableHead rowSpan={2} className="align-bottom">Frequency</TableHead>
                                <TableHead colSpan={5} className="text-center border-b">Decibels (dB)</TableHead>
                                <TableHead colSpan={5} className="text-center border-b">Discontinuity Records</TableHead>
                                <TableHead rowSpan={2} className="align-bottom">Remarks</TableHead>
                                <TableHead rowSpan={2} className="align-bottom text-right">Result</TableHead>
                            </TableRow>
                            <TableRow>
                                <TableHead className="text-center">Ref. Level</TableHead>
                                <TableHead className="text-center">Ind. Level</TableHead>
                                <TableHead className="text-center">Attn. Factor</TableHead>
                                <TableHead className="text-center">Ind. Rating</TableHead>
                                <TableHead className="text-center">Scan Level</TableHead>
                                <TableHead className="text-center">Length</TableHead>
                                <TableHead className="text-center">Angular Dist.</TableHead>
                                <TableHead className="text-center">Surface Dist.</TableHead>
                                <TableHead className="text-center">Type</TableHead>
                                <TableHead className="text-center">Depth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {details.testResults.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell>{result.subjectIdentification}</TableCell>
                                    <TableCell>{result.jointNo}</TableCell>
                                    <TableCell>{result.weldId}</TableCell>
                                    <TableCell className="text-center">{result.thickness}</TableCell>
                                    <TableCell className="text-center">{result.probeAngle}</TableCell>
                                    <TableCell className="text-center">{result.frequency}</TableCell>
                                    <TableCell className="text-center">{result.referenceLevelDb}</TableCell>
                                    <TableCell className="text-center">{result.indicationLevelDb}</TableCell>
                                    <TableCell className="text-center">{result.attenuationFactorDb}</TableCell>
                                    <TableCell className="text-center">{result.indicationRating}</TableCell>
                                    <TableCell className="text-center">{result.scanningLevel}</TableCell>
                                    <TableCell className="text-center">{result.length}</TableCell>
                                    <TableCell className="text-center">{result.angularDistance}</TableCell>
                                    <TableCell className="text-center">{result.surfaceDistance}</TableCell>
                                    <TableCell className="text-center">{result.discontinuityType}</TableCell>
                                    <TableCell className="text-center">{result.depth}</TableCell>
                                    <TableCell>{result.remarks}</TableCell>
                                    <TableCell className="text-right"><Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {allImages.length > 0 && <ImageGallery allImages={allImages} />}
        </div>
    )
}

const RadiographicTestDetailsView = ({ details }: { details: Extract<ReportDetails, { jobType: 'Radiographic Test' }> }) => {
    const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="font-medium text-muted-foreground">Procedure No.</p><p>{details.procedureNo}</p></div>
                    <div><p className="font-medium text-muted-foreground">Acceptance Criteria</p><p>{details.acceptanceCriteria}</p></div>
                    <div><p className="font-medium text-muted-foreground">Source</p><p>{details.source} ({details.sourceSize})</p></div>
                    <div><p className="font-medium text-muted-foreground">SFD</p><p>{details.sfd}</p></div>
                    <div><p className="font-medium text-muted-foreground">Exposure</p><p>{details.exposure}</p></div>
                    <div><p className="font-medium text-muted-foreground">Film/Screens</p><p>{details.filmBrandType} / {details.screens}</p></div>
                    <div><p className="font-medium text-muted-foreground">Sensitivity (IQI)</p><p>{details.sensitivityIQI}</p></div>
                    <div><p className="font-medium text-muted-foreground">Density</p><p>{details.density}</p></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Subject ID</TableHead><TableHead>Joint No.</TableHead><TableHead>Defect Type</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {details.testResults.map((result, index) => (
                                <TableRow key={index}><TableCell>{result.subjectIdentification}</TableCell><TableCell>{result.jointNo}</TableCell><TableCell>{result.defectType}</TableCell><TableCell><Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge></TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {allImages.length > 0 && <ImageGallery allImages={allImages} />}
        </div>
    )
}

const ImageGallery = ({ allImages }: { allImages: { url: string, jointNo: string, weldId: string }[] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Evidence Images</CardTitle>
            <CardDescription>A gallery of all images uploaded as evidence for the test results. Click an image to enlarge.</CardDescription>
        </CardHeader>
        <CardContent>
            <Carousel className="w-full" opts={{ align: "start", loop: true }}>
                <CarouselContent className="-ml-4">
                    {allImages.map((image, index) => (
                        <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Card className="cursor-pointer">
                                            <CardContent className="flex aspect-video items-center justify-center p-0 rounded-t-lg overflow-hidden">
                                                <Image src={image.url} alt={`Image for Joint ${image.jointNo}`} width={400} height={225} className="h-full w-full object-cover" data-ai-hint="test result" />
                                            </CardContent>
                                            <CardFooter className="text-xs p-2 bg-muted/50 rounded-b-lg">
                                                <p className="font-medium truncate">Joint: {image.jointNo} / Weld ID: {image.weldId}</p>
                                            </CardFooter>
                                        </Card>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl p-0 border-0">
                                        <Image src={image.url} alt="Evidence image preview" width={1280} height={720} className="h-auto w-full object-contain rounded-lg" />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </CardContent>
    </Card>
);


// --- Main Page Component ---

export default function ReportDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { reports } = useReports();
    const [report, setReport] = useState<ReportItem | null>(null);

    useEffect(() => {
        const reportId = params.id as string;
        if (reportId) {
            const item = reports.find(r => r.id === reportId);
            setReport(item || null);
        }
    }, [params.id, reports]);

    if (!report) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold">Report Not Found</h1>
                <p className="text-muted-foreground">The report you are looking for does not exist.</p>
                <Button asChild className="mt-4"><Link href="/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to Reports</Link></Button>
            </div>
        );
    }

    const getReportListPath = (jobType: ReportItem['jobType']) => {
        switch (jobType) {
            case 'Penetrant Test':
                return '/reports/penetrant';
            case 'Magnetic Particle Test':
                return '/reports/magnetic';
            case 'Ultrasonic Test':
                return '/reports/ultrasonic';
            case 'Radiographic Test':
                return '/reports/radiographic';
            case 'Other':
                return '/reports/other';
            default:
                return '/reports';
        }
    };
    
    const backPath = getReportListPath(report.jobType);
    const details = report.details;
    const creator = report.approvalHistory?.[0];

    const renderDetails = () => {
        if (!details) {
            return <p>This report type does not have a detailed view yet.</p>;
        }
        switch (details.jobType) {
            case 'Penetrant Test':
                return <PenetrantTestDetailsView details={details} report={report} />;
            case 'Magnetic Particle Test':
                return <MagneticParticleTestDetailsView details={details} />;
            case 'Ultrasonic Test':
                return <UltrasonicTestDetailsView details={details} />;
             case 'Radiographic Test':
                return <RadiographicTestDetailsView details={details} />;
            default:
                return <p>This report type does not have a detailed view yet.</p>;
        }
    };

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon"><Link href={backPath}><ArrowLeft className="h-4 w-4" /><span className="sr-only">Back to Report List</span></Link></Button>
                <div>
                    <h1 className="font-headline text-2xl font-bold">{report.jobType} Report: {report.reportNumber}</h1>
                    <p className="text-muted-foreground">Viewing details for the submitted report.</p>
                </div>
            </div>

            <div className="pt-6 space-y-6">
                <Card>
                    <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {details && <>
                            <div><p className="font-medium text-muted-foreground">Client</p><p>{details.client}</p></div>
                            {details.soNumber && <div><p className="font-medium text-muted-foreground">Service Order</p><p>{details.soNumber}</p></div>}
                            <div><p className="font-medium text-muted-foreground">Project Executor</p><p>{details.projectExecutor}</p></div>
                            <div><p className="font-medium text-muted-foreground">Project</p><p>{details.project}</p></div>
                            <div><p className="font-medium text-muted-foreground">Date of Test</p><p>{details.dateOfTest ? format(new Date(details.dateOfTest), 'PPP') : 'N/A'}</p></div>
                        </>}
                        <div><p className="font-medium text-muted-foreground">Job Location</p><p>{report.jobLocation}</p></div>
                        <div><p className="font-medium text-muted-foreground">Date of Creation</p><p>{report.creationDate ? format(new Date(report.creationDate), 'PPP') : 'N/A'}</p></div>
                        <div><p className="font-medium text-muted-foreground">Report Number</p><p>{report.reportNumber}</p></div>
                        <div><p className="font-medium text-muted-foreground">Line Type</p><p>{report.lineType}</p></div>
                         {creator && <div><p className="font-medium text-muted-foreground">Created By</p><p>{`${creator.actorName} (${creator.actorRole})`}</p></div>}
                    </CardContent>
                </Card>

                {renderDetails()}
            </div>
        </div>
    );
}
