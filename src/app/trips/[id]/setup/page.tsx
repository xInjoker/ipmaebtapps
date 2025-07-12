
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTrips } from '@/context/TripContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Car, Utensils, VenetianMask, User, Map, Calendar, Briefcase, Info, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { type Allowance, allowanceRates } from '@/lib/trips';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
                <p className="text-sm text-muted-foreground">
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
  const tripId = params.id as string;
  const { getTripById, updateTrip } = useTrips();
  const { toast } = useToast();

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
  
  const mealsSubtotal = useMemo(() => {
    return (
        (allowance.meals.breakfast.enabled ? allowance.meals.breakfast.qty * allowanceRates.breakfast : 0) +
        (allowance.meals.lunch.enabled ? allowance.meals.lunch.qty * allowanceRates.lunch : 0) +
        (allowance.meals.dinner.enabled ? allowance.meals.dinner.qty * allowanceRates.dinner : 0) +
        (allowance.daily.enabled ? allowance.daily.qty * allowanceRates.daily : 0)
    );
  }, [allowance.meals, allowance.daily]);

  const transportSubtotal = useMemo(() => {
    return (
        (allowance.transport.localTransport.enabled ? allowance.transport.localTransport.qty * allowanceRates.localTransport : 0) +
        (allowance.transport.jabodetabekAirport.enabled ? allowance.transport.jabodetabekAirport.qty * allowanceRates.jabodetabekAirport : 0) +
        (allowance.transport.jabodetabekStation.enabled ? allowance.transport.jabodetabekStation.qty * allowanceRates.jabodetabekStation : 0) +
        (allowance.transport.otherAirportStation.enabled ? allowance.transport.otherAirportStation.qty * allowanceRates.otherAirportStation : 0) +
        (allowance.transport.mileage.enabled ? allowance.transport.mileage.qty * allowanceRates.mileage : 0)
    );
  }, [allowance.transport]);
  
  const grandTotal = useMemo(() => mealsSubtotal + transportSubtotal, [mealsSubtotal, transportSubtotal]);
  
  const handleSaveAndProceed = () => {
    if (!trip) return;

    const updatedTrip = {
        ...trip,
        allowance: allowance,
        estimatedBudget: grandTotal
    };

    updateTrip(trip.id, updatedTrip);

    toast({ title: 'Allowance Saved', description: 'Proceeding to summary page.' });
    router.push(`/trips/${trip.id}/summary`);
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
                <CardFooter className="flex justify-end font-semibold">
                    <span>Subtotal: {formatCurrency(mealsSubtotal)}</span>
                </CardFooter>
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
                <CardFooter className="flex justify-end font-semibold">
                    <span>Subtotal: {formatCurrency(transportSubtotal)}</span>
                </CardFooter>
            </Card>

            <Separator />
            
            <div className="flex justify-end items-center gap-4">
                <span className="text-lg font-semibold">Grand Total:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
            </div>

        </CardContent>
        <CardFooter className="flex justify-end">
             <Button onClick={handleSaveAndProceed}>
                Proceed to Summary <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
