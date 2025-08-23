

'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenders, type Tender } from '@/context/TenderContext';
import { tenderStatuses, regionalOptions, serviceOptions, type TenderStatus, type Regional, lostCauseOptions, type LostCause } from '@/lib/tenders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar as CalendarIcon, Loader2, Save, ChevronsUpDown, Check, Upload, File as FileIcon, X, ChevronDownIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { portfolios, subPortfolios, servicesBySubPortfolio } from '@/lib/projects';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Separator } from '@/components/ui/separator';

export default function NewTenderPage() {
    const router = useRouter();
    const { addTender } = useTenders();
    const { toast } = useToast();
    const { branches } = useAuth();
    const [isSaving, setIsSaving] = useState(false);

    const [isServicesPopoverOpen, setIsServicesPopoverOpen] = useState(false);
    const [documents, setDocuments] = useState<File[]>([]);

    const [newTender, setNewTender] = useState({
        tenderNumber: '',
        title: '',
        client: '',
        principal: '',
        description: '',
        services: '',
        status: '' as TenderStatus | '',
        lostCause: '' as LostCause | '',
        submissionDate: undefined as Date | undefined,
        bidPrice: 0,
        ownerEstimatePrice: 0,
        personInCharge: '',
        branchId: '',
        regional: '' as Regional | '',
        subPortfolio: '' as (typeof subPortfolios)[number] | '',
        portfolio: '' as (typeof portfolios)[number] | '',
        serviceCode: '',
        serviceName: '',
    });

    const availableServices = useMemo(() => {
        if (!newTender.subPortfolio) return [];
        return servicesBySubPortfolio[newTender.subPortfolio as keyof typeof servicesBySubPortfolio] || [];
    }, [newTender.subPortfolio]);

    const availableBranches = useMemo(() => {
        if (!newTender.regional) return [];
        return branches.filter(b => b.region === newTender.regional);
    }, [newTender.regional, branches]);

    const handleRegionalChange = useCallback((value: Regional) => {
        setNewTender(prev => ({ ...prev, regional: value, branchId: '' }));
    }, []);
    
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    }, []);

    const removeDocument = useCallback((index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleSave = useCallback(async () => {
        if (!newTender.tenderNumber || !newTender.title || !newTender.client || !newTender.status || !newTender.submissionDate) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all required fields.',
            });
            return;
        }
        setIsSaving(true);
        try {
            const newTenderData = {
                ...newTender,
                submissionDate: format(newTender.submissionDate, 'yyyy-MM-dd'),
                documents,
                lostCause: newTender.status === 'Lost' ? newTender.lostCause : undefined,
            };

            await addTender(newTenderData as any);
            toast({ title: 'Tender Added', description: `Successfully added tender ${newTender.tenderNumber}.` });
            setTimeout(() => router.push('/tenders'), 500);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not add the new tender.' });
        } finally {
            setIsSaving(false);
        }

    }, [newTender, documents, addTender, toast, router]);

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
                            <CardTitle>Add New Tender</CardTitle>
                            <CardDescription>Fill in the details for the new tender.</CardDescription>
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
                                <Select value={newTender.portfolio} onValueChange={(value: (typeof portfolios)[number]) => setNewTender({ ...newTender, portfolio: value })}>
                                    <SelectTrigger id="portfolio"><SelectValue placeholder="Select a portfolio" /></SelectTrigger>
                                    <SelectContent>{portfolios.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subPortfolio">Sub-Portfolio</Label>
                                <Select value={newTender.subPortfolio} onValueChange={(value: (typeof subPortfolios)[number]) => setNewTender({ ...newTender, subPortfolio: value, serviceCode: '', serviceName: '' })}>
                                    <SelectTrigger id="subPortfolio"><SelectValue placeholder="Select a sub-portfolio" /></SelectTrigger>
                                    <SelectContent>{subPortfolios.map(sp => <SelectItem key={sp} value={sp}>{sp}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serviceCode">Service Code</Label>
                                <Select
                                    value={newTender.serviceCode}
                                    onValueChange={(value) => {
                                        const service = availableServices.find(s => s.code === value);
                                        setNewTender({ ...newTender, serviceCode: value, serviceName: service?.name || '' });
                                    }}
                                    disabled={!newTender.subPortfolio}
                                >
                                    <SelectTrigger id="serviceCode"><SelectValue placeholder="Select a service code" /></SelectTrigger>
                                    <SelectContent>{availableServices.map(s => <SelectItem key={s.code} value={s.code}>{s.code}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="serviceName">Service Name</Label>
                                <Select
                                    value={newTender.serviceName}
                                    onValueChange={(value) => {
                                        const service = availableServices.find(s => s.name === value);
                                        setNewTender({ ...newTender, serviceName: value, serviceCode: service?.code || '' });
                                    }}
                                    disabled={!newTender.subPortfolio}
                                >
                                    <SelectTrigger id="serviceName"><SelectValue placeholder="Select a service name" /></SelectTrigger>
                                    <SelectContent>{availableServices.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="regional">Regional</Label>
                                <Select value={newTender.regional} onValueChange={handleRegionalChange}>
                                    <SelectTrigger id="regional"><SelectValue placeholder="Select region" /></SelectTrigger>
                                    <SelectContent>
                                        {regionalOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="branch">Branch</Label>
                                <Select value={newTender.branchId} onValueChange={(value) => setNewTender({ ...newTender, branchId: value })} disabled={!newTender.regional}>
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
                                <Input id="tenderNumber" value={newTender.tenderNumber} onChange={e => setNewTender({ ...newTender, tenderNumber: e.target.value })} />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="title">Tender Title</Label>
                                <Textarea id="title" value={newTender.title} onChange={(e) => setNewTender({ ...newTender, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client">Client</Label>
                                <Input id="client" value={newTender.client} onChange={e => setNewTender({ ...newTender, client: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="principal">Principal</Label>
                                <Input id="principal" value={newTender.principal} onChange={e => setNewTender({ ...newTender, principal: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Tender Details</h3>
                        <Separator />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={newTender.status} onValueChange={(value: TenderStatus) => setNewTender({ ...newTender, status: value })}>
                                    <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        {tenderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="lostCause">Lost Cause</Label>
                                <Select value={newTender.lostCause} onValueChange={(value: LostCause) => setNewTender({ ...newTender, lostCause: value })} disabled={newTender.status !== 'Lost'}>
                                    <SelectTrigger id="lostCause"><SelectValue placeholder="Select cause" /></SelectTrigger>
                                    <SelectContent>
                                        {lostCauseOptions.map(cause => <SelectItem key={cause} value={cause}>{cause}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="submissionDate">Submission Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant="outline"
                                        id="date"
                                        className="w-full justify-between font-normal"
                                        >
                                        {newTender.submissionDate ? newTender.submissionDate.toLocaleDateString() : "Select date"}
                                        <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={newTender.submissionDate}
                                        onSelect={(date) =>
                                            setNewTender({ ...newTender, submissionDate: date })
                                        }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="personInCharge">Person In Charge (PIC)</Label>
                                <Input id="personInCharge" value={newTender.personInCharge} onChange={e => setNewTender({ ...newTender, personInCharge: e.target.value })} />
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
                                            {newTender.services || "Select or type a service..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search or type service..."
                                                value={newTender.services}
                                                onValueChange={(value) => setNewTender(prev => ({...prev, services: value}))}
                                            />
                                            <CommandList>
                                                <CommandEmpty>No service found.</CommandEmpty>
                                                <CommandGroup>
                                                    {serviceOptions.map((option) => (
                                                        <CommandItem
                                                            key={option}
                                                            value={option}
                                                            onSelect={(currentValue) => {
                                                                setNewTender(prev => ({ ...prev, services: currentValue === prev.services ? "" : currentValue }));
                                                                setIsServicesPopoverOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    newTender.services.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
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
                                <Textarea id="description" value={newTender.description} onChange={(e) => setNewTender({ ...newTender, description: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Financial Information</h3>
                        <Separator />
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="ownerEstimatePrice">Owner Estimate Price (IDR)</Label>
                                <CurrencyInput id="ownerEstimatePrice" value={newTender.ownerEstimatePrice} onValueChange={(value) => setNewTender({ ...newTender, ownerEstimatePrice: value })} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bidPrice">Bid Price (IDR)</Label>
                                <CurrencyInput id="bidPrice" value={newTender.bidPrice} onValueChange={(value) => setNewTender({ ...newTender, bidPrice: value })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Supporting Documents</h3>
                        <Separator />
                        <div className="space-y-2">
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
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/tenders">Cancel</Link>
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Tender
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
