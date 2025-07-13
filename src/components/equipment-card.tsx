
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { type EquipmentItem } from '@/lib/equipment';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { getCalibrationStatus, type CalibrationStatus } from '@/lib/utils';

export function EquipmentCard({ item, branchMap }: { item: EquipmentItem; branchMap: Record<string, string> }) {
  const [calibration, setCalibration] = useState<CalibrationStatus | null>(null);
  const { userHasPermission } = useAuth();

  useEffect(() => {
    // This runs only on the client, after hydration
    if (item.calibrationDueDate) {
      setCalibration(getCalibrationStatus(new Date(item.calibrationDueDate)));
    }
  }, [item.calibrationDueDate]);

  return (
    <Card key={item.id} className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <Link href={`/equipment/${item.id}`} className="block hover:underline">
            <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
            <CardDescription>{item.type} &bull; {item.serialNumber}</CardDescription>
          </Link>
        </div>
        {userHasPermission('manage-equipment') && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                <Link href={`/equipment/${item.id}/edit`}>
                    Edit
                </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <Link href={`/equipment/${item.id}`}>
          <div className="aspect-video w-full overflow-hidden rounded-md border">
            <Image
              src={item.imageUrls?.[0] || `https://placehold.co/400x225.png`}
              alt={item.name}
              width={400}
              height={225}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              data-ai-hint={`${item.type.toLowerCase()} equipment`}
            />
          </div>
        </Link>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={item.status === 'Normal' ? 'green' : item.status === 'Broken' ? 'destructive' : 'yellow'}>
              {item.status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Owning Branch</span>
            <span className="font-medium text-right">{branchMap[item.owningBranchId] || item.owningBranchId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location</span>
            <span className="font-medium text-right">{item.currentLocation}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t bg-muted/50 p-4">
        <div className="flex w-full justify-between text-sm">
          <span className="text-muted-foreground">Calibration Due</span>
          <span className="font-medium">{format(new Date(item.calibrationDueDate), 'PPP')}</span>
        </div>
        <div className="flex w-full items-center justify-between">
          <span className="text-muted-foreground text-sm">Validity</span>
          {calibration ? (
            <Badge variant={calibration.variant} className="text-xs">
              {calibration.text}
            </Badge>
          ) : (
            <Skeleton className="h-5 w-16 rounded-full" />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
