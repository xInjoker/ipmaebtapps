
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, FileText, MapPin } from 'lucide-react';
import { type Inspector } from '@/lib/inspectors';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function InspectorCard({ inspector, branchMap }: { inspector: Inspector, branchMap: Record<string, string> }) {
  const avatarColor = getAvatarColor(inspector.name);
  const totalDocs = inspector.qualifications.length + inspector.otherDocuments.length + (inspector.cvUrl ? 1 : 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {inspector.avatarUrl ? (
              <AvatarImage src={inspector.avatarUrl} alt={inspector.name} />
            ) : null}
            <AvatarFallback className={cn('text-2xl', avatarColor.background, avatarColor.text)}>
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
      <CardContent className="space-y-3 text-sm flex-grow">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{inspector.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{inspector.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{branchMap[inspector.branchId] || 'Unknown Branch'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span>{totalDocs} document{totalDocs !== 1 ? 's' : ''} uploaded</span>
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
