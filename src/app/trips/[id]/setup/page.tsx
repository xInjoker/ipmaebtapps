
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Car, Utensils, VenetianMask, User, Map, Calendar, Briefcase, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { type TripRequest, type Allowance } from '@/lib/trips';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const allowanceRates = {
    breakfast: 75000,
    lunch: 100000,
    dinner: 100000,
    daily: 150000,
    localTransport: 100000,
    jabodetabekAirport: 350000,
    jabodetabekStation: 250000,
    otherAirportStation: 150000,
    mileage: 3500,
};

function AllowanceItem({
  id,
  label,
  rate,
  unit,
  checked,
  onCheckedChange,
  quantity,
  onQuantityChange,
}: {
  id: string;
  label: string;
  rate: number;
  unit: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
}) {
  const total = checked ? rate * quantity : 0;
  return (
    <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
        <div className="flex items-center space-x-3">
            <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
            <div className="grid gap-1.5">
                <Label htmlFor={id} className="cursor-pointer">
                    {label}
                </Label>
                <p className="text-xs text-muted-foreground">
                    Rate: {formatCurrency(rate)} / {unit}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             <Input
                type="number"
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
                className="w-20 text-right"
                disabled={!checked}
            />
            <span className="w-32 text-right font-medium">{formatCurrency(total)}</span>
        </div>
    </div>
  );
}

