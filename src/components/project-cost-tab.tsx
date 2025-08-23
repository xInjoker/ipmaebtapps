
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Search, X, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as UiTableFooter } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { Project, ExpenditureItem } from '@/lib/projects';
import { formatCurrency, getCostCategoryVariant } from '@/lib/utils';
import { CurrencyInput } from './ui/currency-input';
import { coaToCategoryMap, categoryToCoaMap, costCategories } from '@/lib/reports';
import { parse } from 'date-fns';

type ProjectCostTabProps = {
    project: Project;
    setProjects: (updateFn: (project: Project) => Project) => void;
};

type SortKey = keyof ExpenditureItem;

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
    
    // Filter states
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'ascending' | 'descending' } | null>(null);

    const availablePeriods = useMemo(() => {
        if (!project.costs) return [];
        const periods = new Set(project.costs.map(cost => cost.period));
        return ['all', ...Array.from(periods)];
    }, [project.costs]);

    const sortedAndFilteredCosts = useMemo(() => {
        let filtered = (project.costs || []).filter(cost => {
            const categoryMatch = categoryFilter === 'all' || cost.category === categoryFilter;
            const periodMatch = periodFilter === 'all' || cost.period === periodFilter;
            const searchMatch = searchTerm.toLowerCase() === '' || cost.description.toLowerCase().includes(searchTerm.toLowerCase());
            return categoryMatch && periodMatch && searchMatch;
        });

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const key = sortConfig.key;
                let aValue = a[key as keyof ExpenditureItem];
                let bValue = b[key as keyof ExpenditureItem];

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
    }, [project.costs, categoryFilter, periodFilter, searchTerm, sortConfig]);

    const paginatedCosts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedAndFilteredCosts.slice(startIndex, endIndex);
    }, [sortedAndFilteredCosts, currentPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(sortedAndFilteredCosts.length / itemsPerPage);
    }, [sortedAndFilteredCosts]);

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, periodFilter, searchTerm, sortConfig]);
    
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

    let budgetStatus: { variant: BadgeProps['variant']; text: string } = { variant: 'green', text: 'Safe' };
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
                                                onValueChange={(value: number) => handleBudgetChange(category, value)}
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
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-4">
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
                                                    onValueChange={(value: number) => setNewCost({ ...newCost, amount: value })}
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
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 bg-muted/50 rounded-lg">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 w-full"
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by category..." /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {costCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={periodFilter} onValueChange={setPeriodFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by period..." /></SelectTrigger>
                                <SelectContent>
                                    {availablePeriods.map(p => <SelectItem key={p} value={p}>{p === 'all' ? 'All Periods' : p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Button variant="ghost" size="icon" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setPeriodFilter('all'); }}><X className="h-4 w-4" /></Button>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('category')}>Category {getSortIndicator('category')}</Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('description')}>Description {getSortIndicator('description')}</Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('coa')}>COA {getSortIndicator('coa')}</Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => requestSort('period')}>Period {getSortIndicator('period')}</Button></TableHead>
                                    <TableHead className="text-right"><Button variant="ghost" onClick={() => requestSort('amount')}>Amount {getSortIndicator('amount')}</Button></TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCosts.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell><Badge variant={getCostCategoryVariant(item.category)}>{item.category}</Badge></TableCell>
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
                                {sortedAndFilteredCosts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No costs found for the selected filters.</TableCell>
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
                                        onValueChange={(value: number) => setCostToEdit({ ...costToEdit, amount: value })}
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
