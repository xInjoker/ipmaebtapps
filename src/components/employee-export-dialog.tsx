

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type Employee, employeeFieldLabels } from '@/lib/employees';
import { ScrollArea } from './ui/scroll-area';

interface EmployeeExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedFields: (keyof Employee)[]) => void;
  allFields: (keyof Employee)[];
  defaultSelectedFields: (keyof Employee)[];
}

export function EmployeeExportDialog({ isOpen, onOpenChange, onSave, allFields, defaultSelectedFields }: EmployeeExportDialogProps) {
  const [selectedFields, setSelectedFields] = useState(new Set(defaultSelectedFields));

  useEffect(() => {
    setSelectedFields(new Set(defaultSelectedFields));
  }, [defaultSelectedFields, isOpen]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedFields(new Set(allFields));
    } else {
      setSelectedFields(new Set());
    }
  }, [allFields]);

  const handleFieldChange = useCallback((field: keyof Employee, checked: boolean) => {
    const newSelection = new Set(selectedFields);
    if (checked) {
      newSelection.add(field);
    } else {
      newSelection.delete(field);
    }
    setSelectedFields(newSelection);
  }, [selectedFields]);

  const handleSave = useCallback(() => {
    onSave(Array.from(selectedFields));
    onOpenChange(false);
  }, [onSave, selectedFields, onOpenChange]);

  const isAllSelected = selectedFields.size === allFields.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Export Fields</DialogTitle>
          <DialogDescription>
            Select the fields you want to include in the exported file.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 border-b pb-2">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm font-medium">Select All Fields</Label>
        </div>
        <ScrollArea className="h-72">
            <div className="grid grid-cols-2 gap-4 p-1">
                {allFields.map((field) => (
                <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                    id={field}
                    checked={selectedFields.has(field)}
                    onCheckedChange={(checked) => handleFieldChange(field, !!checked)}
                    />
                    <Label htmlFor={field} className="text-sm font-normal">
                    {employeeFieldLabels[field] || field}
                    </Label>
                </div>
                ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
