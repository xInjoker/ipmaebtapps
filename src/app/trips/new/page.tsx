
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { type TripRequest } from '@/lib/trips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addTrip } = useTrips();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    position: '',
    division: '',
    project: '',
    destination: '',
    purpose: '',
  });

  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value }));
  }
  
  const handleCreateRequest = () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a trip request.' });
        return;
    }
    if (!formData.destination || !formData.purpose || !date?.from || !date?.to || !formData.position || !formData.division || !formData.project) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all required fields before proceeding.',
      });
      return;
    }
    
    const newTrip: TripRequest = {
        id: `TRIP-${Date.now()}`,
        employeeId: user.id,
        employeeName: user.name,
        position: formData.position,
        division: formData.division,
        project: formData.project,
        destination: formData.destination,
        purpose: formData.purpose,
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
        estimatedBudget: 0, 
        status: 'Draft',
        approvalHistory: [
            { actorId: user.id, actorName: user.name, status: 'Draft', timestamp: new Date().toISOString(), comments: "Trip request created." }
        ]
    };
    
    addTrip(newTrip);

    toast({ title: 'Trip Request Created', description: 'Redirecting to document setup...' });
    
    router.push(`/trips/${newTrip.id}/setup`);
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
                <Input id="employeeName" value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" value={formData.position} onChange={handleInputChange} placeholder="e.g., Project Manager" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="division">Division/Function</Label>
                <Input id="division" value={formData.division} onChange={handleInputChange} placeholder="e.g., Cabang Jakarta" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input id="project" value={formData.project} onChange={handleInputChange} placeholder="e.g., Corporate Website Revamp" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={formData.destination} onChange={handleInputChange} placeholder="e.g., Surabaya" />
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
                <Textarea id="purpose" value={formData.purpose} onChange={handleInputChange} placeholder="e.g., Client meeting, site inspection" />
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/trips">Cancel</Link>
            </Button>
            <Button onClick={handleCreateRequest}>
                <Send className="mr-2 h-4 w-4" />
                Create Trip Request
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
