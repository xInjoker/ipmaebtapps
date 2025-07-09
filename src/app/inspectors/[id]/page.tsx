
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInspectors } from '@/context/InspectorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Mail, Phone, FileText, Download, Award, Paperclip, CalendarDays, MapPin } from 'lucide-react';
import { type Inspector } from '@/lib/inspectors';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format, isPast, differenceInDays } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const getDocumentStatus = (dueDateString?: string) => {
    if (!dueDateString) {
        return { text: 'No Expiry', variant: 'secondary' as const };
    }
    const dueDate = new Date(dueDateString);
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

function formatDocumentName(name?: string) {
    if (!name) return 'Untitled Document';
    // Remove file extension and replace underscores/hyphens with spaces.
    return name.replace(/\.[^/.]+$/, "").replace(/[_.-]/g, ' ');
}


export default function InspectorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { getInspectorById } = useInspectors();
  const { branches, userHasPermission } = useAuth();
  const [inspector, setInspector] = useState<Inspector | null>(null);

  useEffect(() => {
    const inspectorId = params.id as string;
    if (inspectorId) {
      const item = getInspectorById(inspectorId);
      setInspector(item || null);
    }
  }, [params.id, getInspectorById]);

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
        acc[branch.id] = branch.name;
        return acc;
    }, {} as Record<string, string>);
  }, [branches]);
  
  if (!inspector) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Inspector Not Found</h1>
        <p className="text-muted-foreground">The inspector you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/inspectors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inspector Database
          </Link>
        </Button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(inspector.name);
  const iconColors = ['#0D5EA6', '#0ABAB5', '#00C897', '#FFA955', '#FFD63A', '#FFBE98'];
  let colorIndex = 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
            <Link href="/inspectors">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Inspectors</span>
            </Link>
            </Button>
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    {inspector.avatarUrl ? <AvatarImage src={inspector.avatarUrl} alt={inspector.name} /> : null}
                    <AvatarFallback className={cn('text-2xl', avatarColor.background, avatarColor.text)}>
                        {getInitials(inspector.name)}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-headline text-2xl font-bold">{inspector.name}</h1>
                    <Badge>{inspector.position}</Badge>
                </div>
            </div>
        </div>
        {userHasPermission('manage-inspectors') && (
            <Button asChild>
                <Link href={`/inspectors/${inspector.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Inspector
                </Link>
            </Button>
        )}
      </div>

      <Card>
        <CardContent className="grid gap-6 p-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            <h3 className="font-semibold text-lg">Contact Information</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                        <Mail className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{inspector.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                        <Phone className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{inspector.phone}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                        <MapPin className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{branchMap[inspector.branchId] || 'Unknown Branch'}</p>
                    </div>
                </div>
            </div>
          </div>
          <div className="space-y-6 md:col-span-2">
            <h3 className="font-semibold text-lg">Documents</h3>
            <div className="space-y-4">
                <div>
                    <h4 className="flex items-center text-md font-medium mb-2"><FileText className="mr-2 h-5 w-5"/>CV</h4>
                    {inspector.cvUrl ? (
                         <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                            <div className="flex items-center gap-2 truncate">
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm truncate" title={inspector.cvUrl}>{formatDocumentName(inspector.cvUrl.split('/').pop())}</span>
                            </div>
                            <Button variant="ghost" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button>
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No CV uploaded.</p>}
                </div>
                <Separator />
                 <div>
                    <h4 className="flex items-center text-md font-medium mb-2"><Award className="mr-2 h-5 w-5"/>Qualification Certificates</h4>
                    {inspector.qualifications.length > 0 ? (
                         <div className="space-y-2">
                            {inspector.qualifications.map((doc, index) => {
                                const status = getDocumentStatus(doc.expirationDate);
                                return (
                                <div key={index} className="flex flex-col gap-2 p-2 rounded-md border bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="h-4 w-4 flex-shrink-0" />
                                            <span className="text-sm font-medium truncate" title={doc.name}>{formatDocumentName(doc.name)}</span>
                                        </div>
                                        <Button variant="ghost" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button>
                                    </div>
                                    <div className="flex items-center justify-between pl-6">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                           {doc.expirationDate && <>
                                            <CalendarDays className="h-3 w-3" />
                                            <span>Expires: {format(new Date(doc.expirationDate), 'PPP')}</span>
                                           </>}
                                        </div>
                                        <Badge variant={status.variant} className="text-xs">{status.text}</Badge>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No qualification certificates uploaded.</p>}
                </div>
                <Separator />
                <div>
                    <h4 className="flex items-center text-md font-medium mb-2"><Paperclip className="mr-2 h-5 w-5"/>Other Documents</h4>
                    {inspector.otherDocuments.length > 0 ? (
                         <div className="space-y-2">
                            {inspector.otherDocuments.map((doc, index) => {
                                const status = getDocumentStatus(doc.expirationDate);
                                return (
                                <div key={index} className="flex flex-col gap-2 p-2 rounded-md border bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="h-4 w-4 flex-shrink-0" />
                                            <span className="text-sm font-medium truncate" title={doc.name}>{formatDocumentName(doc.name)}</span>
                                        </div>
                                        <Button variant="ghost" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button>
                                    </div>
                                    <div className="flex items-center justify-between pl-6">
                                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                           {doc.expirationDate && <>
                                            <CalendarDays className="h-3 w-3" />
                                            <span>Expires: {format(new Date(doc.expirationDate), 'PPP')}</span>
                                           </>}
                                        </div>
                                        <Badge variant={status.variant} className="text-xs">{status.text}</Badge>
                                    </div>
                                </div>
                            )})}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">No other documents uploaded.</p>}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
