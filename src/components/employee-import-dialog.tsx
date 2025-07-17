

'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Employee } from '@/lib/employees';
import * as XLSX from 'xlsx';

interface EmployeeImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (employees: Omit<Employee, 'id'>[]) => void;
}

const headerMapping: Record<string, keyof Employee> = {
    NO_KTP: 'nationalId',
    NAMA: 'name',
    TAMPAT_LAHIR: 'placeOfBirth',
    TGL_LAHIR: 'dateOfBirth',
    GENDER: 'gender',
    AGAMA: 'religion',
    ALAMAT: 'address',
    EMAIL: 'email',
    NO_TLP: 'phoneNumber',
    NPWP: 'npwp',
    PTKP: 'ptkpStatus',
    STATUS_PEKERJA: 'employmentStatus',
    JENIS_KONTRAK: 'contractType',
    NO_KONTRAK: 'contractNumber',
    TGL_MULAI: 'contractStartDate',
    TGL_SELESAI: 'contractEndDate',
    JABATAN: 'position',
    UPAH: 'salary',
    UNIT_KERJA: 'workUnit',
    NAMA_UNIT_KERJA: 'workUnitName',
    PORTOFOLIO: 'portfolio',
    SUB_PORTOFOLIO: 'subPortfolio',
    NAMA_PROJECT: 'projectName',
    NO_RAB: 'rabNumber',
    BANK: 'bankName',
    NO_REKENING: 'bankAccountNumber',
    BPJS_KESEHATAN: 'bpjsHealth',
    BPJS_KETENAGAKERJAAN: 'bpjsEmployment',
    KOMPETENSI: 'competency',
};

// Helper to convert Excel serial date to YYYY-MM-DD string
function excelDateToYMD(serial: number) {
    const utc_days  = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;                                        
    const date_info = new Date(utc_value * 1000);
    const year = date_info.getFullYear();
    const month = date_info.getMonth() + 1;
    const dt = date_info.getDate();

    return `${year}-${String(month).padStart(2, '0')}-${String(dt).padStart(2, '0')}`;
}

export function EmployeeImportDialog({ isOpen, onOpenChange, onImport }: EmployeeImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  }, []);

  const handleImport = useCallback(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet);

      const employees: Omit<Employee, 'id'>[] = json.map(row => {
        const employee: Partial<Employee> = {};
        for (const header in row) {
          const mappedKey = headerMapping[header];
          if (mappedKey) {
            let value = row[header];
            // Check for date fields and convert if they are Excel serial numbers
            if (['dateOfBirth', 'contractStartDate', 'contractEndDate'].includes(mappedKey) && typeof value === 'number') {
                value = excelDateToYMD(value);
            }
            (employee as any)[mappedKey] = value;
          }
        }
        return employee as Omit<Employee, 'id'>;
      });
      onImport(employees);
      onOpenChange(false);
    };
    reader.readAsBinaryString(file);
  }, [file, onImport, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Employees from Excel</DialogTitle>
          <DialogDescription>
            Upload an .xlsx file with employee data. Make sure the headers match the required format.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="file-upload">Excel File</Label>
          <Input id="file-upload" type="file" onChange={handleFileChange} accept=".xlsx" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
