
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTenders, type Tender } from '@/context/TenderContext';
import { tenderStatuses, regionalOptions, subPortfolioOptions, serviceOptions, type TenderStatus, type Regional, type SubPortfolio } from '@/lib/tenders';
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

export default function EditTenderPage() {
    const router = useRouter();
    const params = use(useParams());
    const { getTenderById, updateTender } = useTenders();
    const { toast } = useToast();
    const { branches } = useAuth();
    
    const [tender, setTender] = useState<Tender | null>(null);
    const [isServicesPopoverOpen, setIsServicesPopoverOpen] = useState(false);
    
    useEffect(() => {
        const tenderId = params.id as string;
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
    }, [params.id, getTenderById, router, toast]);

    const handleSave = () => {
        if (!tender) return;
        if (!tender.tenderNumber || !tender.title || !tender.client || !tender.status || !tender.submissionDate) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields.' });
            return;
        }

        const updatedTenderData = {
            ...tender,
            submissionDate: format(new Date(tender.submissionDate), 'yyyy-MM-dd'),
        };

        updateTender(tender.id, updatedTenderData);
        toast({ title: 'Tender Updated', description: `Successfully updated tender ${tender.tenderNumber}.` });
        router.push('/tenders');
    };
    
    if (!tender) {
        return <div>Loading...</div>;
    }

    const isNew = !tender.id;

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
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="subPortfolio">Sub-Portfolio</Label>
                        <Select value={tender.subPortfolio} onValueChange={(value: SubPortfolio) => setTender({ ...tender, subPortfolio: value })}>
                            <SelectTrigger id="subPortfolio"><SelectValue placeholder="Select sub-portfolio" /></SelectTrigger>
                            <SelectContent>
                                {subPortfolioOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="regional">Regional</Label>
                        <Select value={tender.regional} onValueChange={(value: Regional) => setTender({ ...tender, regional: value })}>
                            <SelectTrigger id="regional"><SelectValue placeholder="Select region" /></SelectTrigger>
                            <SelectContent>
                                {regionalOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={tender.branchId} onValueChange={(value) => setTender({ ...tender, branchId: value })}>
                            <SelectTrigger id="branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                            <SelectContent>
                                {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tenderNumber">Tender Number</Label>
                        <Input id="tenderNumber" value={tender.tenderNumber} onChange={e => setTender({ ...tender, tenderNumber: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Tender Title</Label>
                        <Input id="title" value={tender.title} onChange={e => setTender({ ...tender, title: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="services">Services</Label>
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
                    <div className="space-y-2">
                        <Label htmlFor="client">Client</Label>
                        <Input id="client" value={tender.client} onChange={e => setTender({ ...tender, client: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="principal">Principal</Label>
                        <Input id="principal" value={tender.principal} onChange={e => setTender({ ...tender, principal: e.target.value })} />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={tender.description} onChange={(e) => setTender({ ...tender, description: e.target.value })} />
                    </div>
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
                        <Label htmlFor="value">Value (IDR)</Label>
                        <Input id="value" type="number" value={tender.value || ''} onChange={e => setTender({ ...tender, value: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="personInCharge">Person In Charge (PIC)</Label>
                        <Input id="personInCharge" value={tender.personInCharge} onChange={e => setTender({ ...tender, personInCharge: e.target.value })} />
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
