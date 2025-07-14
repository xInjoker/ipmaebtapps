

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as NextImage from 'next/image';
import { useReports } from '@/context/ReportContext';
import { type ReportItem, type ReportDetails, RadiographicFinding } from '@/lib/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions, CellHookData } from 'jspdf-autotable';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';


// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}


// --- Reusable Image Gallery ---
const ImageGallery = ({ allImages }: { allImages: { url: string, jointNo: string, weldId: string }[] }) => {
    const Image = NextImage.default;
    return (
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
                                                    <div className="font-medium truncate">Joint: {image.jointNo} / Weld ID: {image.weldId}</div>
                                                </CardFooter>
                                            </Card>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl p-0 border-0">
                                            <DialogHeader className="sr-only">
                                                <DialogTitle>Enlarged Image</DialogTitle>
                                                <DialogDescription>
                                                    Enlarged view of the evidence image for Joint {image.jointNo} / Weld ID: {image.weldId}.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Image src={image.url} alt={`Enlarged evidence image for Joint ${image.jointNo}`} width={1280} height={720} className="h-auto w-full object-contain rounded-lg" />
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
};

// --- Detail Components Refactored ---

const PenetrantTestDetailsCard = ({ details }: { details: Extract<ReportDetails, { jobType: 'Penetrant Test' }> }) => (
    <Card>
        <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><div className="font-medium text-muted-foreground">Procedure No.</div><div>{details.procedureNo}</div></div>
            <div><div className="font-medium text-muted-foreground">Acceptance Criteria</div><div>{details.acceptanceCriteria}</div></div>
            <div><div className="font-medium text-muted-foreground">Visual Inspection</div><div>{details.visualInspection}</div></div>
            <div><div className="font-medium text-muted-foreground">Surface Condition</div><div>{details.surfaceCondition}</div></div>
            <div><div className="font-medium text-muted-foreground">Examination Stage</div><div>{details.examinationStage}</div></div>
            <div><div className="font-medium text-muted-foreground">Material</div><div>{details.material}</div></div>
            <div><div className="font-medium text-muted-foreground">Welding Process</div><div>{details.weldingProcess}</div></div>
            <div><div className="font-medium text-muted-foreground">Drawing Number</div><div>{details.drawingNumber}</div></div>
            <div><div className="font-medium text-muted-foreground">Test Extent</div><div>{details.testExtent}</div></div>
            <div><div className="font-medium text-muted-foreground">Test Temperature</div><div>{details.testTemperature}</div></div>
            <div className="col-span-full"><div className="font-medium text-muted-foreground">Test Equipment</div><div>{details.testEquipment}</div></div>

            <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Penetrant</h4></div>
            <div><div className="font-medium text-muted-foreground">Type</div><div>{details.penetrantType}</div></div>
            <div><div className="font-medium text-muted-foreground">Brand</div><div>{details.penetrantBrand}</div></div>
            <div><div className="font-medium text-muted-foreground">Batch No.</div><div>{details.penetrantBatch}</div></div>

            <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Remover</h4></div>
            <div><div className="font-medium text-muted-foreground">Type</div><div>{details.removerType}</div></div>
            <div><div className="font-medium text-muted-foreground">Brand</div><div>{details.removerBrand}</div></div>
            <div><div className="font-medium text-muted-foreground">Batch No.</div><div>{details.removerBatch}</div></div>

            <div className="col-span-full"><h4 className="font-semibold text-base mt-2">Developer</h4></div>
            <div><div className="font-medium text-muted-foreground">Type</div><div>{details.developerType}</div></div>
            <div><div className="font-medium text-muted-foreground">Brand</div><div>{details.developerBrand}</div></div>
            <div><div className="font-medium text-muted-foreground">Batch No.</div><div>{details.developerBatch}</div></div>
        </CardContent>
    </Card>
);

const PenetrantTestResultsView = ({ details }: { details: Extract<ReportDetails, { jobType: 'Penetrant Test' }> }) => {
    const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );
    return (
        <div className="space-y-6">
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

const MagneticParticleTestDetailsCard = ({ details }: { details: Extract<ReportDetails, { jobType: 'Magnetic Particle Test' }> }) => (
    <Card>
        <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><div className="font-medium text-muted-foreground">Procedure No.</div><div>{details.procedureNo}</div></div>
            <div><div className="font-medium text-muted-foreground">Acceptance Criteria</div><div>{details.acceptanceCriteria}</div></div>
            <div><div className="font-medium text-muted-foreground">Magnetization Technique</div><div>{details.magnetizationTechnique}</div></div>
            <div><div className="font-medium text-muted-foreground">Current Type</div><div>{details.currentType}</div></div>
            <div><div className="font-medium text-muted-foreground">Amperage</div><div>{details.amperage}</div></div>
            <div><div className="font-medium text-muted-foreground">Particles Type</div><div>{details.magneticParticlesType}</div></div>
            <div><div className="font-medium text-muted-foreground">Particle Brand/Batch</div><div>{details.particleBrand} / {details.particleBatch}</div></div>
            <div><div className="font-medium text-muted-foreground">Equipment</div><div>{details.equipment}</div></div>
        </CardContent>
    </Card>
);

const MagneticParticleTestResultsView = ({ details }: { details: Extract<ReportDetails, { jobType: 'Magnetic Particle Test' }> }) => {
    const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );
    return (
        <div className="space-y-6">
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

const UltrasonicTestDetailsCard = ({ details }: { details: Extract<ReportDetails, { jobType: 'Ultrasonic Test' }> }) => (
    <Card>
        <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><div className="font-medium text-muted-foreground">Procedure No.</div><div>{details.procedureNo}</div></div>
            <div><div className="font-medium text-muted-foreground">Acceptance Criteria</div><div>{details.acceptanceCriteria}</div></div>
            <div><div className="font-medium text-muted-foreground">Examination Stage</div><div>{details.examinationStage}</div></div>
            <div><div className="font-medium text-muted-foreground">Drawing Number</div><div>{details.drawingNumber}</div></div>
            <div><div className="font-medium text-muted-foreground">Material</div><div>{details.material}</div></div>
            <div><div className="font-medium text-muted-foreground">Surface Condition</div><div>{details.surfaceCondition}</div></div>
            <div><div className="font-medium text-muted-foreground">Welding Process</div><div>{details.weldingProcess}</div></div>
            <div><div className="font-medium text-muted-foreground">Equipment</div><div>{details.equipment}</div></div>
            <div><div className="font-medium text-muted-foreground">Transducer</div><div>{details.transducer}</div></div>
            <div><div className="font-medium text-muted-foreground">Calibration Block</div><div>{details.calibrationBlock}</div></div>
            <div><div className="font-medium text-muted-foreground">Couplant</div><div>{details.couplant}</div></div>
            <div><div className="font-medium text-muted-foreground">Scanning Sensitivity</div><div>{details.scanningSensitivity}</div></div>
            <div><div className="font-medium text-muted-foreground">Scanning Technique</div><div>{details.scanningTechnique}</div></div>
        </CardContent>
    </Card>
);

const UltrasonicTestResultsView = ({ details }: { details: Extract<ReportDetails, { jobType: 'Ultrasonic Test' }> }) => {
     const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );
    return (
        <div className="space-y-6">
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

const RadiographicTestDetailsCard = ({ details }: { details: Extract<ReportDetails, { jobType: 'Radiographic Test' }> }) => (
    <Card>
        <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><div className="font-medium text-muted-foreground">Procedure No.</div><div>{details.procedureNo}</div></div>
            <div><div className="font-medium text-muted-foreground">Acceptance Criteria</div><div>{details.acceptanceCriteria}</div></div>
            <div><div className="font-medium text-muted-foreground">Material</div><div>{details.material}</div></div>
            <div><div className="font-medium text-muted-foreground">Technique</div><div>{details.technique}</div></div>
            <div><div className="font-medium text-muted-foreground">Source</div><div>{details.source} ({details.sourceSize})</div></div>
            <div><div className="font-medium text-muted-foreground">Curries</div><div>{details.curries}</div></div>
            <div><div className="font-medium text-muted-foreground">KVP / mA</div><div>{details.kvp || 'N/A'} / {details.mA || 'N/A'}</div></div>
            <div><div className="font-medium text-muted-foreground">SFD</div><div>{details.sfd}</div></div>
            <div><div className="font-medium text-muted-foreground">Screens</div><div>{details.screens}</div></div>
            <div><div className="font-medium text-muted-foreground">Density</div><div>{details.density}</div></div>
            <div><div className="font-medium text-muted-foreground">Penetrameter (IQI)</div><div>{details.penetrameter}</div></div>
            <div><div className="font-medium text-muted-foreground">Camera S/N</div><div>{details.cameraSerialNumber}</div></div>
            <div className="col-span-2"><div className="font-medium text-muted-foreground">Survey Meter S/N</div><div>{details.surveyMeterSerialNumber} (Expires: {details.surveyMeterCertExpDate ? format(new Date(details.surveyMeterCertExpDate), 'PPP') : 'N/A'})</div></div>
        </CardContent>
    </Card>
);

const RadiographicTestResultsView = ({ details }: { details: Extract<ReportDetails, { jobType: 'Radiographic Test' }> }) => {
    const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({ url, jointNo: result.jointNo, weldId: result.weldId }))
    );

    const flattenedResults = details.testResults.flatMap(result =>
        result.findings.map(finding => ({ ...result, ...finding }))
    );

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject ID</TableHead>
                                <TableHead>Joint No.</TableHead>
                                <TableHead>Diameter</TableHead>
                                <TableHead>Thickness</TableHead>
                                <TableHead>Film Size</TableHead>
                                <TableHead>Film Location</TableHead>
                                <TableHead>Weld Indication</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead>Result</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flattenedResults.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.subjectIdentification}</TableCell>
                                    <TableCell>{item.jointNo}</TableCell>
                                    <TableCell>{item.diameter}</TableCell>
                                    <TableCell>{item.thickness}</TableCell>
                                    <TableCell>{item.filmSize}</TableCell>
                                    <TableCell>{item.filmLocation}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.weldIndication.map((ind, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">{ind}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.remarks}</TableCell>
                                    <TableCell><Badge variant={item.result === 'Accept' ? 'green' : 'destructive'}>{item.result}</Badge></TableCell>
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

const reportTypeMap = {
    'Penetrant Test': {
        DetailsCard: PenetrantTestDetailsCard,
        ResultsView: PenetrantTestResultsView,
    },
    'Magnetic Particle Test': {
        DetailsCard: MagneticParticleTestDetailsCard,
        ResultsView: MagneticParticleTestResultsView,
    },
    'Ultrasonic Test': {
        DetailsCard: UltrasonicTestDetailsCard,
        ResultsView: UltrasonicTestResultsView,
    },
    'Radiographic Test': {
        DetailsCard: RadiographicTestDetailsCard,
        ResultsView: RadiographicTestResultsView,
    },
};

// --- Main Page Component ---

export default function ReportDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const reportId = params.id as string;
    const { reports } = useReports();
    const { users } = useAuth();
    const [report, setReport] = useState<ReportItem | null>(null);
    const logoUrl = 'https://placehold.co/120x60.png';
    const Image = NextImage.default;

    useEffect(() => {
        if (reportId) {
            const item = reports.find(r => r.id === reportId);
            setReport(item || null);
        }
    }, [reportId, reports]);

    const handlePrint = async () => {
        if (!report || !report.details) return;
    
        const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
        const details = report.details;
        const pageMargin = 14;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        let finalY = 0; // Keep track of the last y position
    
        const drawFooter = (data: CellHookData) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - pageMargin, pageHeight - 10, { align: 'right' });
        };
    
        // --- Header with Logo ---
        doc.addImage(logoUrl, 'PNG', pageWidth - pageMargin - 30, 15, 30, 15);
        doc.setFontSize(16);
        doc.text(`${report.jobType} Report`, pageMargin, 22, { align: 'left' });
        doc.setFontSize(10);
        doc.text(`Report Number: ${report.reportNumber}`, pageMargin, 30, { align: 'left' });
        finalY = 40; // Set Y position after header
    
        // --- General Info Table ---
        const generalInfo = [
            ["Client", details.client, "Project", details.project],
            ["Service Order", details.soNumber || 'N/A', "Job Location", report.jobLocation],
            ["Date of Test", details.dateOfTest ? format(new Date(details.dateOfTest), 'PPP') : 'N/A', "Project Executor", details.projectExecutor],
        ];
        doc.autoTable({
            startY: finalY,
            body: generalInfo,
            theme: 'plain',
            styles: { fontSize: 9 },
        });
        finalY = (doc as any).lastAutoTable.finalY;
    
        // --- Report-specific Details & Results ---
        if (details.jobType === 'Penetrant Test') {
            doc.autoTable({
                head: [['Test Details', '', 'More Test Details', '']],
                body: [
                    ['Procedure No.', details.procedureNo, 'Acceptance Criteria', details.acceptanceCriteria],
                    ['Test Equipment', details.testEquipment, 'Material', details.material],
                ],
                startY: finalY + 5,
                theme: 'striped',
                headStyles: { fillColor: [22, 163, 74] },
                styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;

            doc.autoTable({
                head: [['Item', 'Type', 'Brand', 'Batch No.']],
                body: [
                    ['Penetrant', details.penetrantType, details.penetrantBrand, details.penetrantBatch],
                    ['Remover', details.removerType, details.removerBrand, details.removerBatch],
                    ['Developer', details.developerType, details.developerBrand, details.developerBatch],
                ],
                startY: finalY,
                theme: 'grid',
                styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;

             doc.autoTable({
                head: [['Subject ID', 'Joint No.', 'Weld/Part ID', 'Linear Ind.', 'Round Ind.', 'Result']],
                body: details.testResults.map(r => [r.subjectIdentification, r.jointNo, r.weldId, r.linearIndication, r.roundIndication, r.result]),
                startY: finalY + 5,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185] },
                styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;
        }

        // --- Image Section ---
        const allImages = details.testResults?.flatMap(result =>
            (result.imageUrls || []).map(url => ({
                url,
                caption: `Joint: ${result.jointNo} / Weld ID: ${result.weldId}`
            }))
        ) || [];

        if (allImages.length > 0) {
            finalY = (doc as any).lastAutoTable.finalY;
            if (finalY + 15 > pageHeight - 10) doc.addPage();
            doc.setFontSize(12);
            doc.text('Evidence Images', pageMargin, finalY + 10);
            finalY += 15;

            for (const image of allImages) {
                try {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    
                    const imgPromise = new Promise((resolve, reject) => {
                        img.onload = () => resolve(true);
                        img.onerror = (err) => reject(err);
                    });

                    img.src = image.url;
                    await imgPromise;

                    const imgWidth = 80;
                    const imgHeight = (img.height * imgWidth) / img.width;

                    if (finalY + imgHeight + 10 > pageHeight - 10) {
                        doc.addPage();
                        finalY = pageMargin;
                    }

                    doc.addImage(img, 'PNG', pageMargin, finalY, imgWidth, imgHeight);
                    doc.setFontSize(8);
                    doc.text(image.caption, pageMargin, finalY + imgHeight + 4);
                    finalY += imgHeight + 10;

                } catch (error) {
                    console.error("Error loading image for PDF:", error);
                    if (finalY + 10 > pageHeight - 10) { doc.addPage(); finalY = pageMargin; }
                    doc.setFontSize(8);
                    doc.text(`Error loading image: ${image.caption}`, pageMargin, finalY);
                    finalY += 5;
                }
            }
        }
        
        // --- Signature Block ---
        const signatureTableBody = report.approvalHistory.map(action => {
            const approver = users.find(u => u.name === action.actorName);
            const signatureContent = approver?.signatureUrl
                ? { image: approver.signatureUrl, width: 30, height: 10 }
                : { content: '', styles: { minCellHeight: 12 } };
            
            return [
                { content: `${action.actorRole}\n${action.actorName}`, styles: { halign: 'center', fontSize: 8 } },
                { ...signatureContent, styles: { ...signatureContent.styles, halign: 'center' } },
                { content: `Date: ${format(new Date(action.timestamp), 'dd-MMM-yyyy')}`, styles: { halign: 'center', fontSize: 8 } }
            ];
        });

        const startYForSignature = finalY + 15 > pageHeight - 50 ? 20 : finalY + 15;
        if (finalY + 15 > pageHeight - 50) doc.addPage();
        
        doc.autoTable({
            head: [['Role', 'Signature', 'Date']],
            body: signatureTableBody,
            startY: startYForSignature,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 2, valign: 'middle' },
            didDrawPage: drawFooter,
        });

        doc.save(`Report-${report.reportNumber}.pdf`);
    };

    if (!report) {
        return (
            <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold">Report Not Found</h1>
                <p className="text-muted-foreground">The report you are looking for does not exist.</p>
                <Button asChild className="mt-4"><Link href="/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to Reports</Link></Button>
            </div>
        );
    }
    
    const backPath = report.jobType === 'Magnetic Particle Test' ? '/reports/magnetic' : report.jobType.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const details = report.details;
    const creator = report.approvalHistory?.[0];
    
    const ReportComponents = details?.jobType ? reportTypeMap[details.jobType] : null;

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button asChild variant="outline" size="icon">
                                <Link href={`${backPath}`}>
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="sr-only">Back to Report List</span>
                                </Link>
                            </Button>
                            <div>
                                <CardTitle>{report.jobType} Report: {report.reportNumber}</CardTitle>
                                <CardDescription>Viewing details for the submitted report.</CardDescription>
                            </div>
                        </div>
                        {report.status === 'Approved' && (
                            <Button onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </Button>
                        )}
                    </div>
                </CardHeader>
             </Card>

            <div className="pt-6 space-y-6">
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            {details && <>
                                <div><div className="font-medium text-muted-foreground">Client</div><div>{details.client}</div></div>
                                {details.soNumber && <div><div className="font-medium text-muted-foreground">Service Order</div><div>{details.soNumber}</div></div>}
                                <div><div className="font-medium text-muted-foreground">Project Executor</div><div>{details.projectExecutor}</div></div>
                                <div><div className="font-medium text-muted-foreground">Project</div><div>{details.project}</div></div>
                                <div><div className="font-medium text-muted-foreground">Date of Test</div><div>{details.dateOfTest ? format(new Date(details.dateOfTest), 'PPP') : 'N/A'}</div></div>
                            </>}
                            <div><div className="font-medium text-muted-foreground">Job Location</div><div>{report.jobLocation}</div></div>
                            <div><div className="font-medium text-muted-foreground">Date of Creation</div><div>{report.creationDate ? format(new Date(report.creationDate), 'PPP') : 'N/A'}</div></div>
                            <div><div className="font-medium text-muted-foreground">Report Number</div><div>{report.reportNumber}</div></div>
                            <div><div className="font-medium text-muted-foreground">Line Type</div><div>{report.lineType}</div></div>
                            {creator && <div><div className="font-medium text-muted-foreground">Created By</div><div>{`${creator.actorName} (${creator.actorRole})`}</div></div>}
                        </CardContent>
                    </Card>
                    {ReportComponents && 'DetailsCard' in ReportComponents && <ReportComponents.DetailsCard details={details as any} />}
                </div>

                {ReportComponents && 'ResultsView' in ReportComponents ? (
                    <ReportComponents.ResultsView details={details as any} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>This report type does not have a detailed result view implemented yet.</div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
