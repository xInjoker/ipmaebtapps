

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { useReports } from '@/context/ReportContext';
import { type ReportItem, type ReportDetails, RadiographicFinding, PenetrantTestReportDetails, MagneticParticleTestReportDetails, UltrasonicTestReportDetails, RadiographicTestReportDetails, FlashReportDetails } from '@/lib/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, FileText, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { UserOptions, CellHookData } from 'jspdf-autotable';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getFileNameFromDataUrl } from '@/lib/utils';
import { DocumentViewerDialog } from '@/components/document-viewer-dialog';


// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

type DocumentToView = {
    url: string;
    name: string;
}

// --- Reusable Image Gallery ---
const ImageGallery = ({ allImages }: { allImages: { url: string, jointNo: string, weldId: string }[] }) => {
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
                                                    <NextImage src={image.url} alt={`Image for Joint ${image.jointNo}`} width={400} height={225} className="h-full w-full object-cover" data-ai-hint="test result" />
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
                                            <NextImage src={image.url} alt={`Enlarged evidence image for Joint ${image.jointNo}`} width={1280} height={720} className="h-auto w-full object-contain rounded-lg" />
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

const FlashReportDetailsView = ({ details, setDocumentToView }: { details: FlashReportDetails, setDocumentToView: (doc: DocumentToView) => void; }) => {
    
    const downloadFile = (url: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
        <Card>
            <CardHeader><CardTitle>Inspection Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div><div className="font-medium text-muted-foreground">Inspection Item</div><div>{details.inspectionItem}</div></div>
                <div><div className="font-medium text-muted-foreground">Quantity</div><div>{details.quantity}</div></div>
                <div><div className="font-medium text-muted-foreground">Manufacturer/Vendor</div><div>{details.vendorName}</div></div>
                <div><div className="font-medium text-muted-foreground">Inspector Name</div><div>{details.inspectorName}</div></div>
                <div><div className="font-medium text-muted-foreground">Location (City)</div><div>{details.locationCity}</div></div>
                <div><div className="font-medium text-muted-foreground">Location (Province)</div><div>{details.locationProvince}</div></div>
                <div className="col-span-full"><div className="font-medium text-muted-foreground">Item Description</div><div className="whitespace-pre-wrap">{details.itemDescription}</div></div>
            </CardContent>
        </Card>
        {(details.documentUrls && details.documentUrls.length > 0) && (
            <Card>
                <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    {details.documentUrls.map((url, index) => {
                        const name = getFileNameFromDataUrl(url) || `Document ${index + 1}`;
                        return (
                             <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm truncate">{name}</span>
                                </div>
                                <div>
                                    <Button variant="ghost" size="sm" onClick={() => setDocumentToView({ url, name })}><Eye className="mr-2 h-4 w-4" />View</Button>
                                    <Button variant="ghost" size="icon" onClick={() => downloadFile(url, name)}><Download className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        )}
        </>
    )
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
    'Flash Report': {
        DetailsCard: FlashReportDetailsView,
        ResultsView: () => null, // Flash reports don't have a separate results table
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
    const [documentToView, setDocumentToView] = useState<DocumentToView | null>(null);
    const logoUrl = 'https://placehold.co/120x60.png';
    // Base64 for a simple 100x100 grey placeholder with a border
    const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAB5QTFRF////bW1tgICAlZWVjo6OioqKh4eHd3d3dXV1fX19rI1EEgAAAAd0Uk5T/wD/AP8A/wD/AP8A2I/eKwAAAMdJREFUeJzt1ssRwyAMBEFUIbL//+mGSDuIJAk2eJ9kG8IuZVme5wV04sSJEydOnDhx4sSJEycuGZ1t249oeN5/b9s2D7j+4dG2fQ/Y9b+3bdu3gG1/2rZtXwG2/W/btm1fALb9adq2/QfY9pdt2/YfYNN/Jm3bnwJ2/WPaNn8N2PWXats8Auy6/2rbXAWs+sW0bS8CVn0sbcsuYNYX0rJsD/7qg6RIkuSYJEmSJClJkpEkSZIkSZIkyT8LfAFTGxgwB8s98gAAAABJRU5ErkJggg==';

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
            ["Service Order", (details as any).soNumber || 'N/A', "Job Location", report.jobLocation],
            ["Date of Test", (details as any).dateOfTest ? format(new Date((details as any).dateOfTest), 'PPP') : 'N/A', "Project Executor", (details as any).projectExecutor || 'N/A'],
        ];
        doc.autoTable({
            startY: finalY,
            body: generalInfo,
            theme: 'plain',
            styles: { fontSize: 9 },
        });
        finalY = (doc as any).lastAutoTable.finalY + 5;
    
        // --- Report-specific Details & Results ---
        if (details.jobType === 'Penetrant Test') {
            doc.autoTable({
                head: [['Test Details']],
                body: [
                    ['Procedure No.', details.procedureNo],
                    ['Acceptance Criteria', details.acceptanceCriteria],
                    ['Test Equipment', details.testEquipment],
                    ['Material', details.material],
                ],
                startY: finalY, theme: 'striped', headStyles: { fillColor: [22, 163, 74] }, styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;

            doc.autoTable({
                head: [['Item', 'Type', 'Brand', 'Batch No.']],
                body: [
                    ['Penetrant', details.penetrantType, details.penetrantBrand, details.penetrantBatch],
                    ['Remover', details.removerType, details.removerBrand, details.removerBatch],
                    ['Developer', details.developerType, details.developerBrand, details.developerBatch],
                ],
                startY: finalY, theme: 'grid', styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;

             doc.autoTable({
                head: [['Subject ID', 'Joint No.', 'Weld/Part ID', 'Linear Ind.', 'Round Ind.', 'Result']],
                body: details.testResults.map(r => [r.subjectIdentification, r.jointNo, r.weldId, r.linearIndication, r.roundIndication, r.result]),
                startY: finalY + 5, theme: 'grid', headStyles: { fillColor: [41, 128, 185] }, styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;
        } else if (details.jobType === 'Magnetic Particle Test') {
             doc.autoTable({
                head: [['Test Details']],
                body: [
                    ['Procedure No.', details.procedureNo],
                    ['Acceptance Criteria', details.acceptanceCriteria],
                    ['Magnetization Technique', details.magnetizationTechnique],
                    ['Current Type / Amperage', `${details.currentType} / ${details.amperage}`],
                    ['Magnetic Particles', `${details.magneticParticlesType} (${details.particleBrand})`],
                    ['Equipment', details.equipment],
                ],
                startY: finalY, theme: 'striped', headStyles: { fillColor: [22, 163, 74] }, styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;
             doc.autoTable({
                head: [['Subject ID', 'Joint No.', 'Indication Details', 'Result']],
                body: details.testResults.map(r => [r.subjectIdentification, r.jointNo, r.indicationDetails, r.result]),
                startY: finalY + 5, theme: 'grid', headStyles: { fillColor: [41, 128, 185] }, styles: { fontSize: 9 },
            });
        } else if (details.jobType === 'Ultrasonic Test') {
            doc.autoTable({
                head: [['Test Details']],
                body: [
                    ['Procedure No.', details.procedureNo],
                    ['Acceptance Criteria', details.acceptanceCriteria],
                    ['Equipment', details.equipment],
                    ['Transducer', details.transducer],
                    ['Calibration Block', details.calibrationBlock],
                    ['Couplant', details.couplant],
                ],
                startY: finalY, theme: 'striped', headStyles: { fillColor: [22, 163, 74] }, styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;
             doc.autoTable({
                head: [['Joint No.', 'Weld ID', 'Thickness', 'Discontinuity', 'Remarks', 'Result']],
                body: details.testResults.map(r => [r.jointNo, r.weldId, r.thickness, r.discontinuityType, r.remarks, r.result]),
                startY: finalY + 5, theme: 'grid', headStyles: { fillColor: [41, 128, 185] }, styles: { fontSize: 9 },
            });
        } else if (details.jobType === 'Radiographic Test') {
             doc.autoTable({
                head: [['Test Details']],
                body: [
                    ['Procedure No.', details.procedureNo],
                    ['Acceptance Criteria', details.acceptanceCriteria],
                    ['Technique', details.technique],
                    ['Source', `${details.source} (${details.sourceSize})`],
                    ['SFD', details.sfd],
                    ['Screens', details.screens],
                ],
                startY: finalY, theme: 'striped', headStyles: { fillColor: [22, 163, 74] }, styles: { fontSize: 9 },
            });
            finalY = (doc as any).lastAutoTable.finalY;
             doc.autoTable({
                head: [['Joint No.', 'Film Location', 'Weld Indication', 'Remarks', 'Result']],
                body: details.testResults.flatMap(r => r.findings.map(f => [r.jointNo, f.filmLocation, f.weldIndication.join(', '), f.remarks, f.result])),
                startY: finalY + 5, theme: 'grid', headStyles: { fillColor: [41, 128, 185] }, styles: { fontSize: 9 },
            });
        }

        const getBase64Image = async (url: string): Promise<string> => {
            if (!url) return placeholderImage;
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Image fetch failed');
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error("Failed to fetch image, using placeholder.", error);
                return placeholderImage;
            }
        };

        // --- Image Section ---
        const allImages = (details as any).testResults?.flatMap((result: any) =>
            (result.imageUrls || []).map((url: string) => ({
                url,
                caption: `Joint: ${result.jointNo} / Weld ID: ${result.weldId}`
            }))
        ) || [];

        if (allImages.length > 0) {
            finalY = (doc as any).lastAutoTable.finalY;
            if (finalY + 15 > pageHeight - 10) {
                doc.addPage();
                finalY = pageMargin;
            }
            doc.setFontSize(12);
            doc.text('Evidence Images', pageMargin, finalY + 10);
            finalY += 15;

            const contentWidth = pageWidth - 2 * pageMargin;
            const columnWidth = (contentWidth - 10) / 2;
            let currentX = pageMargin;
            let rowMaxHeight = 0;
            let rowStartY = finalY;

            for (let i = 0; i < allImages.length; i++) {
                const image = allImages[i];
                const isLeftColumn = i % 2 === 0;

                const base64Img = await getBase64Image(image.url);
                const img = new Image();
                img.src = base64Img;
                await new Promise(resolve => { img.onload = resolve; });

                const imgHeight = (img.height * columnWidth) / img.width;

                if (isLeftColumn) {
                    currentX = pageMargin;
                    rowMaxHeight = 0; // Reset max height for new row
                    rowStartY = finalY;
                    if (finalY + imgHeight + 10 > pageHeight - 20) {
                        doc.addPage();
                        finalY = pageMargin;
                        rowStartY = finalY;
                    }
                } else {
                    currentX = pageMargin + columnWidth + 10;
                }
                
                doc.addImage(base64Img, 'PNG', currentX, finalY, columnWidth, imgHeight);
                doc.setFontSize(8);
                doc.text(image.caption, currentX, finalY + imgHeight + 4);

                rowMaxHeight = Math.max(rowMaxHeight, imgHeight + 10);

                if (!isLeftColumn || i === allImages.length - 1) {
                    finalY = rowStartY + rowMaxHeight;
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
    
    let backPath = '/reports';
    if (report.jobType === 'Magnetic Particle Test') backPath = '/reports/magnetic';
    else if (report.jobType === 'Penetrant Test') backPath = '/reports/penetrant';
    else if (report.jobType === 'Ultrasonic Test') backPath = '/reports/ultrasonic';
    else if (report.jobType === 'Radiographic Test') backPath = '/reports/radiographic';
    else if (report.jobType === 'Flash Report') backPath = '/reports/flash';
    
    const details = report.details;
    const creator = report.approvalHistory?.[0];
    
    const ReportComponents = details?.jobType ? reportTypeMap[details.jobType] : null;

    return (
        <>
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
                                {details.jobType !== 'Flash Report' && <div><div className="font-medium text-muted-foreground">Service Order</div><div>{(details as any).soNumber || 'N/A'}</div></div>}
                                {details.jobType !== 'Flash Report' && <div><div className="font-medium text-muted-foreground">Project Executor</div><div>{(details as any).projectExecutor}</div></div>}
                                <div><div className="font-medium text-muted-foreground">Project</div><div>{details.project || 'N/A'}</div></div>
                                <div><div className="font-medium text-muted-foreground">Date of Test</div><div>{(details as any).dateOfTest ? format(new Date((details as any).dateOfTest), 'PPP') : 'N/A'}</div></div>
                            </>}
                            <div><div className="font-medium text-muted-foreground">Job Location</div><div>{report.jobLocation}</div></div>
                            <div><div className="font-medium text-muted-foreground">Date of Creation</div><div>{report.creationDate ? format(new Date(report.creationDate), 'PPP') : 'N/A'}</div></div>
                            <div><div className="font-medium text-muted-foreground">Report Number</div><div>{report.reportNumber}</div></div>
                            <div><div className="font-medium text-muted-foreground">Line Type</div><div>{report.lineType}</div></div>
                            {creator && <div><div className="font-medium text-muted-foreground">Created By</div><div>{`${creator.actorName} (${creator.actorRole})`}</div></div>}
                        </CardContent>
                    </Card>
                    {ReportComponents && 'DetailsCard' in ReportComponents && (
                        details.jobType === 'Flash Report' 
                        ? <FlashReportDetailsView details={details as FlashReportDetails} setDocumentToView={setDocumentToView} />
                        : <ReportComponents.DetailsCard details={details as any} />
                    )}
                </div>

                {ReportComponents && 'ResultsView' in ReportComponents && report.jobType !== 'Flash Report' ? (
                    <ReportComponents.ResultsView details={details as any} />
                ) : null}
            </div>
        </div>
        {documentToView && (
            <DocumentViewerDialog
                isOpen={!!documentToView}
                onOpenChange={(isOpen) => !isOpen && setDocumentToView(null)}
                documentUrl={documentToView.url}
                documentName={documentToView.name}
            />
        )}
        </>
    );
}
