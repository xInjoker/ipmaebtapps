
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTenders, type Tender } from '@/context/TenderContext';
import { tenderStatuses, regionalOptions, subPortfolioOptions, type TenderStatus, type Regional, type SubPortfolio } from '@/lib/tenders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ArrowLeft, Calendar as CalendarIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Textarea } from '@/components/ui/textarea';

export default function NewTenderPage() {
    const router = useRouter();
    const { addTender } = useTenders();
    const { toast } = useToast();
    const { branches } = useAuth();

    const [newTender, setNewTender] = useState({
        tenderNumber: '',
        title: '',
        client: '',
        principal: '',
        description: '',
        status: '' as TenderStatus | '',
        submissionDate: undefined as Date | undefined,
        value: 0,
        personInCharge: '',
        branchId: '',
        regional: '' as Regional | '',
        subPortfolio: '' as SubPortfolio | '',
    });

    const handleSave = () => {
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
            status: newTender.status as TenderStatus,
            submissionDate: format(newTender.submissionDate, 'yyyy-MM-dd'),
            value: newTender.value,
            personInCharge: newTender.personInCharge,
            branchId: newTender.branchId,
            regional: newTender.regional as Regional,
            subPortfolio: newTender.subPortfolio as SubPortfolio,
        };

        addTender(newTenderData);
        toast({ title: 'Tender Added', description: `Successfully added tender ${newTender.tenderNumber}.` });
        router.push('/tenders');
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
                        <Label htmlFor="subPortfolio">Sub-Portfolio</Label>
                        <Select value={newTender.subPortfolio} onValueChange={(value: SubPortfolio) => setNewTender({ ...newTender, subPortfolio: value })}>
                            <SelectTrigger id="subPortfolio"><SelectValue placeholder="Select sub-portfolio" /></SelectTrigger>
                            <SelectContent>
                                {subPortfolioOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="regional">Regional</Label>
                        <Select value={newTender.regional} onValueChange={(value: Regional) => setNewTender({ ...newTender, regional: value })}>
                            <SelectTrigger id="regional"><SelectValue placeholder="Select region" /></SelectTrigger>
                            <SelectContent>
                                {regionalOptions.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={newTender.branchId} onValueChange={(value) => setNewTender({ ...newTender, branchId: value })}>
                            <SelectTrigger id="branch"><SelectValue placeholder="Select branch" /></SelectTrigger>
                            <SelectContent>
                                {branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}
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
                        <Label htmlFor="client">Client</Label>
                        <Input id="client" value={newTender.client} onChange={e => setNewTender({ ...newTender, client: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="principal">Principal</Label>
                        <Input id="principal" value={newTender.principal} onChange={e => setNewTender({ ...newTender, principal: e.target.value })} />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={newTender.description} onChange={e => setNewTender({ ...newTender, description: e.target.valueAsNumber ? e.target.value : e.target.value })} />
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
                        <Label htmlFor="value">Value (IDR)</Label>
                        <Input id="value" type="number" value={newTender.value || ''} onChange={e => setNewTender({ ...newTender, value: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="personInCharge">Person In Charge (PIC)</Label>
                        <Input id="personInCharge" value={newTender.personInCharge} onChange={e => setNewTender({ ...newTender, personInCharge: e.target.value })} />
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
