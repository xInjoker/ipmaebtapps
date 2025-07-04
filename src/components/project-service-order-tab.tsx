
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import type { Project, ServiceOrderItem } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';

type ProjectServiceOrderTabProps = {
    project: Project;
    setProjects: (updateFn: (projects: Project[]) => Project[]) => void;
};

const serviceOrderStatuses: ServiceOrderItem['status'][] = ['Open', 'In Progress', 'Closed'];

export function ProjectServiceOrderTab({ project, setProjects }: ProjectServiceOrderTabProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const [itemToEdit, setItemToEdit] = useState<ServiceOrderItem & { date?: Date } | null>(null);

    const [newItem, setNewItem] = useState<{
        soNumber: string;
        description: string;
        date: Date | undefined;
        value: number;
        status: ServiceOrderItem['status'];
    }>({
        soNumber: '',
        description: '',
        date: undefined,
        value: 0,
        status: 'Open',
    });

    const invoicedAmountsBySO = useMemo(() => {
        return project.invoices
            .filter(invoice => invoice.status !== 'Cancel')
            .reduce((acc, invoice) => {
                if (invoice.soNumber) {
                    acc[invoice.soNumber] = (acc[invoice.soNumber] || 0) + invoice.value;
                }
                return acc;
            }, {} as Record<string, number>);
    }, [project.invoices]);

    const handleAddItem = () => {
        if (newItem.soNumber && newItem.description && newItem.date && newItem.value > 0) {
            const newId = project.serviceOrders?.length > 0 ? Math.max(...project.serviceOrders.map((i) => i.id)) + 1 : 1;
            const newItemData: ServiceOrderItem = {
                id: newId,
                soNumber: newItem.soNumber,
                description: newItem.description,
                date: format(newItem.date, 'yyyy-MM-dd'),
                value: newItem.value,
                status: newItem.status,
            };

            setProjects(projects => projects.map(p =>
                p.id === project.id ? { ...p, serviceOrders: [...(p.serviceOrders || []), newItemData] } : p
            ));

            setNewItem({ soNumber: '', description: '', date: undefined, value: 0, status: 'Open' });
            setIsAddDialogOpen(false);
        }
    };

    const handleEditClick = (item: ServiceOrderItem) => {
        setItemToEdit({
            ...item,
            date: item.date ? new Date(item.date) : undefined
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateItem = () => {
        if (!itemToEdit || !itemToEdit.date) return;
        
        const { date, ...restOfItem } = itemToEdit;
        const updatedItemData = {
            ...restOfItem,
            date: format(date, 'yyyy-MM-dd')
        };

        setProjects(projects => projects.map(p =>
            p.id === project.id
                ? { ...p, serviceOrders: p.serviceOrders.map(item => item.id === updatedItemData.id ? updatedItemData : item) }
                : p
        ));
        setIsEditDialogOpen(false);
        setItemToEdit(null);
    };

    const handleExport = () => {
        if (!project || !project.serviceOrders) return;

        const headers = ['ID', 'SO Number', 'Description', 'Date', 'Value (IDR)', 'Status'];
        const csvRows = [headers.join(',')];

        project.serviceOrders.forEach((item) => {
            const soNumber = `"${item.soNumber.replace(/"/g, '""')}"`;
            const description = `"${item.description.replace(/"/g, '""')}"`;
            const row = [item.id, soNumber, description, item.date, item.value, item.status].join(',');
            csvRows.push(row);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `service-orders-${project.contractNumber}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const dialogForm = (
        isEdit: boolean, 
        state: any, 
        setter: (value: any) => void
    ) => (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="soNumber" className="text-right">SO Number</Label>
                <Input id="soNumber" value={state.soNumber} onChange={(e) => setter({ ...state, soNumber: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "col-span-3 justify-start text-left font-normal",
                                !state.date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {state.date ? format(state.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={state.date}
                            onSelect={(date) => setter({...state, date: date})}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <Textarea id="description" value={state.description} onChange={(e) => setter({ ...state, description: e.target.value })} className="col-span-3" placeholder="Detailed description of the service order." rows={3} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Value (IDR)</Label>
                <Input id="value" type="number" value={state.value || ''} onChange={(e) => setter({ ...state, value: parseInt(e.target.value) || 0 })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={state.status} onValueChange={(value: any) => setter({ ...state, status: value })}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                        {serviceOrderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Service Orders (SO)</CardTitle>
                        <CardDescription>Manage all service orders for this project.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add SO
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add New Service Order</DialogTitle>
                                    <DialogDescription>Fill in the details for the new SO.</DialogDescription>
                                </DialogHeader>
                                {dialogForm(false, newItem, setNewItem)}
                                <DialogFooter>
                                    <Button onClick={handleAddItem}>Add Service Order</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SO Number</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Value</TableHead>
                                <TableHead className="text-right">Remaining Value</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {project.serviceOrders?.map((item) => {
                                const invoicedAmount = invoicedAmountsBySO[item.soNumber] || 0;
                                const remainingValue = item.value - invoicedAmount;
                                return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.soNumber}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{format(new Date(item.date), 'PPP')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(remainingValue)}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.status === 'Closed' ? 'green' : item.status === 'In Progress' ? 'blue' : 'secondary'}>{item.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleEditClick(item)}>Edit</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                            {!project.serviceOrders?.length && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">No service orders found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    {itemToEdit && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Service Order</DialogTitle>
                                <DialogDescription>Update the details for this SO.</DialogDescription>
                            </DialogHeader>
                            {dialogForm(true, itemToEdit, setItemToEdit)}
                            <DialogFooter>
                                <Button onClick={handleUpdateItem}>Save Changes</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
