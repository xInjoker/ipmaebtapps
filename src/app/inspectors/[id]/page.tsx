
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInspectors } from '@/context/InspectorContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Mail, Phone, FileText, Download, Award, Paperclip, CalendarDays, MapPin, Briefcase, Star, Eye } from 'lucide-react';
import { type Inspector, type InspectorDocument } from '@/lib/inspectors';
import { getInitials, getAvatarColor, getDocumentStatus, getFileNameFromDataUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { DocumentViewerDialog } from '@/components/document-viewer-dialog';

function formatDocumentName(name?: string) {
    if (!name) return 'Untitled Document';
    return name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
}

type DocumentToView = {
    url: string;
    name: string;
}

export default function InspectorDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const inspectorId = params.id as string;
  const { getInspectorById } = useInspectors();
  const { branches, userHasPermission } = useAuth();
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [documentToView, setDocumentToView] = useState<DocumentToView | null>(null);

  useEffect(() => {
    if (inspectorId) {
      const item = getInspectorById(inspectorId);
      setInspector(item || null);
    }
  }, [inspectorId, getInspectorById]);

  const branchMap = useMemo(() => {
    return branches.reduce((acc, branch) => {
        acc[branch.id] = branch.name;
        return acc;
    }, {} as Record<string, string>);
  }, [branches]);
  
  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
    <>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
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
                  <AvatarFallback style={{ backgroundColor: avatarColor.background, color: avatarColor.color }} className="text-2xl">
                    {getInitials(inspector.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1.5">
                  <CardTitle>{inspector.name}</CardTitle>
                  <CardDescription><Badge>{inspector.position}</Badge></CardDescription>
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
        </CardHeader>
      </Card>

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
                        <Briefcase className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Employment Status</p>
                        <p className="font-medium">{inspector.employmentStatus || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${iconColors[colorIndex % iconColors.length]}1A` }}>
                        <Star className="h-5 w-5" style={{ color: iconColors[colorIndex++ % iconColors.length] }} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Years of Experience</p>
                        <p className="font-medium">{inspector.yearsOfExperience ? `${inspector.yearsOfExperience} years` : 'N/A'}</p>
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
                                <span className="text-sm truncate" title={inspector.cvUrl}>{getFileNameFromDataUrl(inspector.cvUrl) || 'Curriculum Vitae'}</span>
                            </div>
                            <div>
                                <Button variant="ghost" size="sm" onClick={() => setDocumentToView({ url: inspector.cvUrl, name: getFileNameFromDataUrl(inspector.cvUrl) || 'CV' })}><Eye className="mr-2 h-4 w-4" />View</Button>
                                <Button variant="ghost" size="icon" onClick={() => downloadFile(inspector.cvUrl, getFileNameFromDataUrl(inspector.cvUrl) || 'cv.pdf')}><Download className="h-4 w-4" /></Button>
                            </div>
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
                                         <div>
                                            <Button variant="ghost" size="sm" onClick={() => setDocumentToView(doc)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                            <Button variant="ghost" size="icon" onClick={() => downloadFile(doc.url, doc.name)}><Download className="h-4 w-4" /></Button>
                                        </div>
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
                                         <div>
                                            <Button variant="ghost" size="sm" onClick={() => setDocumentToView(doc)}><Eye className="mr-2 h-4 w-4" />View</Button>
                                            <Button variant="ghost" size="icon" onClick={() => downloadFile(doc.url, doc.name)}><Download className="h-4 w-4" /></Button>
                                        </div>
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
    {documentToView && (
        <DocumentViewerDialog
            isOpen={!!documentToView}
            onOpenChange={(isOpen) => !isOpen && setDocumentToView(null)}
            documentUrl={documentToView.url}
            documentName={documentToView.name}
        />
    )}
    </>
  );
}
