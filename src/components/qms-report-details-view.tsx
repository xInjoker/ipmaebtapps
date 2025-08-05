
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type FlashReportDetails, type InspectionReportDetails } from '@/lib/reports';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Eye, Download } from 'lucide-react';
import { getFileNameFromDataUrl } from '@/lib/utils';
import { format } from 'date-fns';

type DocumentToView = {
    url: string;
    name: string;
};

type QmsReportDetailsViewProps = {
    details: FlashReportDetails | InspectionReportDetails;
    setDocumentToView: (doc: DocumentToView) => void;
    report: { reportNumber: string };
};

export function QmsReportDetailsView({ details, setDocumentToView, report }: QmsReportDetailsViewProps) {
    
    const downloadFile = (url: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const isFlashReport = details.jobType === 'Flash Report';
    const isInspectionReport = details.jobType === 'Inspection Report';

    return (
        <Card>
            <CardHeader><CardTitle>Inspection Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {isFlashReport && (
                        <>
                            <div><div className="font-medium text-muted-foreground">Report Number</div><div>{details.reportNumber}</div></div>
                            <div>
                                <div className="font-medium text-muted-foreground">Inspection Date</div>
                                <div>{details.inspectionDate ? format(new Date(details.inspectionDate), 'PPP') : 'N/A'}</div>
                            </div>
                            <div><div className="font-medium text-muted-foreground">Inspection Item</div><div>{details.inspectionItem}</div></div>
                            <div><div className="font-medium text-muted-foreground">Quantity</div><div>{details.quantity}</div></div>
                            <div><div className="font-medium text-muted-foreground">Manufacturer/Vendor</div><div>{details.vendorName}</div></div>
                            <div><div className="font-medium text-muted-foreground">Inspector Name</div><div>{details.inspectorName}</div></div>
                            <div><div className="font-medium text-muted-foreground">Location (City)</div><div>{details.locationCity}</div></div>
                            <div><div className="font-medium text-muted-foreground">Location (Province)</div><div>{details.locationProvince}</div></div>
                            <div className="col-span-full"><div className="font-medium text-muted-foreground">Item Description</div><div className="whitespace-pre-wrap">{details.itemDescription}</div></div>
                        </>
                    )}
                    {isInspectionReport && (
                        <>
                             <div><div className="font-medium text-muted-foreground">Report Number</div><div>{details.reportNumber}</div></div>
                             <div>
                                <div className="font-medium text-muted-foreground">Inspection Dates</div>
                                <div>
                                    {details.startDate ? format(new Date(details.startDate), 'PPP') : 'N/A'} - {details.endDate ? format(new Date(details.endDate), 'PPP') : 'N/A'}
                                </div>
                             </div>
                            <div><div className="font-medium text-muted-foreground">Equipment/Material</div><div>{details.equipmentMaterial}</div></div>
                            <div><div className="font-medium text-muted-foreground">Inspector</div><div>{details.inspector}</div></div>
                            <div><div className="font-medium text-muted-foreground">Travel</div><div>{details.travelType}</div></div>
                            <div><div className="font-medium text-muted-foreground">Location</div><div>{details.locationType}</div></div>
                            <div><div className="font-medium text-muted-foreground">Vendor</div><div>{details.vendor}</div></div>
                            <div><div className="font-medium text-muted-foreground">Sub-vendor</div><div>{details.subVendor}</div></div>
                            <div><div className="font-medium text-muted-foreground">Location (City)</div><div>{details.locationCity}</div></div>
                            <div><div className="font-medium text-muted-foreground">Location (Province)</div><div>{details.locationProvince}</div></div>
                            <div><div className="font-medium text-muted-foreground">Result</div><div><Badge variant={details.result === 'Accept' ? 'green' : 'destructive'}>{details.result}</Badge></div></div>
                        </>
                    )}
                </div>
                {(details.documentUrls && details.documentUrls.length > 0) && (
                    <div>
                        <h4 className="font-semibold mb-2">Attachments</h4>
                        <div className="space-y-2">
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
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
};
