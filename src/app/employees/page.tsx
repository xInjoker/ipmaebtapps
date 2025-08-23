

'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  Search,
  X,
  Users,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';
import { useEmployees } from '@/context/EmployeeContext';
import { formatCurrency, getEmployeeStatusVariant } from '@/lib/utils';
import { format } from 'date-fns';
import { EmployeeImportDialog } from '@/components/employee-import-dialog';
import { EmployeeExportDialog } from '@/components/employee-export-dialog';
import { type Employee, employeeFieldLabels, employmentStatuses } from '@/lib/employees';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/context/ProjectContext';
import { HeaderCard } from '@/components/header-card';
import { DashboardWidget } from '@/components/dashboard-widget';
import { Switch } from '@/components/ui/switch';


const allEmployeeFields = Object.keys(employeeFieldLabels) as (keyof Employee)[];

export default function EmployeesPage() {
  const router = useRouter();
  const { employees, deleteEmployee, isLoading, updateEmployee } = useEmployees();
  const { user, isHqUser, userHasPermission, branches } = useAuth();
  const { projects } = useProjects();
  const { toast } = useToast();
  const initialFilterSet = useRef(false);


  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCustomizeExportOpen, setIsCustomizeExportOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [exportFields, setExportFields] = useState<(keyof Employee)[]>([
    'name',
    'position',
    'projectName',
    'email',
    'employmentStatus',
  ]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    if (user && !isHqUser && !initialFilterSet.current) {
        setBranchFilter(user.branchId);
        initialFilterSet.current = true;
    }
  }, [user, isHqUser]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchMatch =
        searchTerm.toLowerCase() === '' ||
        (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilter === 'all' || emp.employmentStatus === statusFilter;
      
      const branchMatch =
        branchFilter === 'all' || emp.workUnit === branchFilter;
        
      const projectMatch =
        projectFilter === 'all' || emp.projectName === projectFilter;

      // Non-HQ users should only see employees from their branch
      if (!isHqUser && user && emp.workUnit !== user.branchId) {
          return false;
      }
      
      return searchMatch && statusMatch && branchMatch && projectMatch;
    });
  }, [employees, searchTerm, statusFilter, branchFilter, projectFilter, isHqUser, user]);
  
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredEmployees.length / itemsPerPage);
  }, [filteredEmployees]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, branchFilter, projectFilter]);


  const dashboardStats = useMemo(() => {
    const statusCounts = filteredEmployees.reduce((acc, emp) => {
      if (emp.employmentStatus) {
        acc[emp.employmentStatus] = (acc[emp.employmentStatus] || 0) + 1;
      }
      return acc;
    }, {} as Record<typeof employmentStatuses[number], number>);

    return {
      total: filteredEmployees.length,
      active: statusCounts['Active'] || 0,
      onLeave: statusCounts['On Leave'] || 0,
      inactive: statusCounts['Inactive'] || 0,
    };
  }, [filteredEmployees]);

  const widgetData = useMemo(() => [
    {
      title: 'Total Employees',
      value: `${dashboardStats.total}`,
      description: 'employees in the system',
      icon: Users,
      iconColor: 'text-blue-500',
      shapeColor: 'text-blue-500/10',
    },
    {
      title: 'Active Employees',
      value: `${dashboardStats.active}`,
      description: 'currently active employees',
      icon: UserCheck,
      iconColor: 'text-green-500',
      shapeColor: 'text-green-500/10',
    },
    {
      title: 'On Leave',
      value: `${dashboardStats.onLeave}`,
      description: 'employees on leave',
      icon: Clock,
      iconColor: 'text-amber-500',
      shapeColor: 'text-amber-500/10',
    },
    {
      title: 'Inactive Employees',
      value: `${dashboardStats.inactive}`,
      description: 'employees marked as inactive',
      icon: UserX,
      iconColor: 'text-rose-500',
      shapeColor: 'text-rose-500/10',
    },
  ], [dashboardStats]);

  const projectsForFilter = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    if (branchFilter === 'all') {
      return projects;
    }
    return projects.filter(p => p.branchId === branchFilter);
  }, [projects, branchFilter]);

  useEffect(() => {
    // If the currently selected project is not in the new list of available projects, reset the filter.
    if (projectFilter !== 'all' && !projectsForFilter.some(p => p.name === projectFilter)) {
        setProjectFilter('all');
    }
  }, [projectsForFilter, projectFilter]);

  const handleDeleteRequest = useCallback((employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!employeeToDelete) return;
    deleteEmployee(employeeToDelete.id);
    toast({
      title: 'Employee Deleted',
      description: `${employeeToDelete.name} has been removed from the system.`,
    });
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  }, [employeeToDelete, deleteEmployee, toast]);

  const handleExport = useCallback(async (format: 'excel' | 'pdf') => {
    const dataToExport = filteredEmployees.map((emp) => {
      const selectedData: Partial<Employee> = {};
      exportFields.forEach((field) => {
        (selectedData as any)[field] = emp[field];
      });
      return selectedData;
    });

    const headers = exportFields.map(
      (field) => employeeFieldLabels[field] || field
    );
    const body = dataToExport.map((row) =>
      exportFields.map((field) => (row as any)[field] ?? '')
    );

    if (format === 'excel') {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
        header: exportFields,
      });
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
      XLSX.writeFile(workbook, 'employees.xlsx');
    } else {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF({ orientation: 'landscape' });
      autoTable(doc, {
        head: [headers],
        body: body,
      });
      doc.save('employees.pdf');
    }
  }, [filteredEmployees, exportFields]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setProjectFilter('all');
    if (isHqUser) {
        setBranchFilter('all');
    }
  }, [isHqUser]);

   const handlePromotionToggle = useCallback(async (employee: Employee, isPromoted: boolean) => {
        const updatedEmployee = { ...employee, isPromotedToInspector: isPromoted };
        // We pass empty newDocs because we are not uploading files here
        await updateEmployee(employee.id, updatedEmployee, { newCvFile: null, newQualifications: [], newOtherDocs: [] });
        toast({
            title: 'Employee Updated',
            description: `${employee.name} has been ${isPromoted ? 'promoted' : 'demoted'} ${isPromoted ? 'to' : 'from'} inspector list.`
        });
    }, [updateEmployee, toast]);

  return (
    <>
      <div className="space-y-6">
        <HeaderCard
          title="All Employees"
          description="View, manage, and track all employees in the organization."
        >
             {userHasPermission('manage-employees') && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => handleExport('excel')}>
                      Export as Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleExport('pdf')}>
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setIsCustomizeExportOpen(true)}
                    >
                      Customize Export Fields
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button asChild>
                  <Link href="/employees/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Employee
                  </Link>
                </Button>
              </div>
            )}
        </HeaderCard>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {widgetData.map((widget, index) => (
            <DashboardWidget key={index} {...widget} />
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center z-10 relative">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {employmentStatuses.map(
                      (status) =>
                        status && (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
                <Select value={branchFilter} onValueChange={setBranchFilter} disabled={!isHqUser}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Filter by branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Filter by project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projectsForFilter.map((project) => (
                      <SelectItem key={project.id} value={project.name}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Contract End</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Promote to Inspector</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && employees.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-12" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="ml-auto h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedEmployees.length > 0 ? (
                    paginatedEmployees.map((employee) => {
                        return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.name || 'N/A'}
                        </TableCell>
                        <TableCell>{employee.position || 'N/A'}</TableCell>
                        <TableCell>{employee.projectName || 'N/A'}</TableCell>
                        <TableCell>
                          {employee.contractEndDate ? format(new Date(employee.contractEndDate), 'PPP') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {employee.salary ? formatCurrency(employee.salary) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getEmployeeStatusVariant(
                              employee.employmentStatus
                            )}
                          >
                            {employee.employmentStatus || 'Unknown'}
                          </Badge>
                        </TableCell>
                         <TableCell>
                          <Switch
                            checked={employee.isPromotedToInspector}
                            onCheckedChange={(checked) => handlePromotionToggle(employee, checked)}
                            disabled={!userHasPermission('manage-inspectors')}
                           />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() =>
                                  router.push(`/employees/${employee.id}`)
                                }
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View</span>
                              </DropdownMenuItem>
                              {userHasPermission('manage-employees') && <>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    router.push(`/employees/${employee.id}/edit`)
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={() => handleDeleteRequest(employee)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )})
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No employees found. Try adjusting your search or filter
                        criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
      </div>
      <EmployeeImportDialog
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={() => {}}
      />
      <EmployeeExportDialog
        isOpen={isCustomizeExportOpen}
        onOpenChange={setIsCustomizeExportOpen}
        onSave={setExportFields}
        allFields={allEmployeeFields}
        defaultSelectedFields={exportFields}
      />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              {employeeToDelete?.name}'s record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEmployeeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
