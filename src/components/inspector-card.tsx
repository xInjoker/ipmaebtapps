
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Award, MoreHorizontal, Trash2 } from 'lucide-react';
import { type Inspector } from '@/lib/inspectors';
import { getInitials, getAvatarColor, formatQualificationName, getDocumentStatus, type DocumentStatus } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';


type QualificationWithStatus = {
  name: string;
  status: DocumentStatus;
};

interface InspectorCardProps {
    inspector: Inspector & { type?: 'Inspector' | 'Employee' };
    branchMap: Record<string, string>;
    personnelType?: 'Inspector' | 'Employee';
    onDelete: () => void;
}

export function InspectorCard({ inspector, branchMap, personnelType, onDelete }: InspectorCardProps) {
  const { user } = useAuth();
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
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
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
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <Link href={linkTo} className="hover:underline flex-1 min-w-0">
                            <CardTitle className="font-headline text-lg truncate">{inspector.name}</CardTitle>
                        </Link>
                        {personnelType && <Badge variant={personnelType === 'Inspector' ? 'blue' : 'green'} className="ml-2">{personnelType}</Badge>}
                    </div>
                    <CardDescription>
                        <span className="truncate">{inspector.position}</span>
                    </CardDescription>
                </div>
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
                      <Link href={linkTo}>View Details</Link>
                  </DropdownMenuItem>
                  {user?.roleId === 'super-admin' && (
                      <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
                              <Trash2 className="mr-2 h-4 w-4"/>
                              Delete
                          </DropdownMenuItem>
                      </>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
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
