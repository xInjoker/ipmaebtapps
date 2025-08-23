
"use client"

import * as React from "react"
import { useMemo } from 'react';
import type { EquipmentItem, EquipmentType } from '@/lib/equipment';
import { equipmentTypes } from '@/lib/equipment';
import type { Branch } from '@/lib/users';
import { getCalibrationStatus } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Separator } from "./ui/separator";

type EquipmentCalibrationByBranchChartProps = {
  equipment: EquipmentItem[];
  branches: Branch[];
};

type HeatmapCellData = {
  valid: number;
  expiring: number;
  expired: number;
};

type HeatmapData = {
  type: EquipmentType;
  [branchId: string]: HeatmapCellData | string;
};

export const EquipmentCalibrationByBranchChart = React.memo(function EquipmentCalibrationByBranchChart({ equipment, branches }: EquipmentCalibrationByBranchChartProps) {
  const { heatmapData, relevantBranches } = useMemo(() => {
    const data: Record<string, { [branchId: string]: HeatmapCellData }> = {};
    const branchSet = new Set<string>();

    equipment.forEach(item => {
        if (!item.owningBranchId) return;

        branchSet.add(item.owningBranchId);

        const type = item.type;
        if (!data[type]) {
            data[type] = {};
        }
        if (!data[type][item.owningBranchId]) {
            data[type][item.owningBranchId] = { valid: 0, expiring: 0, expired: 0 };
        }

        const status = getCalibrationStatus(new Date(item.calibrationDueDate));
        if (status.variant === 'destructive') {
            data[type][item.owningBranchId].expired++;
        } else if (status.variant === 'yellow') {
            data[type][item.owningBranchId].expiring++;
        } else {
            data[type][item.owningBranchId].valid++;
        }
    });

    const finalBranches = branches.filter(b => branchSet.has(b.id));

    const finalData: HeatmapData[] = equipmentTypes.map(type => {
        const row: HeatmapData = { type };
        finalBranches.forEach(branch => {
            const cellData = data[type]?.[branch.id];
            if (cellData) {
                row[branch.id] = cellData;
            }
        });
        return row;
    }).filter(row => Object.keys(row).length > 1);

    return { heatmapData: finalData, relevantBranches: finalBranches };
  }, [equipment, branches]);

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
                    const cell = row[branch.id] as HeatmapCellData | undefined;
                    if (cell) {
                        const total = cell.valid + cell.expiring + cell.expired;
                        if (total === 0) {
                             return <TableCell key={branch.id} className="text-center p-1"><div className="w-full h-10 bg-muted/30 rounded-md"></div></TableCell>;
                        }
                      return (
                        <TableCell key={branch.id} className="text-center p-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                 <div className="flex items-center justify-center w-full h-10 rounded-md gap-1.5 sm:gap-2">
                                    <span className={cn("flex items-center gap-1 font-bold", cell.valid > 0 ? "text-green-600" : "text-gray-400")}>
                                        <CheckCircle className="h-4 w-4"/> {cell.valid}
                                    </span>
                                    <span className={cn("flex items-center gap-1 font-bold", cell.expiring > 0 ? "text-yellow-600" : "text-gray-400")}>
                                        <Clock className="h-4 w-4"/> {cell.expiring}
                                    </span>
                                     <span className={cn("flex items-center gap-1 font-bold", cell.expired > 0 ? "text-red-600" : "text-gray-400")}>
                                        <XCircle className="h-4 w-4"/> {cell.expired}
                                    </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-bold">{branch.name}</p>
                                <p>Total Equipment: {total}</p>
                                <Separator className="my-1"/>
                                <p>Valid: {cell.valid}</p>
                                <p>Expiring Soon: {cell.expiring}</p>
                                <p>Expired: {cell.expired}</p>
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
