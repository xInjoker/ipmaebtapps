

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, FileDown, Info, Search, X, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as UiTableFooter } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Project, InvoiceItem, ServiceOrderItem } from '@/lib/projects';
import { formatCurrency } from '@/lib/utils';
import { CurrencyInput } from './ui/currency-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DatePicker } from './ui/date-picker';
import { parse } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';


type ProjectInvoicingTabProps = {
    project: Project;
    setProjects: (updateFn: (project: Project) => Project) => void;
};

type SortKey = keyof InvoiceItem | 'id';

export function ProjectInvoicingTab({ project, setProjects }: ProjectInvoicingTabProps) {
    const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
    const [dialogState, setDialogState] = useState<'finalize' | 'cancel' | null>(null);
    const [invoiceToAdjust, setInvoiceToAdjust] = useState<InvoiceItem | null>(null);
    const [adjustmentData, setAdjustmentData] = useState({ finalValue: 0, reason: '' });
    
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<(Omit<InvoiceItem, 'date'> & { periodMonth?: string, periodYear?: string }) | null>(null);
    
    // Filter states
    const [statusFilter, setStatusFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);

    const { toast } = useToast();
    const { userHasPermission, user } = useAuth();
    
    const [newInvoice, setNewInvoice] = useState<{
        soNumber: string;
        serviceCategory: string;
        description: string;
        status: InvoiceItem['status'];
        periodMonth: string;
        periodYear: string;
        value: number;
    }>({
        soNumber: '',
        serviceCategory: '',
        description: '',
        status: 'Invoiced',
        periodMonth: '',
        periodYear: '',
        value: 0,
    });
    
    const availablePeriods = useMemo(() => {
        if (!project.invoices) return [];
        const periods = new Set(project.invoices.map(inv => inv.period));
        return ['all', ...Array.from(periods)];
    }, [project.invoices]);
    
    const sortedAndFilteredInvoices = useMemo(() => {
        let filtered = (project.invoices || []).filter(invoice => {
            const statusMatch = statusFilter === 'all' || invoice.status === statusFilter;
            const periodMatch = periodFilter === 'all' || invoice.period === periodFilter;
            const searchMatch = searchTerm.toLowerCase() === '' || 
                                invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                invoice.soNumber.toLowerCase().includes(searchTerm.toLowerCase());
            return statusMatch && periodMatch && searchMatch;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const key = sortConfig.key;
                let aValue = a[key as keyof InvoiceItem];
                let bValue = b[key as keyof InvoiceItem];

                if (key === 'period') {
                    try {
                        const dateA = parse(a.period, 'MMMM yyyy', new Date());
                        const dateB = parse(b.period, 'MMMM yyyy', new Date());
                        if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
                        if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
                        return 0;
                    } catch {
                        return 0;
                    }
                }
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' 
                        ? aValue.localeCompare(bValue) 
                        : bValue.localeCompare(aValue);
                } else {
                     if ((aValue ?? 0) < (bValue ?? 0)) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if ((aValue ?? 0) > (bValue ?? 0)) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                }
            });
        }

        return filtered;
    }, [project.invoices, statusFilter, periodFilter, searchTerm, sortConfig]);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedAndFilteredInvoices.slice(startIndex, endIndex);
    }, [sortedAndFilteredInvoices, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedAndFilteredInvoices.length / itemsPerPage);
    }, [sortedAndFilteredInvoices]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, periodFilter, searchTerm, sortConfig]);


    const invoicedAmountsBySO = useMemo(() => {
        return (project.invoices || [])
            .filter(invoice => invoice.status !== 'Cancel')
            .reduce((acc, invoice) => {
                if (invoice.soNumber) {
                    const value = (invoiceToAdjust && invoiceToAdjust.id === invoice.id) ? 0 : invoice.value;
                    acc[invoice.soNumber] = (acc[invoice.soNumber] || 0) + value;
                }
                return acc;
            }, {} as Record<string, number>);
    }, [project.invoices, invoiceToAdjust]);

    const serviceOrderMap = useMemo(() => {
        return new Map(project.serviceOrders.map(so => [so.soNumber, so]));
    }, [project.serviceOrders]);
    
    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (sortConfig?.key !== key) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };


    const handleAddInvoice = useCallback(() => {
        if (newInvoice.soNumber && newInvoice.serviceCategory && newInvoice.description && newInvoice.periodMonth && newInvoice.periodYear && newInvoice.value > 0) {
            const newId = `INV-${project.id}-${Date.now()}`;
            const { periodMonth, periodYear, ...restOfInvoice } = newInvoice;
            const period = `${periodMonth} ${periodYear}`;
            const newInvoiceItem: InvoiceItem = { ...restOfInvoice, id: newId, period };

            setProjects(p => ({ ...p, invoices: [...(p.invoices || []), newInvoiceItem] }));

            setNewInvoice({ soNumber: '', serviceCategory: '', description: '', status: 'Invoiced', periodMonth: '', periodYear: '', value: 0 });
            setIsAddInvoiceDialogOpen(false);
        } else {
             toast({
                variant: 'destructive',
                title: 'Incomplete Information',
                description: 'Please fill out all fields for the invoice, including a value greater than zero.',
            });
        }
    }, [newInvoice, project, setProjects, toast]);
    
    const handleStatusUpdate = useCallback((invoiceId: string, newStatus: InvoiceItem['status']) => {
        setProjects(p => ({ 
            ...p, 
            invoices: (p.invoices || []).map(inv => 
                inv.id === invoiceId ? { ...inv, status: newStatus } : inv
            ) 
        }));
        toast({ title: 'Invoice Status Updated', description: `Invoice has been updated to ${newStatus}.` });
    }, [setProjects, toast]);


    const handleAdjustmentClick = (invoice: InvoiceItem, type: 'finalize' | 'cancel') => {
        setInvoiceToAdjust(invoice);
        setAdjustmentData({ finalValue: invoice.value, reason: '' });
        setDialogState(type);
    };

    const handleConfirmAdjustment = useCallback(() => {
        if (!invoiceToAdjust || !dialogState) return;

        if (!adjustmentData.reason) {
            toast({ variant: 'destructive', title: 'Reason Required', description: 'Please provide a reason for this change.' });
            return;
        }

        let updatedInvoice: InvoiceItem;

        if (dialogState === 'finalize') {
            updatedInvoice = {
                ...invoiceToAdjust,
                originalValue: invoiceToAdjust.status === 'PAD' ? invoiceToAdjust.value : invoiceToAdjust.originalValue,
                value: adjustmentData.finalValue,
                status: 'Invoiced',
                adjustmentReason: adjustmentData.reason,
            };
        } else { // 'cancel'
             updatedInvoice = {
                ...invoiceToAdjust,
                status: 'Cancel',
                adjustmentReason: adjustmentData.reason,
            };
        }

        setProjects(p => ({ ...p, invoices: (p.invoices || []).map(inv => inv.id === invoiceToAdjust.id ? updatedInvoice : inv) }));
        setDialogState(null);
        setInvoiceToAdjust(null);
        toast({ title: 'Invoice Updated', description: `The invoice has been successfully ${dialogState === 'finalize' ? 'adjusted' : 'cancelled'}.` });
    }, [invoiceToAdjust, dialogState, adjustmentData, setProjects, toast]);

    const handleExportInvoices = useCallback(() => {
        if (!project || !project.invoices) return;

        const headers = ['ID', 'SO Number', 'Service Category', 'Description', 'Status', 'Period', 'Value (IDR)'];
        const csvRows = [headers.join(',')];

        project.invoices.forEach((invoice) => {
            const soNumber = `"${invoice.soNumber.replace(/"/g, '""')}"`;
            const serviceCategory = `"${invoice.serviceCategory.replace(/"/g, '""')}"`;
            const description = `"${invoice.description.replace(/"/g, '""')}"`;
            const row = [invoice.id, soNumber, serviceCategory, description, invoice.status, invoice.period, invoice.value].join(',');
            csvRows.push(row);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `invoices-${project.contractNumber}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [project]);

    const getSoDetails = useCallback((soNumber: string, value: number) => {
        const so = serviceOrderMap.get(soNumber);
        if (!so) return { remaining: 0, warning: '' };

        const invoicedAmount = invoicedAmountsBySO[soNumber] || 0;
        const remaining = so.value - invoicedAmount;
        const warning = value > remaining ? `Warning: Amount exceeds remaining SO value of ${formatCurrency(remaining)}.` : '';

        return { remaining, warning };
    }, [invoicedAmountsBySO, serviceOrderMap]);
    
    const addSoDetails = useMemo(() => getSoDetails(newInvoice.soNumber, newInvoice.value), [newInvoice.soNumber, newInvoice.value, getSoDetails]);

    const handleEditClick = useCallback((invoice: InvoiceItem) => {
        const [month, year] = invoice.period.split(' ');
        setItemToEdit({ ...invoice, periodMonth: month, periodYear: year });
        setIsEditDialogOpen(true);
    }, []);

    const handleUpdateItem = useCallback(() => {
        if (!itemToEdit) return;
        const { periodMonth, periodYear, ...rest } = itemToEdit;
        const period = `${periodMonth} ${periodYear}`;
        const updatedItemData = { ...rest, period };

        setProjects(p => ({ ...p, invoices: (p.invoices || []).map(item => item.id === updatedItemData.id ? updatedItemData : item) }));
        setIsEditDialogOpen(false);
        setItemToEdit(null);
        toast({ title: "Invoice Updated", description: "The invoice details have been saved." });
    }, [itemToEdit, setProjects, toast]);


    const dialogForm = useCallback((
        isEdit: boolean, 
        state: any, 
        setter: (value: any) => void
    ) => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="soNumber" className="text-right">SO Number</Label>
                <Select value={state.soNumber} onValueChange={(value) => setter({ ...state, soNumber: value })}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select an SO" /></SelectTrigger>
                    <SelectContent>
                        {project.serviceOrders.map(so => <SelectItem key={so.id} value={so.soNumber}>{so.soNumber}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serviceCategory" className="text-right">Service</Label>
                <Input id="serviceCategory" value={state.serviceCategory} onChange={(e) => setter({ ...state, serviceCategory: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <Textarea id="description" value={state.description} onChange={(e) => setter({ ...state, description: e.target.value })} className="col-span-3" placeholder="Detailed description of the service." rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={state.status} onValueChange={(value: any) => setter({ ...state, status: value })}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Document Preparation">Document Preparation</SelectItem>
                        <SelectItem value="PAD">PAD</SelectItem>
                        <SelectItem value="Invoiced">Invoiced</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Re-invoiced">Re-invoiced</SelectItem>
                        <SelectItem value="Cancel">Cancel</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="periodMonth" className="text-right">Period</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Select value={state.periodMonth} onValueChange={(value) => setter({ ...state, periodMonth: value })}>
                        <SelectTrigger id="periodMonth"><SelectValue placeholder="Select month" /></SelectTrigger>
                        <SelectContent>
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input id="periodYear" type="number" value={state.periodYear} onChange={(e) => setter({ ...state, periodYear: e.target.value })} placeholder="Year" />
                </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Value (IDR)</Label>
                 <CurrencyInput id="value" value={state.value} onValueChange={(value: number) => setter({ ...state, value })} className="col-span-3" />
            </div>
        </div>
    ), [project.serviceOrders]);


    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-grow">
                            <CardTitle>Invoicing Progress</CardTitle>
                            <CardDescription>A detailed breakdown of all invoices for this project.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleExportInvoices}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                            <Dialog open={isAddInvoiceDialogOpen} onOpenChange={setIsAddInvoiceDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Invoice
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add New Invoice</DialogTitle>
                                        <DialogDescription>Fill in the details for the new invoice.</DialogDescription>
                                    </DialogHeader>
                                    {dialogForm(false, newInvoice, setNewInvoice)}
                                    {addSoDetails.warning && (
                                        <div className="text-sm font-medium text-destructive text-center">{addSoDetails.warning}</div>
                                    )}
                                    <DialogFooter>
                                        <Button onClick={handleAddInvoice}>Add Invoice</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 bg-muted/50 rounded-lg">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by SO or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-full"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by status..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Document Preparation">Document Preparation</SelectItem>
                                <SelectItem value="PAD">PAD</SelectItem>
                                <SelectItem value="Invoiced">Invoiced</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Re-invoiced">Re-invoiced</SelectItem>
                                <SelectItem value="Cancel">Cancel</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={periodFilter} onValueChange={setPeriodFilter}>
                            <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by period..." /></SelectTrigger>
                            <SelectContent>
                                {availablePeriods.map(p => <SelectItem key={p} value={p}>{p === 'all' ? 'All Periods' : p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPeriodFilter('all'); }}><X className="h-4 w-4" /></Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('soNumber')}>SO Number {getSortIndicator('soNumber')}</Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('serviceCategory')}>Category {getSortIndicator('serviceCategory')}</Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('description')}>Description {getSortIndicator('description')}</Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('period')}>Period {getSortIndicator('period')}</Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" onClick={() => requestSort('value')}>Value {getSortIndicator('value')}</Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</Button>
                                </TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.soNumber}</TableCell>
                                    <TableCell>{invoice.serviceCategory}</TableCell>
                                    <TableCell>{invoice.description}</TableCell>
                                    <TableCell>{invoice.period}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {formatCurrency(invoice.value)}
                                            {(invoice.originalValue || invoice.adjustmentReason) && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs text-sm">
                                                            {invoice.originalValue && <p>Original PAD: {formatCurrency(invoice.originalValue)}</p>}
                                                            {invoice.adjustmentReason && <p>Reason: {invoice.adjustmentReason}</p>}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'Paid' ? 'success' : invoice.status === 'PAD' ? 'warning' : invoice.status === 'Invoiced' ? 'info' : invoice.status === 'Cancel' ? 'destructive' : invoice.status === 'Re-invoiced' ? 'indigo' : invoice.status === 'Document Preparation' ? 'secondary' : 'secondary'}>{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {invoice.status === 'Paid' && user?.roleId === 'super-admin' && (
                                                    <DropdownMenuItem onSelect={() => handleEditClick(invoice)}>Edit (Admin)</DropdownMenuItem>
                                                )}

                                                {invoice.status === 'Cancel' && user?.roleId === 'super-admin' && (
                                                    <DropdownMenuItem onSelect={() => handleEditClick(invoice)}>Edit (Admin)</DropdownMenuItem>
                                                )}
                                                
                                                {invoice.status === 'PAD' && (
                                                    <>
                                                        <DropdownMenuItem onSelect={() => handleAdjustmentClick(invoice, 'finalize')}>Finalize/Adjust Invoice</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleEditClick(invoice)}>Edit</DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                {invoice.status === 'Document Preparation' && (
                                                    <>
                                                         <DropdownMenuItem onSelect={() => handleEditClick(invoice)}>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleStatusUpdate(invoice.id, 'PAD')}>Mark as PAD</DropdownMenuItem>
                                                    </>
                                                )}
                                                
                                                {(invoice.status === 'Invoiced' || invoice.status === 'Re-invoiced') && (
                                                    <>
                                                        <DropdownMenuItem onSelect={() => handleStatusUpdate(invoice.id, 'Paid')}>Mark as Paid</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleAdjustmentClick(invoice, 'cancel')} className="text-destructive">Cancel Invoice</DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sortedAndFilteredInvoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24">No invoices found for the selected filters.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 {totalPages > 1 && (
                    <CardFooter className="flex items-center justify-between border-t pt-4">
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            <Dialog open={!!dialogState} onOpenChange={(open) => { if (!open) setDialogState(null); }}>
                <DialogContent className="sm:max-w-lg">
                    {invoiceToAdjust && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{dialogState === 'finalize' ? 'Finalize / Adjust Invoice' : 'Cancel Invoice'}</DialogTitle>
                                <DialogDescription>
                                    {dialogState === 'finalize' 
                                        ? `Adjust the final value for invoice from PAD of ${formatCurrency(invoiceToAdjust.value)}.`
                                        : `Provide a reason for cancelling invoice ${invoiceToAdjust.id}.`}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {dialogState === 'finalize' && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="finalValue" className="text-right">Final Value (IDR)</Label>
                                        <CurrencyInput id="finalValue" value={adjustmentData.finalValue} onValueChange={(value: number) => setAdjustmentData(d => ({ ...d, finalValue: value }))} className="col-span-3" />
                                    </div>
                                )}
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="reason" className="text-right pt-2">Reason</Label>
                                    <Textarea id="reason" value={adjustmentData.reason} onChange={(e) => setAdjustmentData(d => ({ ...d, reason: e.target.value }))} className="col-span-3" placeholder="Explain the reason for this change..." rows={3} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogState(null)}>Close</Button>
                                <Button onClick={handleConfirmAdjustment}>Confirm</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

             {/* Edit Invoice Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    {itemToEdit && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Invoice (Admin)</DialogTitle>
                                <DialogDescription>Directly modify any field for this invoice.</DialogDescription>
                            </DialogHeader>
                            {dialogForm(true, itemToEdit, setItemToEdit)}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateItem}>Save Changes</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
