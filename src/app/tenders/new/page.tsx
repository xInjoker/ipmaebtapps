
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenders, type Tender } from '@/context/TenderContext';
import { tenderStatuses, regionalOptions, subPortfolioOptions, serviceOptions, type TenderStatus, type Regional } from '@/lib/tenders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar as CalendarIcon, Save, ChevronsUpDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { portfolios, subPortfolios, servicesBySubPortfolio } from '@/lib/data';
import { CurrencyInput } from '@/components/ui/currency-input';

export default function NewTenderPage() {
    const router = useRouter();
    const { addTender } = useTenders();
    const { toast } = useToast();
    const { branches } = useAuth();

    const [isServicesPopoverOpen, setIsServicesPopoverOpen] = useState(false);

    const [newTender, setNewTender] = useState({
        tenderNumber: '',
        title: '',
        client: '',
        principal: '',
        description: '',
        services: '',
        status: '' as TenderStatus | '',
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

    const handleRegionalChange = (value: Regional) => {
        setNewTender(prev => ({ ...prev, regional: value, branchId: '' }));
    };

    const handleSave = async () => {
        if (!newTender.tenderNumber || !newTender.title || !newTender.client || !newTender.status || !newTender.submissionDate) {
            toast({
                variant: 'destructive',
                title: 'Missing Information',
                description: 'Please fill out all required fields.',
            });
            return;
        }

        const newTenderData: Tender = {
            id: `TND-${Date.now()}`,
            tenderNumber: newTender.tenderNumber,
            title: newTender.title,
            client: newTender.client,
            principal: newTender.principal,
            description: newTender.description,
            services: newTender.services,
            status: newTender.status as TenderStatus,
            submissionDate: format(newTender.submissionDate, 'yyyy-MM-dd'),
            bidPrice: newTender.bidPrice,
            ownerEstimatePrice: newTender.ownerEstimatePrice,
            personInCharge: newTender.personInCharge,
            branchId: newTender.branchId,
            regional: newTender.regional as Regional,
            subPortfolio: newTender.subPortfolio as (typeof subPortfolios)[number],
            portfolio: newTender.portfolio as (typeof portfolios)[number],
            serviceCode: newTender.serviceCode,
            serviceName: newTender.serviceName,
        };

        await addTender(newTenderData);
        toast({ title: 'Tender Added', description: `Successfully added tender ${newTender.tenderNumber}.` });
        setTimeout(() => router.push('/tenders'), 500);
    };

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
                <CardContent className="grid gap-6 md:grid-cols-2">
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
                    <div className="space-y-2">
                        <Label htmlFor="tenderNumber">Tender Number</Label>
                        <Input id="tenderNumber" value={newTender.tenderNumber} onChange={e => setNewTender({ ...newTender, tenderNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Tender Title</Label>
                        <Input id="title" value={newTender.title} onChange={e => setNewTender({ ...newTender, title: e.target.value })} />
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
                    <div className="space-y-2">
                        <Label htmlFor="client">Client</Label>
                        <Input id="client" value={newTender.client} onChange={e => setNewTender({ ...newTender, client: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="principal">Principal</Label>
                        <Input id="principal" value={newTender.principal} onChange={e => setNewTender({ ...newTender, principal: e.target.value })} />
                    </div>
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
                        <Label htmlFor="submissionDate">Submission Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="submissionDate"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !newTender.submissionDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newTender.submissionDate ? format(newTender.submissionDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={newTender.submissionDate}
                                    onSelect={(date) => setNewTender({ ...newTender, submissionDate: date })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ownerEstimatePrice">Owner Estimate Price (IDR)</Label>
                        <CurrencyInput id="ownerEstimatePrice" value={newTender.ownerEstimatePrice} onValueChange={(value) => setNewTender({ ...newTender, ownerEstimatePrice: value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bidPrice">Bid Price (IDR)</Label>
                        <CurrencyInput id="bidPrice" value={newTender.bidPrice} onValueChange={(value) => setNewTender({ ...newTender, bidPrice: value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="personInCharge">Person In Charge (PIC)</Label>
                        <Input id="personInCharge" value={newTender.personInCharge} onChange={e => setNewTender({ ...newTender, personInCharge: e.target.value })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={newTender.description} onChange={(e) => setNewTender({ ...newTender, description: e.target.value })} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/tenders">Cancel</Link>
                    </Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Tender
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
