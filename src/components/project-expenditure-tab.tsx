
'use client';

import { useState, useMemo } from 'react';
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

const expenditureCategories = [
    'PT dan PTT',
    'PTT Project',
    'Tenaga Ahli dan Labour Supply',
    'Perjalanan Dinas',
    'Operasional',
    'Fasilitas dan Interen',
    'Amortisasi',
    'Kantor dan Diklat',
    'Promosi',
    'Umum',
    'Other',
];

const coaToCategoryMap: { [key: number]: string } = {
    4000: 'PT dan PTT',
    4100: 'PTT Project',
    4200: 'Tenaga Ahli dan Labour Supply',
    4300: 'Perjalanan Dinas',
    4400: 'Operasional',
    4500: 'Fasilitas dan Interen',
    4600: 'Amortisasi',
    4700: 'Kantor dan Diklat',
    4800: 'Promosi',
    4900: 'Umum',
};

const categoryToCoaMap: { [key: string]: string } = {
    'PT dan PTT': '4000',
    'PTT Project': '4100',
    'Tenaga Ahli dan Labour Supply': '4200',
    'Perjalanan Dinas': '4300',
    'Operasional': '4400',
    'Fasilitas dan Interen': '4500',
    'Amortisasi': '4600',
    'Kantor dan Diklat': '4700',
    'Promosi': '4800',
    'Umum': '4900',
    'Other': '',
};

type ProjectExpenditureTabProps = {
    project: Project;
    setProjects: (updateFn: (projects: Project[]) => Project[]) => void;
};

