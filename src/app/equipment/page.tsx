
'use client';

import { useMemo } from 'react';
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
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEquipment } from '@/context/EquipmentContext';
import { format, isPast, differenceInDays } from 'date-fns';

export default function EquipmentPage() {
  const { branches } = useAuth();
  const { equipmentList } = useEquipment();

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);
  }, [branches]);


  const getCalibrationStatus = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cleanDueDate = new Date(dueDate);
    cleanDueDate.setHours(0, 0, 0, 0);

    if (isPast(cleanDueDate)) {
      return { text: 'Expired', variant: 'destructive' as const };
    }
    const daysLeft = differenceInDays(cleanDueDate, today);
    if (daysLeft <= 30) {
      return { text: `Expires in ${daysLeft} days`, variant: 'yellow' as const };
    }
    return { text: 'Valid', variant: 'green' as const };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline">Equipment Management</CardTitle>
            <CardDescription>
              Monitor and manage all operational equipment.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/equipment/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Equipment
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {equipmentList.map((item) => {
                const calibration = getCalibrationStatus(new Date(item.calibrationDueDate));
                return (
                  <Card key={item.id} className="flex flex-col">
                    <CardHeader className="flex-row items-start justify-between">
                      <div>
                          <CardTitle className="font-headline text-lg">{item.name}</CardTitle>
                          <CardDescription>{item.type}</CardDescription>
                      </div>
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
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
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
                          <Badge variant={calibration.variant} className="text-xs">
                              {calibration.text}
                          </Badge>
                        </div>
                    </CardFooter>
                  </Card>
                );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
