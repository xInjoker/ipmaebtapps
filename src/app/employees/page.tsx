
'use client';

import { useState, useMemo } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Upload, Download, Trash2, Edit } from 'lucide-react';
import { useEmployees } from '@/context/EmployeeContext';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { EmployeeForm } from '@/components/employee-form';
import { EmployeeImportDialog } from '@/components/employee-import-dialog';
import { EmployeeExportDialog } from '@/components/employee-export-dialog';
import { type Employee, employeeFieldLabels } from '@/lib/employees';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const allEmployeeFields = Object.keys(employeeFieldLabels) as (keyof Employee)[];

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCustomizeExportOpen, setIsCustomizeExportOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [exportFields, setExportFields] = useState<(keyof Employee)[]>(['name', 'position', 'projectName', 'email', 'employmentStatus']);

  const handleAddNew = () => {
    setEmployeeToEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsFormOpen(true);
  };

  const handleSave = (data: Employee) => {
    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, data);
      toast({ title: 'Employee Updated', description: `${data.name}'s details have been updated.` });
    } else {
      addEmployee(data);
      toast({ title: 'Employee Added', description: `${data.name} has been added to the system.` });
    }
  };

  const handleImport = (importedEmployees: Omit<Employee, 'id'>[]) => {
    importedEmployees.forEach(emp => addEmployee(emp));
    toast({
      title: 'Import Successful',
      description: `${importedEmployees.length} employees have been added.`,
    });
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    const dataToExport = employees.map(emp => {
      const selectedData: Partial<Employee> = {};
      exportFields.forEach(field => {
        selectedData[field] = emp[field];
      });
      return selectedData;
    });

    const headers = exportFields.map(field => employeeFieldLabels[field] || field);
    const body = dataToExport.map(row => exportFields.map(field => row[field] ?? ''));

    if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: exportFields });
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

  const getStatusVariant = (status?: 'Active' | 'Inactive' | 'On Leave') => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'On Leave':
        return 'yellow';
      case 'Inactive':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">All Employees</CardTitle>
              <CardDescription>
                View, manage, and track all employees in the organization.
              </CardDescription>
            </div>
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
                  <DropdownMenuItem onSelect={() => handleExport('excel')}>Export as Excel</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setIsCustomizeExportOpen(true)}>Customize Export Fields</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Contract End</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name || 'N/A'}</TableCell>
                      <TableCell>{employee.position || 'N/A'}</TableCell>
                      <TableCell>{employee.projectName || 'N/A'}</TableCell>
                      <TableCell>{employee.salary ? formatCurrency(employee.salary) : 'N/A'}</TableCell>
                      <TableCell>
                        {employee.contractEndDate ? format(new Date(employee.contractEndDate), 'PPP') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(employee.employmentStatus)}>
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
                            <DropdownMenuItem onSelect={() => handleEdit(employee)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onSelect={() => deleteEmployee(employee.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <EmployeeForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        employee={employeeToEdit}
        onSave={handleSave}
      />
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
    </>
  );
}
