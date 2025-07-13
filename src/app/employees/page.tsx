
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
} from 'lucide-react';
import { useEmployees } from '@/context/EmployeeContext';
import { formatCurrency, getEmployeeStatusVariant } from '@/lib/utils';
import { format } from 'date-fns';
import { EmployeeImportDialog } from '@/components/employee-import-dialog';
import { EmployeeExportDialog } from '@/components/employee-export-dialog';
import { type Employee, employeeFieldLabels, employmentStatuses } from '@/lib/employees';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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

const allEmployeeFields = Object.keys(employeeFieldLabels) as (keyof Employee)[];

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { employees, addEmployee, deleteEmployee } = useEmployees();
  const { user, isHqUser, userHasPermission, branches } = useAuth();
  const { projects } = useProjects();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const initialFilterSet = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const projectsForFilter = useMemo(() => {
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

  const handleDeleteRequest = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!employeeToDelete) return;
    deleteEmployee(employeeToDelete.id);
    toast({
      title: 'Employee Deleted',
      description: `${employeeToDelete.name} has been removed from the system.`,
    });
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleImport = (importedEmployees: Omit<Employee, 'id'>[]) => {
    importedEmployees.forEach((emp) => {
      const newId = `EMP-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)}`;
      addEmployee({ ...emp, id: newId });
    });
    toast({
      title: 'Import Successful',
      description: `${importedEmployees.length} employees have been added.`,
    });
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = filteredEmployees.map((emp) => {
      const selectedData: Partial<Employee> = {};
      exportFields.forEach((field) => {
        selectedData[field] = emp[field];
      });
      return selectedData;
    });

    const headers = exportFields.map(
      (field) => employeeFieldLabels[field] || field
    );
    const body = dataToExport.map((row) =>
      exportFields.map((field) => row[field] ?? '')
    );

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
        header: exportFields,
      });
      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
      XLSX.writeFile(workbook, 'employees.xlsx');
    } else {
      const doc = new jsPDF({ orientation: 'landscape' });
      (doc as any).autoTable({
        head: [headers],
        body: body,
      });
      doc.save('employees.pdf');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProjectFilter('all');
    if (isHqUser) {
        setBranchFilter('all');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline">All Employees</CardTitle>
              <CardDescription>
                View, manage, and track all employees in the organization.
              </CardDescription>
            </div>
            {userHasPermission('manage-employees') && (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
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
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
                    <TableHead>Reporting Manager</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Contract End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isClient ? (
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
                          <Skeleton className="h-5 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="ml-auto h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => {
                        const manager = employees.find(e => e.id === employee.reportingManagerId);
                        return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.name || 'N/A'}
                        </TableCell>
                        <TableCell>{employee.position || 'N/A'}</TableCell>
                        <TableCell>{manager?.name || 'N/A'}</TableCell>
                        <TableCell>{employee.projectName || 'N/A'}</TableCell>
                        <TableCell>
                          {employee.salary
                            ? formatCurrency(employee.salary)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {employee.contractEndDate
                            ? format(new Date(employee.contractEndDate), 'PPP')
                            : 'N/A'}
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
        </Card>
      </div>
      <EmployeeImportDialog
        isOpen={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImport}
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

