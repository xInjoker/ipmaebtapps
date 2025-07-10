
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Users, FileSignature, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export default function TripDocumentSetupPage() {
  const router = useRouter();
  const params = useParams();
  const { users } = useAuth();
  const { getTripById, updateTrip } = useTrips();
  const { toast } = useToast();

  const tripId = params.id as string;
  const trip = getTripById(tripId);
  
  const [logoSrc, setLogoSrc] = useState<string | null>('https://placehold.co/200x80.png');
  const [managerId, setManagerId] = useState('');
  const [financeId, setFinanceId] = useState('');
  
  useEffect(() => {
    if (!trip) {
      toast({ variant: 'destructive', title: 'Trip not found' });
      router.push('/trips');
    }
  }, [trip, router, toast]);

  const approvers = useMemo(() => {
    return users.filter(u => u.roleId === 'project-manager' || u.roleId === 'super-admin');
  }, [users]);
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmitAndGenerate = () => {
    if (!trip) return;
    if (!managerId || !financeId) {
        toast({ variant: 'destructive', title: 'Approvers required', description: 'Please select a manager and a finance contact.' });
        return;
    }

    const updatedTrip = {
        ...trip,
        status: 'Pending' as const,
        approvers: { managerId, financeId },
    };

    updateTrip(trip.id, updatedTrip);

    // --- PDF Generation ---
    const doc = new jsPDF();
    if (logoSrc && logoSrc.startsWith('data:image')) {
        try {
            doc.addImage(logoSrc, 'PNG', 15, 10, 40, 15);
        } catch (e) {
            console.error("Error adding image to PDF:", e);
            toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not add the logo to the PDF.' });
        }
    }
    doc.setFontSize(18);
    doc.text('Business Trip Request', 105, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Request ID: ${trip.id}`, 105, 28, { align: 'center' });
    
    (doc as any).autoTable({
        startY: 40,
        head: [['Field', 'Details']],
        body: [
            ['Employee Name', trip.employeeName],
            ['Position', trip.position],
            ['Division/Function', trip.division],
            ['Project', trip.project],
            ['Destination', trip.destination],
            ['Start Date', format(new Date(trip.startDate), 'PPP')],
            ['End Date', format(new Date(trip.endDate), 'PPP')],
            ['Purpose', trip.purpose],
        ],
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] },
    });
    
    const manager = users.find(u => u.id.toString() === managerId);
    const finance = users.find(u => u.id.toString() === financeId);

    (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Approval Chain']],
        body: [
            [`Manager: ${manager?.name}`],
            [`Finance: ${finance?.name}`],
        ],
    });

    const pdfDataUri = doc.output('datauristring');
    const pdfWindow = window.open();
    if (pdfWindow) {
        pdfWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`);
        pdfWindow.document.title = `trip-request-${trip.id}.pdf`;
    }

    toast({ title: 'Trip Submitted', description: 'Your request has been finalized and sent for approval.' });
    router.push('/trips');
  };

  if (!trip) {
    return <div>Loading trip details...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/trips">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Trips</span>
              </Link>
            </Button>
            <div className="space-y-1.5">
              <CardTitle>Trip Document Setup</CardTitle>
              <CardDescription>Customize and finalize the trip request for: {trip.employeeName} to {trip.destination}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-4 rounded-md border p-4">
                <h3 className="font-semibold flex items-center gap-2"><FileSignature className="h-5 w-5"/> Document Customization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Company Logo</Label>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-16 border rounded-md p-1 flex items-center justify-center bg-muted">
                                {logoSrc ? (
                                    <Image src={logoSrc} alt="Company Logo" width={100} height={40} className="object-contain" data-ai-hint="logo" />
                                ) : (
                                    <p className="text-xs text-muted-foreground">No Logo</p>
                                )}
                            </div>
                            <label htmlFor="logo-upload" className="cursor-pointer">
                                <Button variant="outline" as="span">
                                    <Upload className="mr-2 h-4 w-4" /> Upload Logo
                                </Button>
                                <Input id="logo-upload" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleLogoUpload} />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">Recommended size: 200x80px. PNG or JPG format.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
                 <h3 className="font-semibold flex items-center gap-2"><Users className="h-5 w-5"/> Approval Process</h3>
                 <p className="text-sm text-muted-foreground">Select the personnel responsible for approving this trip request.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="managerApproval">Manager / Superior</Label>
                        <Select value={managerId} onValueChange={setManagerId}>
                            <SelectTrigger id="managerApproval"><SelectValue placeholder="Select a manager..."/></SelectTrigger>
                            <SelectContent>
                                {approvers.map(approver => (
                                    <SelectItem key={approver.id} value={approver.id.toString()}>{approver.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="financeApproval">Finance Department</Label>
                        <Select value={financeId} onValueChange={setFinanceId}>
                            <SelectTrigger id="financeApproval"><SelectValue placeholder="Select finance contact..."/></SelectTrigger>
                            <SelectContent>
                               {approvers.map(approver => (
                                    <SelectItem key={approver.id} value={approver.id.toString()}>{approver.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleSubmitAndGenerate}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Finalize and Submit for Approval
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
