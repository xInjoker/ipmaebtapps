
"use client"

import * as React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import type { EquipmentItem, EquipmentType } from '@/lib/equipment';
import { equipmentTypes } from '@/lib/equipment';
import type { Branch } from '@/lib/users';
import { getCalibrationStatus } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";

type EquipmentCalibrationByBranchChartProps = {
  equipment: EquipmentItem[];
  branches: Branch[];
};

type HeatmapData = {
  type: EquipmentType;
  [branchId: string]: {
    count: number;
    status: 'green' | 'yellow' | 'red';
  } | string;
};

export const EquipmentCalibrationByBranchChart = React.memo(function EquipmentCalibrationByBranchChart({ equipment, branches }: EquipmentCalibrationByBranchChartProps) {
  const { heatmapData, relevantBranches } = useMemo(() => {
    const data: Record<string, { [branchId: string]: { count: number; statuses: ('green' | 'yellow' | 'destructive')[] } }> = {};
    const branchSet = new Set<string>();

    equipment.forEach(item => {
        if (!item.owningBranchId) return;

        branchSet.add(item.owningBranchId);

        const type = item.type;
        if (!data[type]) {
            data[type] = {};
        }
        if (!data[type][item.owningBranchId]) {
            data[type][item.owningBranchId] = { count: 0, statuses: [] };
        }

        data[type][item.owningBranchId].count++;
        
        const status = getCalibrationStatus(new Date(item.calibrationDueDate));
        data[type][item.owningBranchId].statuses.push(status.variant);
    });

    const finalBranches = branches.filter(b => branchSet.has(b.id));

    const finalData: HeatmapData[] = equipmentTypes.map(type => {
        const row: HeatmapData = { type };
        finalBranches.forEach(branch => {
            const cellData = data[type]?.[branch.id];
            if (cellData) {
                let finalStatus: 'green' | 'yellow' | 'red' = 'green';
                if (cellData.statuses.includes('destructive')) {
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
    }).filter(row => Object.keys(row).length > 1); // Only include rows that have at least one piece of equipment

    return { heatmapData: finalData, relevantBranches: finalBranches };
  }, [equipment, branches]);

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
        <CardTitle>Equipment Calibration Heatmap</CardTitle>
        <CardDescription>
          Overview of equipment calibration status across types and branches.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 font-semibold min-w-[150px]">Equipment Type</TableHead>
                {relevantBranches.map(branch => (
                  <TableHead key={branch.id} className="text-center">{branch.name.replace('Cabang ', '')}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {heatmapData.map((row) => (
                <TableRow key={row.type}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">{row.type}</TableCell>
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
                                <p>{cell.count} equipment item(s)</p>
                                <p>Status: <span className="capitalize font-semibold">{cell.status === 'red' ? 'Expired' : cell.status === 'yellow' ? 'Expiring Soon' : 'Valid'}</span></p>
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
});
