
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { Project, ExpenditureItem } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { CurrencyInput } from './ui/currency-input';
import { coaToCategoryMap, categoryToCoaMap, costCategories } from '@/lib/reports';

type ProjectCostTabProps = {
    project: Project;
    setProjects: (updateFn: (project: Project) => Project) => void;
};

export function ProjectCostTab({ project, setProjects }: ProjectCostTabProps) {
    const [isBudgetFinalized, setIsBudgetFinalized] = useState(true);
    const [isAddCostDialogOpen, setIsAddCostDialogOpen] = useState(false);
    const [newCost, setNewCost] = useState({
        category: '',
        coa: '',
        description: '',
        month: '',
        year: '',
        amount: 0,
        status: 'Approved' as 'Approved' | 'Pending' | 'Rejected',
    });

    const [isEditCostDialogOpen, setIsEditCostDialogOpen] = useState(false);
    const [costToEdit, setCostToEdit] = useState<(ExpenditureItem & { month?: string, year?: string }) | null>(null);

    const handleBudgetChange = useCallback((category: string, value: number) => {
        setProjects(p => ({ ...p, budgets: { ...(p.budgets || {}), [category]: value } }));
    }, [setProjects]);

    const handleAddCost = useCallback(() => {
        const period = newCost.month && newCost.year ? `${newCost.month} ${newCost.year}` : '';

        if (newCost.category && period && newCost.coa && newCost.amount > 0) {
            const newId = `EXP-${project.id}-${String((project.costs || []).length + 1).padStart(3, '0')}`;
            const newCostItem: ExpenditureItem = {
                id: newId,
                category: newCost.category,
                coa: newCost.coa,
                description: newCost.description,
                period,
                amount: newCost.amount,
                status: 'Approved',
            };

            setProjects(p => ({ ...p, costs: [...(p.costs || []), newCostItem] }));
            setNewCost({ category: '', coa: '', description: '', month: '', year: '', amount: 0, status: 'Approved' });
            setIsAddCostDialogOpen(false);
        }
    }, [newCost, project, setProjects]);

    const handleCategorySelect = useCallback((value: string) => {
        const coa = categoryToCoaMap[value] || '';
        setNewCost(prev => ({ ...prev, category: value, coa }));
    }, []);

    const handleCoaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const coaValue = e.target.value;
        const coaNumber = parseInt(coaValue, 10);
        let categoryToSet = '';

        if (!isNaN(coaNumber) && coaValue.length >= 4) {
            const truncatedCoa = Math.floor(coaNumber / 100) * 100;
            const category = coaToCategoryMap[truncatedCoa];

            if (category && ((project.budgets || {})[category] ?? 0) > 0) {
                categoryToSet = category;
            } else {
                categoryToSet = 'Other';
            }
        } else {
            categoryToSet = 'Other';
        }
        setNewCost(prev => ({ ...prev, coa: coaValue, category: categoryToSet }));
    }, [project.budgets]);

    const handleEditCostClick = useCallback((cost: ExpenditureItem) => {
        const [month, year] = cost.period.split(' ');
        setCostToEdit({ ...cost, month, year });
        setIsEditCostDialogOpen(true);
    }, []);

    const handleUpdateCost = useCallback(() => {
        if (!costToEdit) return;
        const { month, year, ...rest } = costToEdit;
        const period = `${month} ${year}`;
        const updatedCostData = { ...rest, period };

        setProjects(p => ({ ...p, costs: (p.costs || []).map(exp => exp.id === costToEdit.id ? updatedCostData : exp) }));
        setIsEditCostDialogOpen(false);
        setCostToEdit(null);
    }, [costToEdit, setProjects]);

    const budgetedCategories = useMemo(() => {
        return costCategories.filter(category => ((project.budgets || {})[category] ?? 0) > 0 || category === 'Other');
    }, [project.budgets]);

    const spentByCategory = useMemo(() => {
        return (project.costs || []).reduce((acc, item) => {
            if (item.status === 'Approved') {
                acc[item.category] = (acc[item.category] || 0) + item.amount;
            }
            return acc;
        }, {} as { [category: string]: number });
    }, [project.costs]);

    const selectedCategory = newCost.category;
    const totalBudgetForCategory = (project.budgets || {})[selectedCategory] ?? 0;
    const spentAmountForCategory = spentByCategory[selectedCategory] || 0;
    const remainingBudget = totalBudgetForCategory - spentAmountForCategory;

    let budgetStatus: { variant: 'green' | 'yellow' | 'orange' | 'destructive'; text: string } = { variant: 'green', text: 'Safe' };
    if (selectedCategory && totalBudgetForCategory > 0) {
        const remainingPercentage = (remainingBudget / totalBudgetForCategory) * 100;
        if (remainingPercentage <= 0) {
            budgetStatus = { variant: 'destructive', text: 'Over Budget' };
        } else if (remainingPercentage <= 10) {
            budgetStatus = { variant: 'orange', text: 'Low' };
        } else if (remainingPercentage <= 30) {
            budgetStatus = { variant: 'yellow', text: 'Warning' };
        }
    }

    return (
        <>
            {!isBudgetFinalized ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Set Category Budgets</CardTitle>
                        <CardDescription>
                            Before adding costs, please set a budget for each category for this project.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Budget (IDR)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {costCategories.map((category) => (
                                    <TableRow key={category}>
                                        <TableCell className="font-medium">{category}</TableCell>
                                        <TableCell className="text-right">
                                            <CurrencyInput
                                                value={(project.budgets || {})[category] || 0}
                                                onValueChange={(value) => handleBudgetChange(category, value)}
                                                className="ml-auto max-w-xs text-right"
                                                placeholder="Enter budget"
                                                disabled={category === 'Other'}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button onClick={() => setIsBudgetFinalized(true)}>Finalize Budget</Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1.5">
                            <CardTitle className="font-headline">Project Cost</CardTitle>
                            <CardDescription>
                                Track and manage all costs for this project.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setIsBudgetFinalized(false)}>
                                Edit Budget
                            </Button>
                            <Dialog open={isAddCostDialogOpen} onOpenChange={setIsAddCostDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Cost
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add New Cost</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details for the new cost.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="project-name" className="text-right">
                                                Project
                                            </Label>
                                            <Input id="project-name" value={project.name} disabled className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="coa" className="text-right">
                                                COA
                                            </Label>
                                            <Input
                                                id="coa"
                                                value={newCost.coa}
                                                onChange={handleCoaChange}
                                                className="col-span-3"
                                                placeholder="Enter COA to auto-fill category"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="category" className="text-right">
                                                Category
                                            </Label>
                                            <Select
                                                value={newCost.category}
                                                onValueChange={handleCategorySelect}
                                            >
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {budgetedCategories.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="remainingBudget" className="text-right">
                                                Remaining
                                            </Label>
                                            <div className="col-span-3 flex items-center gap-2 text-sm font-medium">
                                                <span>{formatCurrency(remainingBudget)}</span>
                                                {newCost.category && (
                                                    <Badge variant={budgetStatus.variant}>{budgetStatus.text}</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="periodMonth" className="text-right">
                                                Period
                                            </Label>
                                            <div className="col-span-3 grid grid-cols-2 gap-2">
                                                <Select
                                                    value={newCost.month}
                                                    onValueChange={(value) => setNewCost({ ...newCost, month: value })}
                                                >
                                                    <SelectTrigger id="periodMonth"><SelectValue placeholder="Month" /></SelectTrigger>
                                                    <SelectContent>
                                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    id="periodYear"
                                                    type="number"
                                                    placeholder="Year"
                                                    value={newCost.year}
                                                    onChange={(e) => setNewCost({ ...newCost, year: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-start gap-4">
                                            <Label htmlFor="exp-description" className="text-right pt-2">Description</Label>
                                            <Textarea
                                                id="exp-description"
                                                value={newCost.description}
                                                onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                                                className="col-span-3"
                                                placeholder="Detailed description of the cost."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="amount" className="text-right">Amount (IDR)</Label>
                                             <CurrencyInput
                                                id="amount"
                                                value={newCost.amount}
                                                onValueChange={(value) => setNewCost({ ...newCost, amount: value })}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddCost}>Add Cost</Button>
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
                                    <TableHead>Category</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>COA</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(project.costs || []).map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.id}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.coa}</TableCell>
                                        <TableCell>{item.period}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => handleEditCostClick(item)}>Edit</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!(project.costs || [])?.length && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No costs found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Edit Cost Dialog */}
            <Dialog open={isEditCostDialogOpen} onOpenChange={setIsEditCostDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    {costToEdit && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Cost</DialogTitle>
                                <DialogDescription>Update the details for this cost.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpProjectName" className="text-right">Project</Label>
                                    <Input id="editExpProjectName" value={project.name} disabled className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpCoa" className="text-right">COA</Label>
                                    <Input
                                        id="editExpCoa"
                                        value={costToEdit.coa}
                                        onChange={(e) => setCostToEdit({ ...costToEdit, coa: e.target.value })}
                                        className="col-span-3"
                                        placeholder="Enter COA"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpCategory" className="text-right">Category</Label>
                                    <Select
                                        value={costToEdit.category}
                                        onValueChange={(value) => setCostToEdit({ ...costToEdit, category: value })}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {budgetedCategories.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpPeriodMonth" className="text-right">Period</Label>
                                    <div className="col-span-3 grid grid-cols-2 gap-2">
                                        <Select
                                            value={costToEdit.month}
                                            onValueChange={(value) => setCostToEdit({ ...costToEdit, month: value })}
                                        >
                                            <SelectTrigger id="editExpPeriodMonth"><SelectValue placeholder="Month" /></SelectTrigger>
                                            <SelectContent>
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            id="editExpPeriodYear"
                                            type="number"
                                            placeholder="Year"
                                            value={costToEdit.year}
                                            onChange={(e) => setCostToEdit({ ...costToEdit, year: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="editExpDescription" className="text-right pt-2">Description</Label>
                                    <Textarea
                                        id="editExpDescription"
                                        value={costToEdit.description}
                                        onChange={(e) => setCostToEdit({ ...costToEdit, description: e.target.value })}
                                        className="col-span-3"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpAmount" className="text-right">Amount (IDR)</Label>
                                    <CurrencyInput
                                        id="editExpAmount"
                                        value={costToEdit.amount}
                                        onValueChange={(value) => setCostToEdit({ ...costToEdit, amount: value })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpStatus" className="text-right">Status</Label>
                                    <Select
                                        value={costToEdit.status}
                                        onValueChange={(value: 'Approved' | 'Pending' | 'Rejected') => setCostToEdit({ ...costToEdit, status: value })}
                                    >
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleUpdateCost}>Save Changes</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
