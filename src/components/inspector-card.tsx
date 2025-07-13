
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

export function InspectorCard({ inspector, branchMap }: { inspector: Inspector, branchMap: Record<string, string> }) {
  const avatarColor = getAvatarColor(inspector.name);
  const [qualificationStatuses, setQualificationStatuses] = useState<QualificationWithStatus[]>([]);

  useEffect(() => {
    const statuses = inspector.qualifications.map(q => ({
      name: q.name,
      status: getDocumentStatus(q.expirationDate),
    }));
    setQualificationStatuses(statuses);
  }, [inspector.qualifications]);
  
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
          <div>
            <Link href={`/inspectors/${inspector.id}`} className="hover:underline">
              <CardTitle className="font-headline text-lg">{inspector.name}</CardTitle>
            </Link>
            <CardDescription>{inspector.position}</CardDescription>
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
                ) : inspector.qualifications.length > 0 ? (
                    // Skeleton loader if qualifications exist but statuses are not yet computed
                    inspector.qualifications.map(q => <Skeleton key={q.name} className="h-5 w-16 rounded-full" />)
                ) : (
                    <span className="text-xs text-muted-foreground">No qualifications listed</span>
                )}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/inspectors/${inspector.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
