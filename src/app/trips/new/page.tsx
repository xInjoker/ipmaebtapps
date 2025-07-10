
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
import { ArrowLeft, Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

export default function NewTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addTrip } = useTrips();
  const { toast } = useToast();

  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [estimatedBudget, setEstimatedBudget] = useState<number>(0);
  
  const handleSave = () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a trip request.' });
        return;
    }
    if (!destination || !purpose || !date?.from || !date?.to || estimatedBudget <= 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out all fields, including dates and a valid budget.',
      });
      return;
    }

    const newTrip: TripRequest = {
        id: `TRIP-${Date.now()}`,
        employeeId: user.id,
        employeeName: user.name,
        destination,
        purpose,
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
        estimatedBudget,
        status: 'Pending',
        approvalHistory: [
            { actorId: user.id, actorName: user.name, status: 'Pending', timestamp: new Date().toISOString() }
        ]
    };
    
    addTrip(newTrip);
    toast({ title: 'Trip Request Submitted', description: 'Your request has been sent for approval.' });
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
                <Input id="employeeName" value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Surabaya" />
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="purpose">Purpose of Trip</Label>
                <Textarea id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g., Client meeting, site inspection" />
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
            <div className="space-y-2">
                <Label htmlFor="estimatedBudget">Estimated Budget (IDR)</Label>
                <Input id="estimatedBudget" type="number" value={estimatedBudget || ''} onChange={e => setEstimatedBudget(parseInt(e.target.value) || 0)} placeholder="e.g., 5000000" />
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/trips">Cancel</Link>
            </Button>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Submit Request
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
