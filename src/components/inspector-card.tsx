
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Award } from 'lucide-react';
import { type Inspector } from '@/lib/inspectors';
import { getInitials, getAvatarColor, formatQualificationName, getDocumentStatus, type DocumentStatus } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

type QualificationWithStatus = {
  name: string;
  status: DocumentStatus;
};

interface InspectorCardProps {
    inspector: Inspector & { type?: 'Inspector' | 'Employee' };
    branchMap: Record<string, string>;
    personnelType?: 'Inspector' | 'Employee';
}

export function InspectorCard({ inspector, branchMap, personnelType }: InspectorCardProps) {
  const avatarColor = getAvatarColor(inspector.name);
  const [qualificationStatuses, setQualificationStatuses] = useState<QualificationWithStatus[]>([]);

  useEffect(() => {
    const statuses = (inspector.qualifications || []).map(q => ({
      name: q.name,
      status: getDocumentStatus(q.expirationDate),
    }));
    setQualificationStatuses(statuses);
  }, [inspector.qualifications]);
  
  const linkTo = personnelType === 'Employee' ? `/employees/${inspector.id}` : `/inspectors/${inspector.id}`;
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {inspector.avatarUrl ? (
              <AvatarImage src={inspector.avatarUrl} alt={inspector.name} />
            ) : null}
            <AvatarFallback
              className="text-2xl"
              style={{
                backgroundColor: avatarColor.background,
                color: avatarColor.color,
              }}
            >
              {getInitials(inspector.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Link href={linkTo} className="hover:underline">
              <CardTitle className="font-headline text-lg">{inspector.name}</CardTitle>
            </Link>
            <CardDescription className="flex items-center gap-2">
                <span>{inspector.position}</span>
                {personnelType && <Badge variant={personnelType === 'Inspector' ? 'info' : 'secondary'}>{personnelType}</Badge>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm flex-grow">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{inspector.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{branchMap[inspector.branchId] || 'Unknown Branch'}</span>
        </div>
         <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-4 w-4 flex-shrink-0" />
                <span>Qualifications</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-1 gap-y-2 min-h-[24px]">
                {qualificationStatuses.length > 0 ? (
                    qualificationStatuses.map(q => (
                        <Badge key={q.name} variant={q.status.variant} className={cn('font-bold')}>{formatQualificationName(q.name)}</Badge>
                    ))
                ) : (inspector.qualifications || []).length > 0 ? (
                    // Skeleton loader if qualifications exist but statuses are not yet computed
                    (inspector.qualifications || []).map(q => <Skeleton key={q.name} className="h-5 w-16 rounded-full" />)
                ) : (
                    <span className="text-xs text-muted-foreground">No qualifications listed</span>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={linkTo}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
