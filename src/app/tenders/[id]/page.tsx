

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTenders } from '@/context/TenderContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Building,
  User,
  FileText,
  Calendar,
  CircleDollarSign,
  Briefcase,
  Globe,
  GanttChart,
  UserCheck,
  Edit,
  FolderTree,
  List,
  Download,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { type Tender } from '@/lib/tenders';
import { formatCurrency, getTenderStatusVariant } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function DetailItem({ icon: Icon, label, value, iconColor }: { icon: React.ElementType, label: string, value?: React.ReactNode, iconColor: string }) {
    if (!value) return null;
    const bgColor = `${iconColor}1A`; // Adds ~10% opacity
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: bgColor }}>
                <Icon className="h-5 w-5" style={{ color: iconColor }} />
            </div>
            <div>
                <div className="text-sm text-muted-foreground">{label}</div>
                <div className="font-medium">{value}</div>
            </div>
        </div>
    );
}

export default function TenderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params.id as string;
  const { getTenderById } = useTenders();
  const { branches, userHasPermission } = useAuth();
  const [tender, setTender] = useState<Tender | null>(null);

  useEffect(() => {
    if (tenderId) {
      const item = getTenderById(tenderId);
      setTender(item || null);
    }
  }, [tenderId, getTenderById]);

  const branchMap = branches.reduce((acc, branch) => {
    acc[branch.id] = branch.name;
    return acc;
  }, {} as Record<string, string>);
  
  if (!tender) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold">Tender Not Found</h1>
        <p className="text-muted-foreground">The tender you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/tenders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenders
          </Link>
        </Button>
      </div>
    );
  }
  
  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const iconColors = ['#0D5EA6', '#0ABAB5', '#00C897', '#FFA955', '#FFD63A', '#FFBE98'];
  let colorIndex = 0;


  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <svg
            className="absolute -right-16 -top-24 text-warning"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
                transform="translate(100 100)"
            />
        </svg>
        <svg
            className="absolute -left-20 -bottom-24 text-primary-foreground/10"
            fill="currentColor"
            width="400"
            height="400"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M51.9,-54.9C64.6,-45.5,71.2,-28.9,72,-12.3C72.8,4.2,67.7,20.8,58.3,34.5C48.9,48.2,35.1,59.1,20,64.2C4.9,69.3,-11.5,68.6,-26.4,62.8C-41.2,57,-54.6,46,-61.7,31.7C-68.9,17.4,-70,-0.1,-64.7,-14.8C-59.4,-29.4,-47.8,-41.3,-35,-50.7C-22.3,-60,-8.4,-67,5.5,-69.6C19.4,-72.2,39.1,-70.4,51.9,-54.9Z"
                transform="translate(100 100)"
            />
        </svg>
        <CardHeader className="flex flex-row items-start justify-between gap-4 z-10 relative">
            <div className="flex items-center gap-4">
            <Button asChild variant="secondary" size="icon">
                <Link href="/tenders">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Tenders</span>
                </Link>
            </Button>
            <div className="space-y-1.5">
                <CardTitle className="font-headline">{tender.title}</CardTitle>
                <CardDescription className="text-primary-foreground/90">
                    {tender.tenderNumber} &bull; <Badge variant={getTenderStatusVariant(tender.status)}>{tender.status}</Badge>
                </CardDescription>
            </div>
            </div>
            {userHasPermission('manage-tenders') && (
                <Button asChild variant="secondary">
                    <Link href={`/tenders/${tender.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Tender
                    </Link>
                </Button>
            )}
        </CardHeader>
      </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Tender Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                     <div>
                        <h3 className="font-semibold mb-4 text-base">Tender Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <DetailItem icon={Building} label="Client" value={tender.client} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={User} label="Principal" value={tender.principal} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                             <DetailItem icon={List} label="Service Name" value={tender.serviceName} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={Briefcase} label="Services (Legacy)" value={tender.services} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <div className="md:col-span-2">
                                <DetailItem icon={FileText} label="Description" value={tender.description} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            </div>
                        </div>
                    </div>
                    <Separator/>
                     <div>
                        <h3 className="font-semibold mb-4 text-base">Classification & Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <DetailItem icon={GanttChart} label="Portfolio" value={tender.portfolio} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={FolderTree} label="Sub-Portfolio" value={tender.subPortfolio} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={Globe} label="Regional" value={tender.regional} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={Building} label="Branch" value={tender.branchId ? branchMap[tender.branchId] : 'N/A'} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                        </div>
                    </div>
                     <Separator/>
                    <div>
                        <h3 className="font-semibold mb-4 text-base">Financial & Scheduling</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                            <DetailItem icon={UserCheck} label="Person In Charge" value={tender.personInCharge} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={Calendar} label="Submission Date" value={format(new Date(tender.submissionDate), 'PPP')} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={CircleDollarSign} label="Owner Estimate Price" value={formatCurrency(tender.ownerEstimatePrice || 0)} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                            <DetailItem icon={CircleDollarSign} label="Bid Price" value={formatCurrency(tender.bidPrice)} iconColor={iconColors[colorIndex++ % iconColors.length]} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Paperclip/> Supporting Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    {(tender.documentUrls || []).length > 0 ? (
                        <div className="space-y-2">
                            {tender.documentUrls!.map((url, index) => {
                                const fileName = `Document_${tender.tenderNumber}_${index+1}`;
                                return (
                                <div key={index} className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm truncate">Document {index + 1}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => downloadFile(url, fileName)}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            )})}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-32 rounded-md border-2 border-dashed bg-muted">
                            <div className="text-center text-muted-foreground">
                                <FileText className="mx-auto h-10 w-10" />
                                <p className="mt-2 text-sm">No documents uploaded</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

