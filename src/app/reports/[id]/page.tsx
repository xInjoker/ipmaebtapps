
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useReports } from '@/context/ReportContext';
import { type ReportItem, type PenetrantTestReportDetails } from '@/lib/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';


export default function ReportDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { reports } = useReports();
    const [report, setReport] = useState<ReportItem | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
                <Button asChild className="mt-4">
                    <Link href="/reports">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Reports
                    </Link>
                </Button>
            </div>
        );
    }

    if (report.jobType !== 'Penetrant Test' || !report.details) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="font-headline text-2xl font-bold">Report {report.reportNumber}</h1>
                        <p className="text-muted-foreground">This report type does not have a detailed view yet.</p>
                    </div>
                </div>
            </div>
        );
    }
    
    const details = report.details as PenetrantTestReportDetails;

    const allImages = details.testResults.flatMap(result =>
        (result.imageUrls || []).map(url => ({
            url,
            jointNo: result.jointNo,
            weldId: result.weldId,
        }))
    );

    return (
        <div className="space-y-6">
             <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/reports">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Reports</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="font-headline text-2xl font-bold">Penetrant Test Report: {report.reportNumber}</h1>
                    <p className="text-muted-foreground">Viewing details for the submitted report.</p>
                </div>
            </div>

            <div className="pt-6 space-y-6">
                <Card>
                    <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div><p className="font-medium text-muted-foreground">Client</p><p>{details.client}</p></div>
                        <div><p className="font-medium text-muted-foreground">Main Contractor</p><p>{details.mainContractor}</p></div>
                        <div><p className="font-medium text-muted-foreground">Project</p><p>{details.project}</p></div>
                        <div><p className="font-medium text-muted-foreground">Job Location</p><p>{report.jobLocation}</p></div>
                        <div><p className="font-medium text-muted-foreground">Date of Test</p><p>{details.dateOfTest ? format(new Date(details.dateOfTest), 'PPP') : 'N/A'}</p></div>
                        <div><p className="font-medium text-muted-foreground">Report Number</p><p>{report.reportNumber}</p></div>
                        <div><p className="font-medium text-muted-foreground">Line Type</p><p>{report.lineType}</p></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Test Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="font-medium text-muted-foreground">Procedure No.</p><p>{details.procedureNo}</p></div>
                        <div><p className="font-medium text-muted-foreground">Acceptance Criteria</p><p>{details.acceptanceCriteria}</p></div>
                        <div><p className="font-medium text-muted-foreground">Visual Inspection</p><p>{details.visualInspection}</p></div>
                        <div><p className="font-medium text-muted-foreground">Surface Condition</p><p>{details.surfaceCondition}</p></div>
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
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Joint No.</TableHead>
                                    <TableHead>Weld/Part ID</TableHead>
                                    <TableHead>Diameter</TableHead>
                                    <TableHead>Thickness</TableHead>
                                    <TableHead>Indication</TableHead>
                                    <TableHead>Images</TableHead>
                                    <TableHead>Result</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {details.testResults.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.jointNo}</TableCell>
                                        <TableCell>{result.weldId}</TableCell>
                                        <TableCell>{result.diameter}</TableCell>
                                        <TableCell>{result.thickness}</TableCell>
                                        <TableCell>{result.indication}</TableCell>
                                        <TableCell>{result.imageUrls.length}</TableCell>
                                        <TableCell><Badge variant={result.result === 'Accept' ? 'green' : 'destructive'}>{result.result}</Badge></TableCell>
                                    </TableRow>
                                ))}
                                {details.testResults.length === 0 && (
                                    <TableRow><TableCell colSpan={7} className="text-center">No results in this report.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                
                {allImages.length > 0 && (
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
                                                <Card className="cursor-pointer" onClick={() => setPreviewImageUrl(image.url)}>
                                                    <CardContent className="flex aspect-video items-center justify-center p-0 rounded-t-lg overflow-hidden">
                                                        <Image
                                                            src={image.url}
                                                            alt={`Image for Joint ${image.jointNo}`}
                                                            width={400}
                                                            height={225}
                                                            className="h-full w-full object-cover"
                                                            data-ai-hint="test result"
                                                        />
                                                    </CardContent>
                                                    <CardFooter className="text-xs p-2 bg-muted/50 rounded-b-lg">
                                                        <p className="font-medium truncate">Joint: {image.jointNo} / Weld ID: {image.weldId}</p>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={!!previewImageUrl} onOpenChange={(isOpen) => !isOpen && setPreviewImageUrl(null)}>
                <DialogContent className="max-w-4xl p-0 border-0">
                    {previewImageUrl && (
                        <Image
                            src={previewImageUrl}
                            alt="Evidence image preview"
                            width={1280}
                            height={720}
                            className="h-auto w-full object-contain rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
