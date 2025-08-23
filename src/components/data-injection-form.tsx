

'use client';

import { useState, useMemo } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Project, InvoiceItem, ExpenditureItem } from '@/lib/projects';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type DataType = 'invoicing' | 'cost';
type ParsedData = (InvoiceItem | ExpenditureItem)[];

export function DataInjectionForm() {
  const { projects, updateProject } = useProjects();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [dataType, setDataType] = useState<DataType>('invoicing');
  const [csvData, setCsvData] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData>([]);
  const [isInjecting, setIsInjecting] = useState(false);

  const handlePreview = () => {
    if (!csvData) {
      toast({ variant: 'destructive', title: 'No data to preview.' });
      return;
    }
    try {
        const lines = csvData.trim().split('\n').slice(1); // remove header
        const data: ParsedData = lines.map((line, index) => {
            const values = line.split(';');
            if (dataType === 'invoicing') {
                if (values.length !== 7) throw new Error(`Line ${index + 1} has incorrect number of columns for invoicing data.`);
                return {
                    id: `INJ-INV-${Date.now()}-${index}`,
                    soNumber: values[0],
                    serviceCategory: values[1],
                    description: values[2],
                    status: values[3] as InvoiceItem['status'],
                    period: `${values[4]} ${values[5]}`,
                    value: Number(values[6]),
                } as InvoiceItem;
            } else { // cost
                if (values.length !== 7) throw new Error(`Line ${index + 1} has incorrect number of columns for cost data.`);
                return {
                    id: `INJ-CST-${Date.now()}-${index}`,
                    category: values[0],
                    coa: values[1],
                    description: values[2],
                    period: `${values[3]} ${values[4]}`,
                    amount: Number(values[5]),
                    status: values[6] as ExpenditureItem['status'],
                } as ExpenditureItem;
            }
        });
        setParsedData(data);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'CSV Parsing Error', description: error.message });
        setParsedData([]);
    }
  };
  
  const handleInjectData = async () => {
    if (!selectedProjectId) {
        toast({ variant: 'destructive', title: 'No Project Selected', description: 'Please select a project to inject data into.' });
        return;
    }
    if (parsedData.length === 0) {
        toast({ variant: 'destructive', title: 'No Data to Inject', description: 'Please preview valid CSV data first.' });
        return;
    }

    setIsInjecting(true);
    const targetProject = projects.find(p => p.id === selectedProjectId);
    if (!targetProject) {
        toast({ variant: 'destructive', title: 'Project Not Found' });
        setIsInjecting(false);
        return;
    }

    try {
        let updatedProject: Partial<Project>;
        if (dataType === 'invoicing') {
            updatedProject = { invoices: [...(targetProject.invoices || []), ...parsedData as InvoiceItem[]] };
        } else { // cost
            updatedProject = { costs: [...(targetProject.costs || []), ...parsedData as ExpenditureItem[]] };
        }

        await updateProject(selectedProjectId, updatedProject);

        toast({ title: 'Data Injected Successfully', description: `${parsedData.length} records have been added to project ${targetProject.name}.` });
        setCsvData('');
        setParsedData([]);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Injection Failed', description: error.message });
    } finally {
        setIsInjecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Injection Tool</CardTitle>
        <CardDescription>
            Select a project and data type, then paste semicolon-separated CSV data to inject.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger><SelectValue placeholder="1. Select Project" /></SelectTrigger>
                <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={dataType} onValueChange={(v: DataType) => { setDataType(v); setParsedData([]) }}>
                <SelectTrigger><SelectValue placeholder="2. Select Data Type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="invoicing">Invoicing Data</SelectItem>
                    <SelectItem value="cost">Cost Data</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div>
            <Textarea
                placeholder="3. Paste semicolon-separated CSV data here..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="h-48 font-mono text-xs"
            />
        </div>

        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handlePreview}>Preview Data</Button>
            <Button onClick={handleInjectData} disabled={isInjecting || parsedData.length === 0}>
                {isInjecting ? 'Injecting...' : 'Inject Data'}
            </Button>
        </div>

        {parsedData.length > 0 && (
            <div>
                <h4 className="font-semibold mb-2">Preview</h4>
                <div className="max-h-64 overflow-y-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            {dataType === 'invoicing' ? (
                                <TableRow>
                                    <TableHead>SO Number</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                            ) : (
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>COA</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            )}
                        </TableHeader>
                        <TableBody>
                            {parsedData.map((item: any) => (
                                <TableRow key={item.id}>
                                    {dataType === 'invoicing' ? (
                                        <>
                                            <TableCell>{item.soNumber}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.status}</TableCell>
                                            <TableCell>{item.period}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>{item.category}</TableCell>
                                            <TableCell>{item.coa}</TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>{item.status}</TableCell>
                                            <TableCell>{item.period}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
