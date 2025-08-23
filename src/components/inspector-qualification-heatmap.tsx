
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Inspector } from '@/lib/inspectors';
import { type Branch } from '@/lib/users';
import { getDocumentStatus, formatQualificationName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

type CombinedPersonnel = Inspector & { type: 'Inspector' | 'Employee' };

type HeatmapProps = {
  inspectors: CombinedPersonnel[];
  branches: Branch[];
};

type HeatmapCellData = {
    count: number;
    valid: number;
    expiring: number;
    expired: number;
};

type HeatmapData = {
  qualification: string;
  [branchId: string]: HeatmapCellData | string;
};

export function InspectorQualificationHeatmap({ inspectors, branches }: HeatmapProps) {
  const { heatmapData, relevantQualifications, relevantBranches } = useMemo(() => {
    const data: Record<string, { [branchId: string]: HeatmapCellData }> = {};
    const qualifications = new Set<string>();
    const branchSet = new Set<string>();

    inspectors.forEach(inspector => {
        if (!inspector.branchId) return;

        const uniqueQualifications = new Set<string>();
        (inspector.qualifications || []).forEach(q => {
            if (q.name) {
                uniqueQualifications.add(formatQualificationName(q.name));
            }
        });

        uniqueQualifications.forEach(qual => {
            qualifications.add(qual);
            branchSet.add(inspector.branchId);

            if (!data[qual]) {
                data[qual] = {};
            }
            if (!data[qual][inspector.branchId]) {
                data[qual][inspector.branchId] = { count: 0, valid: 0, expiring: 0, expired: 0 };
            }

            data[qual][inspector.branchId].count++;
            
            const cert = inspector.qualifications.find(q => formatQualificationName(q.name) === qual);
            const status = getDocumentStatus(cert?.expirationDate);

            if (status.variant === 'destructive') {
                data[qual][inspector.branchId].expired++;
            } else if (status.variant === 'yellow') {
                data[qual][inspector.branchId].expiring++;
            } else {
                data[qual][inspector.branchId].valid++;
            }
        });
    });

    const finalBranches = branches.filter(b => branchSet.has(b.id));

    const finalData: HeatmapData[] = Array.from(qualifications).sort().map(qual => {
        const row: HeatmapData = { qualification: qual };
        finalBranches.forEach(branch => {
            const cellData = data[qual]?.[branch.id];
            if (cellData) {
                row[branch.id] = cellData;
            }
        });
        return row;
    });

    return { heatmapData: finalData, relevantQualifications: Array.from(qualifications).sort(), relevantBranches: finalBranches };
  }, [inspectors, branches]);

  const getStatusColor = (cell: HeatmapCellData | undefined) => {
    if (!cell || cell.count === 0) return 'bg-muted/30';
    if (cell.expired > 0) return 'bg-red-500/80';
    if (cell.expiring > 0) return 'bg-yellow-500/80';
    return 'bg-green-500/80';
  };


  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Qualification Distribution Heatmap</CardTitle>
        <CardDescription>
          Overview of inspector qualifications and their certificate status across branches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 font-semibold min-w-[200px]">Qualification</TableHead>
                {relevantBranches.map(branch => (
                  <TableHead key={branch.id} className="text-center">{branch.name.replace('Cabang ', '')}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {heatmapData.map((row) => (
                <TableRow key={row.qualification}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">{row.qualification}</TableCell>
                  {relevantBranches.map(branch => {
                    const cell = row[branch.id] as HeatmapCellData | undefined;
                    const total = cell ? cell.count : 0;
                    
                    if (total === 0) {
                      return <TableCell key={branch.id} className="text-center p-1"><div className="w-full h-10 bg-muted/30 rounded-md"></div></TableCell>;
                    }
                    
                    return (
                      <TableCell key={branch.id} className="text-center p-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <div className={cn("flex items-center justify-center w-full h-10 rounded-md text-white font-bold text-lg", getStatusColor(cell))}>
                                  {total > 0 ? total : ''}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-bold">{branch.name}</p>
                              <p>Total Inspectors: {total}</p>
                              {cell && (
                                <>
                                    <Separator className="my-1"/>
                                    <p>Valid: {cell.valid}</p>
                                    <p>Expiring Soon: {cell.expiring}</p>
                                    <p>Expired: {cell.expired}</p>
                                </>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
