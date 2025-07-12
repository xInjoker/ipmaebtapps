
'use client';

import { useEffect, useState, use } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { type Tender } from '@/lib/tenders';
import { formatCurrency, getTenderStatusVariant } from '@/lib/utils';

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: React.ReactNode }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <div className="font-medium">{value}</div>
            </div>
        </div>
    );
}

export default function TenderDetailsPage() {
  const router = useRouter();
  const params = use(useParams());
  const { getTenderById } = useTenders();
  const { branches } = useAuth();
  const [tender, setTender] = useState<Tender | null>(null);

  useEffect(() => {
    const tenderId = params.id as string;
    if (tenderId) {
      const item = getTenderById(tenderId);
      setTender(item || null);
    }
  }, [params.id, getTenderById]);

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

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/tenders">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Tenders</span>
                    </Link>
                </Button>
                <div className="space-y-1.5">
                    <CardTitle>{tender.title}</CardTitle>
                    <CardDescription>
                        {tender.tenderNumber} &bull; <Badge variant={getTenderStatusVariant(tender.status)}>{tender.status}</Badge>
                    </CardDescription>
                </div>
                </div>
                <Button asChild>
                    <Link href={`/tenders/${tender.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Tender
                    </Link>
                </Button>
            </div>
            </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Tender Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <DetailItem icon={Building} label="Client" value={tender.client} />
                    <DetailItem icon={User} label="Principal" value={tender.principal} />
                    <DetailItem icon={Briefcase} label="Services" value={tender.services} />
                    <DetailItem icon={FileText} label="Description" value={tender.description} />
                    <DetailItem icon={GanttChart} label="Sub-Portfolio" value={tender.subPortfolio} />
                    <DetailItem icon={Globe} label="Regional" value={tender.regional} />
                    <DetailItem icon={Building} label="Branch" value={tender.branchId ? branchMap[tender.branchId] : 'N/A'} />
                    <DetailItem icon={UserCheck} label="Person In Charge" value={tender.personInCharge} />
                    <DetailItem icon={Calendar} label="Submission Date" value={format(new Date(tender.submissionDate), 'PPP')} />
                    <DetailItem icon={CircleDollarSign} label="Value" value={formatCurrency(tender.value)} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