export default function TripAllowanceSetupPage() {
  const router = useRouter();
  const params = useParams();
  const { getTripById, updateTrip } = useTrips();
  const { toast } = useToast();

  const tripId = params.id as string;
  const trip = getTripById(tripId);
  
  const [allowance, setAllowance] = useState<Allowance>({
    meals: { breakfast: { enabled: false, qty: 0 }, lunch: { enabled: false, qty: 0 }, dinner: { enabled: false, qty: 0 } },
    daily: { enabled: false, qty: 0 },
    transport: {
      localTransport: { enabled: false, qty: 0 },
      jabodetabekAirport: { enabled: false, qty: 0 },
      jabodetabekStation: { enabled: false, qty: 0 },
      otherAirportStation: { enabled: false, qty: 0 },
      mileage: { enabled: false, qty: 0 },
    },
  });

  useEffect(() => {
    if (!trip) {
      toast({ variant: 'destructive', title: 'Trip not found' });
      router.push('/trips');
    } else if (trip.allowance) {
      setAllowance(trip.allowance);
    }
  }, [trip, router, toast]);
  
  const { summaryItems, totalAllowance } = useMemo(() => {
    const items = [];
    let total = 0;
    
    if (allowance.meals.breakfast.enabled && allowance.meals.breakfast.qty > 0) {
        const value = allowanceRates.breakfast * allowance.meals.breakfast.qty;
        items.push({ name: 'Breakfast', qty: allowance.meals.breakfast.qty, rate: allowanceRates.breakfast, unit: 'meal', total: value });
        total += value;
    }
    if (allowance.meals.lunch.enabled && allowance.meals.lunch.qty > 0) {
        const value = allowanceRates.lunch * allowance.meals.lunch.qty;
        items.push({ name: 'Lunch', qty: allowance.meals.lunch.qty, rate: allowanceRates.lunch, unit: 'meal', total: value });
        total += value;
    }
    if (allowance.meals.dinner.enabled && allowance.meals.dinner.qty > 0) {
        const value = allowanceRates.dinner * allowance.meals.dinner.qty;
        items.push({ name: 'Dinner', qty: allowance.meals.dinner.qty, rate: allowanceRates.dinner, unit: 'meal', total: value });
        total += value;
    }
    if (allowance.daily.enabled && allowance.daily.qty > 0) {
        const value = allowanceRates.daily * allowance.daily.qty;
        items.push({ name: 'Daily Allowance', qty: allowance.daily.qty, rate: allowanceRates.daily, unit: 'day', total: value });
        total += value;
    }
    if (allowance.transport.localTransport.enabled && allowance.transport.localTransport.qty > 0) {
        const value = allowanceRates.localTransport * allowance.transport.localTransport.qty;
        items.push({ name: 'Local Transport', qty: allowance.transport.localTransport.qty, rate: allowanceRates.localTransport, unit: 'day', total: value });
        total += value;
    }
    if (allowance.transport.jabodetabekAirport.enabled && allowance.transport.jabodetabekAirport.qty > 0) {
        const value = allowanceRates.jabodetabekAirport * allowance.transport.jabodetabekAirport.qty;
        items.push({ name: 'JABODETABEK Airport', qty: allowance.transport.jabodetabekAirport.qty, rate: allowanceRates.jabodetabekAirport, unit: 'trip', total: value });
        total += value;
    }
    if (allowance.transport.jabodetabekStation.enabled && allowance.transport.jabodetabekStation.qty > 0) {
        const value = allowanceRates.jabodetabekStation * allowance.transport.jabodetabekStation.qty;
        items.push({ name: 'JABODETABEK Station', qty: allowance.transport.jabodetabekStation.qty, rate: allowanceRates.jabodetabekStation, unit: 'trip', total: value });
        total += value;
    }
    if (allowance.transport.otherAirportStation.enabled && allowance.transport.otherAirportStation.qty > 0) {
        const value = allowanceRates.otherAirportStation * allowance.transport.otherAirportStation.qty;
        items.push({ name: 'Other Station/Airport', qty: allowance.transport.otherAirportStation.qty, rate: allowanceRates.otherAirportStation, unit: 'trip', total: value });
        total += value;
    }
    if (allowance.transport.mileage.enabled && allowance.transport.mileage.qty > 0) {
        const value = allowanceRates.mileage * allowance.transport.mileage.qty;
        items.push({ name: 'Mileage', qty: allowance.transport.mileage.qty, rate: allowanceRates.mileage, unit: 'km', total: value });
        total += value;
    }

    return { summaryItems: items, totalAllowance: total };
  }, [allowance]);
  
  const handleSave = () => {
    if (!trip) return;

    const updatedTrip = {
        ...trip,
        allowance: allowance,
        estimatedBudget: totalAllowance
    };

    updateTrip(trip.id, updatedTrip);

    toast({ title: 'Allowance Saved', description: 'The allowance details for this trip have been updated.' });
    router.push('/trips');
  };

  if (!trip) {
    return <div>Loading trip details...</div>;
  }

  const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;

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
              <CardTitle>Trip Allowance Setup</CardTitle>
              <CardDescription>Set up allowances for: {trip.employeeName} to {trip.destination}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5"/> Meals & Daily Allowance</CardTitle>
                    <CardDescription>Select applicable allowances for meals and daily needs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <AllowanceItem id="breakfast" label="Breakfast" rate={allowanceRates.breakfast} unit="meal" checked={allowance.meals.breakfast.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, meals: {...a.meals, breakfast: {...a.meals.breakfast, enabled: c}} }))} quantity={allowance.meals.breakfast.qty} onQuantityChange={(q) => setAllowance(a => ({...a, meals: {...a.meals, breakfast: {...a.meals.breakfast, qty: q}} }))} />
                    <AllowanceItem id="lunch" label="Lunch" rate={allowanceRates.lunch} unit="meal" checked={allowance.meals.lunch.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, meals: {...a.meals, lunch: {...a.meals.lunch, enabled: c}} }))} quantity={allowance.meals.lunch.qty} onQuantityChange={(q) => setAllowance(a => ({...a, meals: {...a.meals, lunch: {...a.meals.lunch, qty: q}} }))} />
                    <AllowanceItem id="dinner" label="Dinner" rate={allowanceRates.dinner} unit="meal" checked={allowance.meals.dinner.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, meals: {...a.meals, dinner: {...a.meals.dinner, enabled: c}} }))} quantity={allowance.meals.dinner.qty} onQuantityChange={(q) => setAllowance(a => ({...a, meals: {...a.meals, dinner: {...a.meals.dinner, qty: q}} }))} />
                    <AllowanceItem id="daily" label="Daily Allowance" rate={allowanceRates.daily} unit="day" checked={allowance.daily.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, daily: {...a.daily, enabled: c}} ))} quantity={allowance.daily.qty} onQuantityChange={(q) => setAllowance(a => ({...a, daily: {...a.daily, qty: q}} ))} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5"/> Transport Allowance</CardTitle>
                    <CardDescription>Select applicable transport allowances.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <AllowanceItem id="localTransport" label="Local Transport" rate={allowanceRates.localTransport} unit="day" checked={allowance.transport.localTransport.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, transport: {...a.transport, localTransport: {...a.transport.localTransport, enabled: c}} }))} quantity={allowance.transport.localTransport.qty} onQuantityChange={(q) => setAllowance(a => ({...a, transport: {...a.transport, localTransport: {...a.transport.localTransport, qty: q}} }))} />
                    <AllowanceItem id="jabodetabekAirport" label="JABODETABEK Airport" rate={allowanceRates.jabodetabekAirport} unit="trip" checked={allowance.transport.jabodetabekAirport.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, transport: {...a.transport, jabodetabekAirport: {...a.transport.jabodetabekAirport, enabled: c}} }))} quantity={allowance.transport.jabodetabekAirport.qty} onQuantityChange={(q) => setAllowance(a => ({...a, transport: {...a.transport, jabodetabekAirport: {...a.transport.jabodetabekAirport, qty: q}} }))} />
                    <AllowanceItem id="jabodetabekStation" label="JABODETABEK Station" rate={allowanceRates.jabodetabekStation} unit="trip" checked={allowance.transport.jabodetabekStation.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, transport: {...a.transport, jabodetabekStation: {...a.transport.jabodetabekStation, enabled: c}} }))} quantity={allowance.transport.jabodetabekStation.qty} onQuantityChange={(q) => setAllowance(a => ({...a, transport: {...a.transport, jabodetabekStation: {...a.transport.jabodetabekStation, qty: q}} }))} />
                    <AllowanceItem id="otherAirportStation" label="Other Station/Airport" rate={allowanceRates.otherAirportStation} unit="trip" checked={allowance.transport.otherAirportStation.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, transport: {...a.transport, otherAirportStation: {...a.transport.otherAirportStation, enabled: c}} }))} quantity={allowance.transport.otherAirportStation.qty} onQuantityChange={(q) => setAllowance(a => ({...a, transport: {...a.transport, otherAirportStation: {...a.transport.otherAirportStation, qty: q}} }))} />
                    <AllowanceItem id="mileage" label="Mileage" rate={allowanceRates.mileage} unit="km" checked={allowance.transport.mileage.enabled} onCheckedChange={(c) => setAllowance(a => ({...a, transport: {...a.transport, mileage: {...a.transport.mileage, enabled: c}} }))} quantity={allowance.transport.mileage.qty} onQuantityChange={(q) => setAllowance(a => ({...a, transport: {...a.transport, mileage: {...a.transport.mileage, qty: q}} }))} />
                </CardContent>
            </Card>

            <Separator />
            
            <div className="flex justify-end items-center gap-4">
                <span className="text-lg font-semibold">Total Estimated Allowance:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(totalAllowance)}</span>
            </div>

        </CardContent>
        <CardFooter className="flex justify-end">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>View Summary</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Trip Request Summary</DialogTitle>
                        <DialogDescription>Review the details of the business trip and allowance before submitting.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Trip Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Employee</p><p>{trip.employeeName}</p></div></div>
                                <div className="flex items-center gap-2"><Map className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Destination</p><p>{trip.destination}</p></div></div>
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Dates</p><p>{format(new Date(trip.startDate), 'PPP')} - {format(new Date(trip.endDate), 'PPP')}</p></div></div>
                                <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-muted-foreground">Duration</p><p>{tripDuration} Day(s)</p></div></div>
                                <div className="col-span-2 flex items-start gap-2"><Info className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="font-medium text-muted-foreground">Purpose</p><p>{trip.purpose}</p></div></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Allowance Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead className="text-center">Qty</TableHead>
                                            <TableHead className="text-right">Rate</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {summaryItems.length > 0 ? (
                                            summaryItems.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.name}</TableCell>
                                                    <TableCell className="text-center">{item.qty} {item.unit}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No allowances selected.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                <Separator className="my-4"/>
                                <div className="flex justify-end items-center gap-4 text-lg font-bold">
                                    <span>Total Allowance:</span>
                                    <span className="text-primary">{formatCurrency(totalAllowance)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>Close</Button>
                        <Button onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Save & Submit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
}
