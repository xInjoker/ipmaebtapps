
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEquipment } from '@/context/EquipmentContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  ArrowLeft,
  Calendar,
  Wrench,
  Tag,
  MapPin,
  Building,
  HardDrive,
  FileText,
  Image as ImageIcon,
  Edit,
} from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { type EquipmentItem } from '@/lib/equipment';
import { useInspectors } from '@/context/InspectorContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';

export default function EquipmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { getEquipmentById } = useEquipment();
  const { inspectors } = useInspectors();
  const { branches } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    const equipmentId = params.id as string;
    if (equipmentId) {
      const item = getEquipmentById(equipmentId);
      setEquipment(item || null);
    }
  }, [params.id, getEquipmentById]);

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
      acc[branch.id] = branch.name;
      return acc;
    }, {} as Record<string, string>);
  }, [branches]);

  const assignedInspectors = useMemo(() => {
    if (!equipment) return [];
    return inspectors.filter(inspector => (equipment.assignedPersonnelIds || []).includes(inspector.id));
  }, [equipment, inspectors]);

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

  if (!equipment) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Equipment Not Found</h1>
        <p className="text-muted-foreground">The equipment you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/equipment">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Equipment
          </Link>
        </Button>
      </div>
    );
  }
  
  const calibration = getCalibrationStatus(new Date(equipment.calibrationDueDate));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
            <Link href="/equipment">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Equipment</span>
            </Link>
            </Button>
            <div>
            <h1 className="font-headline text-2xl font-bold">{equipment.name}</h1>
            <p className="text-muted-foreground">
                {equipment.type} &bull; {equipment.serialNumber}
            </p>
            </div>
        </div>
        <Button asChild>
            <Link href={`/equipment/${equipment.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Equipment
            </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <h3 className="font-semibold text-lg">Equipment Details</h3>
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Tag className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Serial Number</p>
                        <p className="font-medium">{equipment.serialNumber}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Wrench className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{equipment.type}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <HardDrive className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={equipment.status === 'Normal' ? 'green' : equipment.status === 'Broken' ? 'destructive' : 'yellow'}>
                            {equipment.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Building className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Owning Branch</p>
                        <p className="font-medium">{branchMap[equipment.owningBranchId] || equipment.owningBranchId}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Current Location</p>
                        <p className="font-medium">{equipment.currentLocation}</p>
                    </div>
                </div>
            </div>
            <Separator />
            <h3 className="font-semibold text-lg">Calibration Details</h3>
             <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Calibration Due Date</p>
                        <p className="font-medium">{format(new Date(equipment.calibrationDueDate), 'PPP')}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">Validity</p>
                        <Badge variant={calibration.variant} className="text-xs">
                            {calibration.text}
                        </Badge>
                    </div>
                </div>
            </div>
             <Separator />
            <h3 className="font-semibold text-lg">Authorized Personnel</h3>
            <div className="space-y-2">
              {assignedInspectors.length > 0 ? (
                assignedInspectors.map((inspector) => {
                  const avatarColor = getAvatarColor(inspector.name);
                  return (
                    <div key={inspector.id} className="flex items-center gap-3 rounded-md border p-2">
                      <Avatar className="h-9 w-9">
                        {inspector.avatarUrl ? <AvatarImage src={inspector.avatarUrl} alt={inspector.name} /> : null}
                        <AvatarFallback className={cn(avatarColor.background, avatarColor.text)}>
                          {getInitials(inspector.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{inspector.name}</p>
                        <p className="text-xs text-muted-foreground">{branchMap[inspector.branchId] || 'Unknown Branch'}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No personnel assigned.</p>
              )}
            </div>
          </div>
          <div className="space-y-6 lg:col-span-2">
             <div>
                <h3 className="font-semibold text-lg mb-4">Equipment Images</h3>
                {equipment.imageUrls.length > 0 ? (
                    <Carousel className="w-full">
                        <CarouselContent>
                        {equipment.imageUrls.map((url, index) => (
                            <CarouselItem key={index}>
                                <div className="aspect-video w-full overflow-hidden rounded-md border">
                                    <Image
                                        src={url || 'https://placehold.co/400x225.png'}
                                        alt={`${equipment.name} image ${index + 1}`}
                                        width={400}
                                        height={225}
                                        className="h-full w-full object-cover"
                                        data-ai-hint={`${equipment.type.toLowerCase()} equipment`}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                ) : (
                    <div className="flex items-center justify-center h-48 rounded-md border-2 border-dashed bg-muted">
                        <div className="text-center text-muted-foreground">
                            <ImageIcon className="mx-auto h-10 w-10" />
                            <p className="mt-2 text-sm">No images uploaded</p>
                        </div>
                    </div>
                )}
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold text-lg mb-4">Supporting Documents</h3>
                {(equipment.documentUrls || []).length > 0 ? (
                    <div className="space-y-2">
                        {equipment.documentUrls.map((url, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm truncate">{url.split('/').pop()}</span>
                                </div>
                                <Button variant="ghost" size="sm">Download</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-32 rounded-md border-2 border-dashed bg-muted">
                        <div className="text-center text-muted-foreground">
                            <FileText className="mx-auto h-10 w-10" />
                            <p className="mt-2 text-sm">No documents uploaded</p>
                        </div>
                    </div>
                )}
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold text-lg mb-4">Personnel Certifications</h3>
                {(equipment.personnelCertificationUrls || []).length > 0 ? (
                    <div className="space-y-2">
                        {equipment.personnelCertificationUrls.map((url, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm truncate">{url.split('/').pop()}</span>
                                </div>
                                <Button variant="ghost" size="sm">Download</Button>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="flex items-center justify-center h-32 rounded-md border-2 border-dashed bg-muted">
                        <div className="text-center text-muted-foreground">
                            <FileText className="mx-auto h-10 w-10" />
                            <p className="mt-2 text-sm">No certifications uploaded</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