export function ProjectExpenditureTab({ project, setProjects }: ProjectExpenditureTabProps) {
    const [isBudgetFinalized, setIsBudgetFinalized] = useState(true);
    const [isAddExpenditureDialogOpen, setIsAddExpenditureDialogOpen] = useState(false);
    const [newExpenditure, setNewExpenditure] = useState({
        category: '',
        coa: '',
        description: '',
        month: '',
        year: '',
        amount: 0,
        status: 'Approved' as 'Approved' | 'Pending' | 'Rejected',
    });

    const [isEditExpenditureDialogOpen, setIsEditExpenditureDialogOpen] = useState(false);
    const [expenditureToEdit, setExpenditureToEdit] = useState<ExpenditureItem | null>(null);

    const handleBudgetChange = (category: string, value: number) => {
        setProjects(projects => projects.map(p => {
            if (p.id === project.id) {
                return { ...p, budgets: { ...p.budgets, [category]: value } };
            }
            return p;
        }));
    };

    const handleAddExpenditure = () => {
        const period = newExpenditure.month && newExpenditure.year ? `${newExpenditure.month} ${newExpenditure.year}` : '';

        if (newExpenditure.category && period && newExpenditure.coa && newExpenditure.amount > 0) {
            const newId = `EXP-${project.id}-${String(project.expenditures.length + 1).padStart(3, '0')}`;
            const newExpenditureItem: ExpenditureItem = {
                id: newId,
                category: newExpenditure.category,
                coa: newExpenditure.coa,
                description: newExpenditure.description,
                period,
                amount: newExpenditure.amount,
                status: 'Approved',
            };

            setProjects(projects => projects.map(p =>
                p.id === project.id ? { ...p, expenditures: [...p.expenditures, newExpenditureItem] } : p
            ));
            setNewExpenditure({ category: '', coa: '', description: '', month: '', year: '', amount: 0, status: 'Approved' });
            setIsAddExpenditureDialogOpen(false);
        }
    };

    const handleCategorySelect = (value: string) => {
        const coa = categoryToCoaMap[value] || '';
        setNewExpenditure(prev => ({ ...prev, category: value, coa }));
    };

    const handleCoaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const coaValue = e.target.value;
        const coaNumber = parseInt(coaValue, 10);
        let categoryToSet = '';

        if (!isNaN(coaNumber) && coaValue.length >= 4) {
            const truncatedCoa = Math.floor(coaNumber / 100) * 100;
            const category = coaToCategoryMap[truncatedCoa];

            if (category && (project.budgets[category] ?? 0) > 0) {
                categoryToSet = category;
            } else {
                categoryToSet = 'Other';
            }
        } else {
            categoryToSet = 'Other';
        }
        setNewExpenditure(prev => ({ ...prev, coa: coaValue, category: categoryToSet }));
    };

    const handleEditExpenditureClick = (expenditure: ExpenditureItem) => {
        const [month, year] = expenditure.period.split(' ');
        setExpenditureToEdit({ ...expenditure, month, year });
        setIsEditExpenditureDialogOpen(true);
    };

    const handleUpdateExpenditure = () => {
        if (!expenditureToEdit) return;
        const { month, year, ...rest } = expenditureToEdit;
        const period = `${month} ${year}`;
        const updatedExpenditureData = { ...rest, period };

        setProjects(projects => projects.map(p =>
            p.id === project.id
                ? { ...p, expenditures: p.expenditures.map(exp => exp.id === expenditureToEdit.id ? updatedExpenditureData : exp) }
                : p
        ));
        setIsEditExpenditureDialogOpen(false);
        setExpenditureToEdit(null);
    };

    const budgetedCategories = useMemo(() => {
        return expenditureCategories.filter(category => (project.budgets[category] ?? 0) > 0 || category === 'Other');
    }, [project.budgets]);

    const spentByCategory = useMemo(() => {
        return project.expenditures.reduce((acc, item) => {
            if (item.status === 'Approved') {
                acc[item.category] = (acc[item.category] || 0) + item.amount;
            }
            return acc;
        }, {} as { [category: string]: number });
    }, [project.expenditures]);

    const selectedCategory = newExpenditure.category;
    const totalBudgetForCategory = project.budgets[selectedCategory] ?? 0;
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
                            Before adding expenditures, please set a budget for each category for this project.
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
                                {expenditureCategories.map((category) => (
                                    <TableRow key={category}>
                                        <TableCell className="font-medium">{category}</TableCell>
                                        <TableCell className="text-right">
                                            <Input
                                                type="number"
                                                value={project.budgets[category] || 0}
                                                onChange={(e) => handleBudgetChange(category, parseInt(e.target.value) || 0)}
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
                        <div>
                            <CardTitle className="font-headline">Project Expenditure</CardTitle>
                            <CardDescription>
                                Track and manage all expenditures for this project.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setIsBudgetFinalized(false)}>
                                Edit Budget
                            </Button>
                            <Dialog open={isAddExpenditureDialogOpen} onOpenChange={setIsAddExpenditureDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Expenditure
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add New Expenditure</DialogTitle>
                                        <DialogDescription>
                                            Fill in the details for the new expenditure.
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
                                                value={newExpenditure.coa}
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
                                                value={newExpenditure.category}
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
                                                {newExpenditure.category && (
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
                                                    value={newExpenditure.month}
                                                    onValueChange={(value) => setNewExpenditure({ ...newExpenditure, month: value })}
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
                                                    value={newExpenditure.year}
                                                    onChange={(e) => setNewExpenditure({ ...newExpenditure, year: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-start gap-4">
                                            <Label htmlFor="exp-description" className="text-right pt-2">Description</Label>
                                            <Textarea
                                                id="exp-description"
                                                value={newExpenditure.description}
                                                onChange={(e) => setNewExpenditure({ ...newExpenditure, description: e.target.value })}
                                                className="col-span-3"
                                                placeholder="Detailed description of the expenditure."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="amount" className="text-right">Amount (IDR)</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                value={newExpenditure.amount || ''}
                                                onChange={(e) => setNewExpenditure({ ...newExpenditure, amount: parseInt(e.target.value) || 0 })}
                                                className="col-span-3"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddExpenditure}>Add Expenditure</Button>
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
                                {project.expenditures.map((item) => (
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
                                                    <DropdownMenuItem onSelect={() => handleEditExpenditureClick(item)}>Edit</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!project.expenditures?.length && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No expenditures found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Edit Expenditure Dialog */}
            <Dialog open={isEditExpenditureDialogOpen} onOpenChange={setIsEditExpenditureDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    {expenditureToEdit && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Edit Expenditure</DialogTitle>
                                <DialogDescription>Update the details for this expenditure.</DialogDescription>
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
                                        value={expenditureToEdit.coa}
                                        onChange={(e) => setExpenditureToEdit({ ...expenditureToEdit, coa: e.target.value })}
                                        className="col-span-3"
                                        placeholder="Enter COA"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpCategory" className="text-right">Category</Label>
                                    <Select
                                        value={expenditureToEdit.category}
                                        onValueChange={(value) => setExpenditureToEdit({ ...expenditureToEdit, category: value })}
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
                                            value={expenditureToEdit.month}
                                            onValueChange={(value) => setExpenditureToEdit({ ...expenditureToEdit, month: value })}
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
                                            value={expenditureToEdit.year}
                                            onChange={(e) => setExpenditureToEdit({ ...expenditureToEdit, year: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                    <Label htmlFor="editExpDescription" className="text-right pt-2">Description</Label>
                                    <Textarea
                                        id="editExpDescription"
                                        value={expenditureToEdit.description}
                                        onChange={(e) => setExpenditureToEdit({ ...expenditureToEdit, description: e.target.value })}
                                        className="col-span-3"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpAmount" className="text-right">Amount (IDR)</Label>
                                    <Input
                                        id="editExpAmount"
                                        type="number"
                                        value={expenditureToEdit.amount || ''}
                                        onChange={(e) => setExpenditureToEdit({ ...expenditureToEdit, amount: parseInt(e.target.value) || 0 })}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="editExpStatus" className="text-right">Status</Label>
                                    <Select
                                        value={expenditureToEdit.status}
                                        onValueChange={(value: 'Approved' | 'Pending' | 'Rejected') => setExpenditureToEdit({ ...expenditureToEdit, status: value })}
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
                                <Button onClick={handleUpdateExpenditure}>Save Changes</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
