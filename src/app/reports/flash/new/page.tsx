
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Calendar as CalendarIcon, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

export default function NewFlashReportPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [reportNumber, setReportNumber] = useState('');
    const [inspectionDate, setInspectionDate] = useState<Date | undefined>();
    const [inspectionItem, setInspectionItem] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [itemDescription, setItemDescription] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [inspectorName, setInspectorName] = useState('');
    const [locationCity, setLocationCity] = useState('');
    const [locationProvince, setLocationProvince] = useState('');
    
    const handleSave = () => {
        // Basic validation
        if (!reportNumber || !inspectionDate || !inspectionItem || !quantity) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all required fields.',
            });
            return;
        }

        console.log({
            reportNumber,
            inspectionDate: inspectionDate ? format(inspectionDate, 'yyyy-MM-dd') : null,
            inspectionItem,
            quantity,
            itemDescription,
            vendorName,
            inspectorName,
            locationCity,
            locationProvince,
        });
        
        toast({
            title: 'Report Saved (Simulated)',
            description: 'Flash Report data has been logged to the console.',
        });
        router.push('/reports');
    };

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
