
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, FileDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Project, InvoiceItem, ServiceOrderItem } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ProjectInvoicingTabProps = {
    project: Project;
    setProjects: (updateFn: (projects: Project[]) => Project[]) => void;
};

export function ProjectInvoicingTab({ project, setProjects }: ProjectInvoicingTabProps) {
    const [isAddInvoiceDialogOpen, setIsAddInvoiceDialogOpen] = useState(false);
    const [isEditInvoiceDialogOpen, setIsEditInvoiceDialogOpen] = useState(false);
    const { toast } = useToast();
    
    const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceItem | null>(null);
    const [editedInvoice, setEditedInvoice] = useState<InvoiceItem & { periodMonth: string; periodYear: string; } | null>(null);

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
    
    const invoicedAmountsBySO = useMemo(() => {
        return project.invoices
            .filter(invoice => invoice.status !== 'Cancel')
            .reduce((acc, invoice) => {
                if (invoice.soNumber) {
                    // When calculating for an invoice being edited, exclude its own value
                    const value = (invoiceToEdit && invoiceToEdit.id === invoice.id) ? 0 : invoice.value;
                    acc[invoice.soNumber] = (acc[invoice.soNumber] || 0) + value;
                }
                return acc;
            }, {} as Record<string, number>);
    }, [project.invoices, invoiceToEdit]);

    const serviceOrderMap = useMemo(() => {
        return new Map(project.serviceOrders.map(so => [so.soNumber, so]));
    }, [project.serviceOrders]);


    const handleAddInvoice = () => {
        if (newInvoice.soNumber && newInvoice.serviceCategory && newInvoice.description && newInvoice.periodMonth && newInvoice.periodYear && newInvoice.value > 0) {
            const newId = project.invoices.length > 0 ? Math.max(...project.invoices.map((i) => i.id)) + 1 : 1;
            const { periodMonth, periodYear, ...restOfInvoice } = newInvoice;
            const period = `${periodMonth} ${periodYear}`;
            const newInvoiceItem = { ...restOfInvoice, id: newId, period };

            setProjects(projects => projects.map(p =>
                p.id === project.id ? { ...p, invoices: [...p.invoices, newInvoiceItem] } : p
            ));

            setNewInvoice({ soNumber: '', serviceCategory: '', description: '', status: 'Invoiced', periodMonth: '', periodYear: '', value: 0 });
            setIsAddInvoiceDialogOpen(false);
        } else {
             toast({
                variant: 'destructive',
                title: 'Incomplete Information',
                description: 'Please fill out all fields for the invoice, including a value greater than zero.',
            });
        }
    };

    const handleUpdateInvoice = () => {
        if (!editedInvoice) return;
        const { periodMonth, periodYear, ...restOfInvoice } = editedInvoice;
        const period = `${periodMonth} ${periodYear}`;
        const updatedInvoiceData = { ...restOfInvoice, period };

        setProjects(projects => projects.map(p =>
            p.id === project.id
                ? { ...p, invoices: p.invoices.map(inv => inv.id === editedInvoice.id ? updatedInvoiceData : inv) }
                : p
        ));
        setIsEditInvoiceDialogOpen(false);
        setInvoiceToEdit(null);
    };

    const handleEditClick = (invoice: InvoiceItem) => {
        const [periodMonth, periodYear] = invoice.period.split(' ');
        setEditedInvoice({ ...invoice, periodMonth, periodYear });
        setInvoiceToEdit(invoice);
        setIsEditInvoiceDialogOpen(true);
    };

    const handleExportInvoices = () => {
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
    };

    const getSoDetails = useCallback((soNumber: string, value: number) => {
        const so = serviceOrderMap.get(soNumber);
        if (!so) return { remaining: 0, warning: '' };

        const invoicedAmount = invoicedAmountsBySO[soNumber] || 0;
        const remaining = so.value - invoicedAmount;
        const warning = value > remaining ? `Warning: Amount exceeds remaining SO value of ${formatCurrency(remaining)}.` : '';

        return { remaining, warning };
    }, [invoicedAmountsBySO, serviceOrderMap]);
    
    const addSoDetails = useMemo(() => getSoDetails(newInvoice.soNumber, newInvoice.value), [newInvoice.soNumber, newInvoice.value, getSoDetails]);
    
    const editSoDetails = useMemo(() => {
        return editedInvoice ? getSoDetails(editedInvoice.soNumber, editedInvoice.value) : { remaining: 0, warning: '' };
    }, [editedInvoice, getSoDetails]);


    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
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
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="soNumber" className="text-right">SO Number</Label>
                                        <Select value={newInvoice.soNumber} onValueChange={(value) => setNewInvoice({ ...newInvoice, soNumber: value })}>
                                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select an SO" /></SelectTrigger>
                                            <SelectContent>
                                                {project.serviceOrders.map(so => <SelectItem key={so.id} value={so.soNumber}>{so.soNumber}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">SO Remaining</Label>
                                        <p className="col-span-3 text-sm font-medium">{formatCurrency(addSoDetails.remaining)}</p>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="serviceCategory" className="text-right">Service</Label>
                                        <Input id="serviceCategory" value={newInvoice.serviceCategory} onChange={(e) => setNewInvoice({ ...newInvoice, serviceCategory: e.target.value })} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <Label htmlFor="description" className="text-right pt-2">Description</Label>
                                        <Textarea id="description" value={newInvoice.description} onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })} className="col-span-3" placeholder="Detailed description of the service." rows={3} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="status" className="text-right">Status</Label>
                                        <Select value={newInvoice.status} onValueChange={(value: any) => setNewInvoice({ ...newInvoice, status: value })}>
                                            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Document Preparation">Document Preparation</SelectItem>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                                <SelectItem value="PAD">PAD</SelectItem>
                                                <SelectItem value="Invoiced">Invoiced</SelectItem>
                                                <SelectItem value="Cancel">Cancel</SelectItem>
                                                <SelectItem value="Re-invoiced">Re-invoiced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="periodMonth" className="text-right">Period</Label>
                                        <div className="col-span-3 grid grid-cols-2 gap-2">
                                            <Select value={newInvoice.periodMonth} onValueChange={(value) => setNewInvoice({ ...newInvoice, periodMonth: value })}>
                                                <SelectTrigger id="periodMonth"><SelectValue placeholder="Select month" /></SelectTrigger>
                                                <SelectContent>
                                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Input id="periodYear" type="number" value={newInvoice.periodYear} onChange={(e) => setNewInvoice({ ...newInvoice, periodYear: e.target.value })} placeholder="Year" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="value" className="text-right">Value (IDR)</Label>
                                        <Input id="value" type="number" value={newInvoice.value || ''} onChange={(e) => setNewInvoice({ ...newInvoice, value: parseInt(e.target.value) || 0 })} className="col-span-3" />
                                    </div>
                                    {addSoDetails.warning && (
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <div/>
                                            <p className="col-span-3 text-sm font-medium text-destructive">{addSoDetails.warning}</p>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddInvoice}>Add Invoice</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>SO Number</TableHead>
                                <TableHead>Service Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {project.invoices?.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.id}</TableCell>
                                    <TableCell className="font-medium">{invoice.soNumber}</TableCell>
                                    <TableCell className="font-medium">{invoice.serviceCategory}</TableCell>
                                    <TableCell>{invoice.description}</TableCell>
                                    <TableCell>{invoice.period}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(invoice.value)}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'Paid' ? 'success' : invoice.status === 'PAD' ? 'warning' : invoice.status === 'Invoiced' ? 'info' : invoice.status === 'Cancel' ? 'destructive' : invoice.status === 'Re-invoiced' ? 'indigo' : invoice.status === 'Document Preparation' ? 'secondary' : 'secondary'}>{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleEditClick(invoice)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Cancel Invoice</DropdownMenuItem>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!project.invoices?.length && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">No invoices found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditInvoiceDialogOpen} onOpenChange={(open) => { setIsEditInvoiceDialogOpen(open); if (!open) setInvoiceToEdit(null); }}>
                <DialogContent className="sm:max-w-lg">
                    {editedInvoice && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Invoice</DialogTitle>
                                <DialogDescription>Update the details for this invoice.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editSoNumber" className="text-right">SO Number</Label>
                                    <Select value={editedInvoice.soNumber} onValueChange={(value) => setEditedInvoice({ ...editedInvoice, soNumber: value })}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select an SO" /></SelectTrigger>
                                        <SelectContent>
                                            {project.serviceOrders.map(so => <SelectItem key={so.id} value={so.soNumber}>{so.soNumber}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">SO Remaining</Label>
                                    <p className="col-span-3 text-sm font-medium">{formatCurrency(editSoDetails.remaining)}</p>
                                 </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editServiceCategory" className="text-right">Service</Label>
                                    <Input id="editServiceCategory" value={editedInvoice.serviceCategory} onChange={(e) => setEditedInvoice({ ...editedInvoice, serviceCategory: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="editDescription" className="text-right pt-2">Description</Label>
                                    <Textarea id="editDescription" value={editedInvoice.description} onChange={(e) => setEditedInvoice({ ...editedInvoice, description: e.target.value })} className="col-span-3" rows={3} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editStatus" className="text-right">Status</Label>
                                    <Select value={editedInvoice.status} onValueChange={(value: any) => setEditedInvoice({ ...editedInvoice, status: value })}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Document Preparation">Document Preparation</SelectItem>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                            <SelectItem value="PAD">PAD</SelectItem>
                                            <SelectItem value="Invoiced">Invoiced</SelectItem>
                                            <SelectItem value="Cancel">Cancel</SelectItem>
                                            <SelectItem value="Re-invoiced">Re-invoiced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editPeriodMonth" className="text-right">Period</Label>
                                    <div className="col-span-3 grid grid-cols-2 gap-2">
                                        <Select value={editedInvoice.periodMonth} onValueChange={(value) => setEditedInvoice({ ...editedInvoice, periodMonth: value })}>
                                            <SelectTrigger id="editPeriodMonth"><SelectValue placeholder="Select month" /></SelectTrigger>
                                            <SelectContent>
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input id="editPeriodYear" type="number" value={editedInvoice.periodYear} onChange={(e) => setEditedInvoice({ ...editedInvoice, periodYear: e.target.value })} placeholder="Year" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editValue" className="text-right">Value (IDR)</Label>
                                    <Input id="editValue" type="number" value={editedInvoice.value || ''} onChange={(e) => setEditedInvoice({ ...editedInvoice, value: parseInt(e.target.value) || 0 })} className="col-span-3" />
                                </div>
                                 {editSoDetails.warning && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <div/>
                                        <p className="col-span-3 text-sm font-medium text-destructive">{editSoDetails.warning}</p>
                                    </div>
                                 )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleUpdateInvoice}>Save Changes</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
