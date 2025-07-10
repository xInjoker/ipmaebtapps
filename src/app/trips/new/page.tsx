
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { useEmployees } from '@/context/EmployeeContext';
import { type TripRequest } from '@/lib/trips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { addTrip } = useTrips();
  const { toast } = useToast();

  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  
  const [employeeDetails, setEmployeeDetails] = useState({
    name: user?.name || '',
    position: '',
    project: '',
    division: '',
  });

  useEffect(() => {
    if (user) {
      // Note: This assumes a way to link the auth user to the employee list.
      // A more robust system would use a shared, unique ID.
      // For this implementation, we'll find the employee by name.
      const employeeData = employees.find(emp => emp.name === user.name);
      if (employeeData) {
        setEmployeeDetails({
          name: employeeData.name || user.name,
          position: employeeData.position || '',
          project: employeeData.projectName || 'N/A',
          division: employeeData.workUnitName || '',
        });
      }
    }
  }, [user, employees]);
  
  const handleGenerateDocument = () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a trip request.' });
        return;
    }
    if (!destination || !purpose || !date?.from || !date?.to) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields before generating the document.',
      });
      return;
    }

    const newTrip: TripRequest = {
        id: `TRIP-${Date.now()}`,
        employeeId: user.id,
        employeeName: employeeDetails.name,
        destination,
        purpose,
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
        estimatedBudget: 0,
        status: 'Pending',
        approvalHistory: [
            { actorId: user.id, actorName: user.name, status: 'Pending', timestamp: new Date().toISOString() }
        ]
    };
    
    addTrip(newTrip);

    // --- PDF Generation ---
    const doc = new jsPDF();

    // Add company logo (replace with your actual logo URL or data URI)
    // For this example, we use a placeholder.
    try {
        const logo = 'https://i.ibb.co/3k5g1tY/logo-iappm.png'; 
        doc.addImage(logo, 'PNG', 15, 10, 40, 15);
    } catch(e) {
        console.error("Could not add logo to PDF:", e);
    }

    doc.setFontSize(18);
    doc.text('Business Trip Request', 105, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Request ID: ${newTrip.id}`, 105, 28, { align: 'center' });
    
    (doc as any).autoTable({
        startY: 40,
        head: [['Field', 'Details']],
        body: [
            ['Employee Name', employeeDetails.name],
            ['Position', employeeDetails.position],
            ['Division/Function', employeeDetails.division],
            ['Project', employeeDetails.project],
            ['Destination', destination],
            ['Start Date', format(date.from, 'PPP')],
            ['End Date', format(date.to, 'PPP')],
            ['Purpose', purpose],
        ],
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save(`trip-request-${newTrip.id}.pdf`);

    toast({ title: 'Document Generated', description: 'Your trip request PDF has been created.' });
    router.push('/trips');
  };

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
              <CardTitle>New Business Trip Request</CardTitle>
              <CardDescription>Fill in the details for your trip request.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="employeeName">Employee</Label>
                <Input id="employeeName" value={employeeDetails.name} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" value={employeeDetails.position} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="division">Division/Function</Label>
                <Input id="division" value={employeeDetails.division} disabled />
            </div>
             <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input id="project" value={employeeDetails.project} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Surabaya" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dates">Trip Dates</Label>
                <Popover>
                  <PopoverTrigger asChild>
                      <Button
                          id="dates"
                          variant={"outline"}
                          className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                          )}
                      >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                           {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date range</span>
                           )}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={date?.from}
                          selected={date}
                          onSelect={setDate}
                          numberOfMonths={2}
                      />
                  </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="purpose">Purpose of Trip</Label>
                <Textarea id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g., Client meeting, site inspection" />
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/trips">Cancel</Link>
            </Button>
            <Button onClick={handleGenerateDocument}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Document
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
