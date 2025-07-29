

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTenders, type Tender } from '@/context/TenderContext';
import { tenderStatuses, regionalOptions, serviceOptions, type TenderStatus, type Regional } from '@/lib/tenders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar as CalendarIcon, Save, ChevronsUpDown, Check, Upload, File as FileIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { portfolios, subPortfolios, servicesBySubPortfolio } from '@/lib/projects';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Separator } from '@/components/ui/separator';

export default function EditTenderPage() {
    const router = useRouter();
    const params = useParams();
    const tenderId = params.id as string;
    const { getTenderById, updateTender } = useTenders();
    const { toast } = useToast();
    const { branches } = useAuth();
    
    const [tender, setTender] = useState<Tender | null>(null);
    const [newDocuments, setNewDocuments] = useState<File[]>([]);
    const [isServicesPopoverOpen, setIsServicesPopoverOpen] = useState(false);
    
    useEffect(() => {
        if (tenderId) {
            const item = getTenderById(tenderId);
            if (item) {
                setTender({
                    ...item,
                    submissionDate: item.submissionDate ? new Date(item.submissionDate) as any : undefined, // to make it compatible with Calendar
                });
            } else {
                toast({ variant: 'destructive', title: 'Tender not found' });
                router.push('/tenders');
            }
        }
    }, [tenderId, getTenderById, router, toast]);

    const availableServices = useMemo(() => {
        if (!tender?.subPortfolio) return [];
        return servicesBySubPortfolio[tender.subPortfolio as keyof typeof servicesBySubPortfolio] || [];
    }, [tender?.subPortfolio]);

    const availableBranches = useMemo(() => {
        if (!tender?.regional) return [];
        return branches.filter(b => b.region === tender!.regional);
    }, [tender?.regional, branches]);

    const handleRegionalChange = useCallback((value: Regional) => {
        setTender(prev => {
            if (!prev) return null;
            const currentBranch = branches.find(b => b.id === prev.branchId);
            const isBranchInvalid = currentBranch ? currentBranch.region !== value : true;

            return {
                ...prev,
                regional: value,
                branchId: isBranchInvalid ? '' : prev.branchId,
            };
        });
    }, [branches]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    }, []);

    const removeNewDocument = useCallback((index: number) => {
        setNewDocuments(prev => prev.filter((_, i) => i !== index));
    }, []);

    const removeExistingDocument = useCallback((urlToRemove: string) => {
        setTender(prev => {
            if (!prev) return null;
            return {
                ...prev,
                documentUrls: prev.documentUrls?.filter(url => url !== urlToRemove),
            };
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (!tender) return;
        if (!tender.tenderNumber || !tender.title || !tender.client || !tender.status || !tender.submissionDate) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields.' });
            return;
        }

        const updatedTenderData = {
            ...tender,
            submissionDate: format(new Date(tender.submissionDate), 'yyyy-MM-dd'),
            newDocuments,
        };

        await updateTender(tender.id, updatedTenderData);
        toast({ title: 'Tender Updated', description: `Successfully updated tender ${tender.tenderNumber}.` });
        router.push('/tenders');
    }, [tender, newDocuments, router, toast, updateTender]);
    
    if (!tender) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Button asChild variant="outline" size="icon">
                            <Link href="/tenders">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only">Back to Tenders</span>
                            </Link>
                        </Button>
                        <div className="space-y-1.5">
                            <CardTitle>Edit Tender</CardTitle>
                            <CardDescription>Update the details for tender {tender.tenderNumber}.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Classification & Location</h3>
                        <Separator />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="portfolio">Portfolio</Label>
                                <Select value={tender.portfolio} onValueChange={(value: (typeof portfolios)[number]) => setTender({ ...tender, portfolio: value })}>
                                    <SelectTrigger id="portfolio"><SelectValue placeholder="Select a portfolio" /></SelectTrigger>
                                    <SelectContent>{portfolios.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subPortfolio">Sub-Portfolio</Label>
                                <Select value={tender.subPortfolio} onValueChange={(value: (typeof subPortfolios)[number]) => setTender({ ...tender, subPortfolio: value, serviceCode: '', serviceName: '' })}>
                                    <SelectTrigger id="subPortfolio"><SelectValue placeholder="Select a sub-portfolio" /></SelectTrigger>
                                    <SelectContent>{subPortfolios.map(sp => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serviceCode">Service Code</Label>
                                <Select
                                    value={tender.serviceCode}
                                    onValueChange={(value) => {
                                        const service = availableServices.find(s => s.code === value);
                                        setTender({ ...tender, serviceCode: value, serviceName: service?.name || '' });
                                    }}
                                    disabled={!tender.subPortfolio}
                                >
                                    <SelectTrigger id="serviceCode"><SelectValue placeholder="Select a service code" /></SelectTrigger>
                                    <SelectContent>{availableServices.map(s => <SelectItem key={s.code} value={s.code}>{s.code}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serviceName">Service Name</Label>
                                <Select
                                    value={tender.serviceName}
                                    onValueChange={(value) => {
                                        const service = availableServices.find(s => s.name === value);
                                        setTender({ ...tender, serviceName: value, serviceCode: service?.code || '' });
                                    }}
                                    disabled={!tender.subPortfolio}
                                >
                                    <SelectTrigger id="serviceName"><SelectValue placeholder="Select a service name" /></SelectTrigger>
                                    <SelectContent>{availableServices.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="regional">Regional</Label>
                                <Select value={tender.regional} onValueChange={handleRegionalChange}>
                                    <SelectTrigger id="regional"><SelectValue placeholder="Select region" /></SelectTrigger>
                                    <SelectContent>
                                        {regionalOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branch">Branch</Label>
                                <Select value={tender.branchId} onValueChange={(value) => setTender({ ...tender, branchId: value })} disabled={!tender.regional}>
                                    <SelectTrigger id="branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                                    <SelectContent>
                                        {availableBranches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Tender Identification</h3>
                        <Separator />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="tenderNumber">Tender Number</Label>
                                <Input id="tenderNumber" value={tender.tenderNumber} onChange={e => setTender({ ...tender, tenderNumber: e.target.value })} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="title">Tender Title</Label>
                                <Textarea id="title" value={tender.title} onChange={(e) => setTender({ ...tender, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Input id="client" value={tender.client} onChange={e => setTender({ ...tender, client: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="principal">Principal</Label>
                                <Input id="principal" value={tender.principal} onChange={e => setTender({ ...tender, principal: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Tender Details</h3>
                        <Separator />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={tender.status} onValueChange={(value: TenderStatus) => setTender({ ...tender, status: value })}>
                                    <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        {tenderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="submissionDate">Submission Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="submissionDate"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !tender.submissionDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {tender.submissionDate ? format(new Date(tender.submissionDate), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={tender.submissionDate as any}
                                            onSelect={(date) => setTender({ ...tender, submissionDate: date as any })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="personInCharge">Person In Charge (PIC)</Label>
                                <Input id="personInCharge" value={tender.personInCharge} onChange={e => setTender({ ...tender, personInCharge: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="services">Services (Legacy)</Label>
                                <Popover open={isServicesPopoverOpen} onOpenChange={setIsServicesPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isServicesPopoverOpen}
                                            className="w-full justify-between font-normal"
                                        >
                                            {tender.services || "Select or type a service..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search or type service..."
                                                value={tender.services}
                                                onValueChange={(value) => setTender(prev => ({...prev!, services: value}))}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No service found.</CommandEmpty>
                                                <CommandGroup>
                                                    {serviceOptions.map((option) => (
                                                        <CommandItem
                                                            key={option}
                                                            value={option}
                                                            onSelect={(currentValue) => {
                                                                setTender(prev => ({ ...prev!, services: currentValue === prev!.services ? "" : currentValue }));
                                                                setIsServicesPopoverOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    tender.services?.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
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
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={tender.description} onChange={(e) => setTender({ ...tender, description: e.target.value })} />
                            </div>
                        </div>
                    </div>

                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Financial Information</h3>
                        <Separator />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="ownerEstimatePrice">Owner Estimate Price (IDR)</Label>
                                <CurrencyInput id="ownerEstimatePrice" value={tender.ownerEstimatePrice || 0} onValueChange={value => setTender({ ...tender, ownerEstimatePrice: value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bidPrice">Bid Price (IDR)</Label>
                                <CurrencyInput id="bidPrice" value={tender.bidPrice} onValueChange={value => setTender({ ...tender, bidPrice: value })} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Supporting Documents</h3>
                        <Separator />
                         <div className="space-y-2">
                            <div className="mt-2 space-y-2">
                                {tender.documentUrls?.map((url, index) => (
                                    <div key={`existing-doc-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm truncate">{url.split(';base64,').pop()?.substring(0, 40) || 'Uploaded Document'}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingDocument(url)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {newDocuments.map((file, index) => (
                                    <div key={`new-doc-${index}`} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm truncate">{file.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewDocument(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center w-full mt-4">
                                <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-muted-foreground">Any file type</p>
                                    </div>
                                    <Input id="document-upload" type="file" className="hidden" multiple onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/tenders">Cancel</Link>
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
