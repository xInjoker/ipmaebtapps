
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type Inspector } from '@/lib/inspectors';
import { type Branch } from '@/lib/users';
import { getDocumentStatus, formatQualificationName } from '@/lib/utils';
import { cn } from '@/lib/utils';

type CombinedPersonnel = Inspector & { type: 'Inspector' | 'Employee' };

type HeatmapProps = {
  inspectors: CombinedPersonnel[];
  branches: Branch[];
};

type HeatmapData = {
  qualification: string;
  [branchId: string]: {
    count: number;
    status: 'green' | 'yellow' | 'red';
  } | string;
};

export function InspectorQualificationHeatmap({ inspectors, branches }: HeatmapProps) {
  const { heatmapData, relevantQualifications, relevantBranches } = useMemo(() => {
    const data: Record<string, { [branchId: string]: { count: number; statuses: ('green' | 'yellow' | 'red')[] } }> = {};
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
                data[qual][inspector.branchId] = { count: 0, statuses: [] };
            }

            data[qual][inspector.branchId].count++;
            
            const cert = inspector.qualifications.find(q => formatQualificationName(q.name) === qual);
            const status = getDocumentStatus(cert?.expirationDate);
            data[qual][inspector.branchId].statuses.push(status.variant as 'green' | 'yellow' | 'red');
        });
    });

    const finalBranches = branches.filter(b => branchSet.has(b.id));

    const finalData: HeatmapData[] = Array.from(qualifications).sort().map(qual => {
        const row: HeatmapData = { qualification: qual };
        finalBranches.forEach(branch => {
            const cellData = data[qual]?.[branch.id];
            if (cellData) {
                let finalStatus: 'green' | 'yellow' | 'red' = 'green';
                if (cellData.statuses.includes('red')) {
                    finalStatus = 'red';
                } else if (cellData.statuses.includes('yellow')) {
                    finalStatus = 'yellow';
                }
                row[branch.id] = {
                    count: cellData.count,
                    status: finalStatus,
                };
            }
        });
        return row;
    });

    return { heatmapData: finalData, relevantQualifications: Array.from(qualifications).sort(), relevantBranches: finalBranches };
  }, [inspectors, branches]);

  const getStatusColor = (status: 'green' | 'yellow' | 'red' | undefined) => {
    switch (status) {
        case 'green': return 'bg-green-500/80';
        case 'yellow': return 'bg-yellow-500/80';
        case 'red': return 'bg-red-500/80';
        default: return 'bg-muted/30';
    }
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
                    const cell = row[branch.id];
                    if (typeof cell === 'object' && cell !== null) {
                      return (
                        <TableCell key={branch.id} className="text-center p-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                 <div className={cn("flex items-center justify-center w-full h-10 rounded-md text-white font-bold text-lg", getStatusColor(cell.status))}>
                                    {cell.count > 0 ? cell.count : ''}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{cell.count} inspector(s)</p>
                                <p>Status: <span className="capitalize font-semibold">{cell.status}</span></p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      );
                    }
                    return <TableCell key={branch.id} className="text-center p-1"><div className="w-full h-10 bg-muted/30 rounded-md"></div></TableCell>;
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
