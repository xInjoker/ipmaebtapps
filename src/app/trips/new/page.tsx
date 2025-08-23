
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTrips } from '@/context/TripContext';
import { type TripRequest, destinationCompanies } from '@/lib/trips';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Save, Loader2, Send, ChevronsUpDown, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useProjects } from '@/context/ProjectContext';
import { useEmployees } from '@/context/EmployeeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';

export default function NewTripPage() {
  const router = useRouter();
  const { user, isHqUser, branches } = useAuth();
  const { addTrip } = useTrips();
  const { projects } = useProjects();
  const { employees } = useEmployees();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    position: '',
    division: '',
    project: '',
    destination: '',
    destinationCompany: '',
    purpose: '',
  });

  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [isCompanyPopoverOpen, setIsCompanyPopoverOpen] = useState(false);

  useEffect(() => {
    if (user) {
        const employeeRecord = employees.find(e => e.email === user.email);
        const userBranch = branches.find(b => b.id === user.branchId);
        
        setFormData(prev => ({
            ...prev,
            position: employeeRecord?.position || '',
            division: userBranch?.name || '',
        }));
    }
  }, [user, employees, branches]);


  const visibleProjects = useMemo(() => {
    if (!user) return [];
    if (isHqUser) return projects;
    return projects.filter(p => p.branchId === user.branchId);
  }, [projects, user, isHqUser]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value }));
  }, []);

  const handleSelectChange = useCallback((field: 'project', value: string) => {
    setFormData(prev => ({...prev, [field]: value }));
  }, []);
  
  const handleCreateRequest = useCallback(() => {
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
        employeeId: user.uid,
        employeeName: user.name,
        position: formData.position,
        division: formData.division,
        project: formData.project,
        destination: formData.destination,
        destinationCompany: formData.destinationCompany,
        purpose: formData.purpose,
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
        estimatedBudget: 0, 
        status: 'Draft',
        approvalHistory: [
            { actorId: user.uid, actorName: user.name, status: 'Draft', timestamp: new Date().toISOString(), comments: "Trip request created." }
        ]
    };
    
    addTrip(newTrip);

    toast({ title: 'Trip Request Created', description: 'Redirecting to document setup...' });
    
    router.push(`/trips/${newTrip.id}/setup`);
  }, [user, formData, date, addTrip, toast, router]);

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
                <Select value={formData.project} onValueChange={(value) => handleSelectChange('project', value)}>
                    <SelectTrigger id="project">
                        <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                        {visibleProjects.map((project) => (
                            <SelectItem key={project.id} value={project.name}>
                                {project.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={formData.destination} onChange={handleInputChange} placeholder="e.g., Surabaya" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="destinationCompany">Destination Company</Label>
                <Popover open={isCompanyPopoverOpen} onOpenChange={setIsCompanyPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isCompanyPopoverOpen}
                            className="w-full justify-between font-normal"
                        >
                            {formData.destinationCompany || "Select or type company..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput
                                placeholder="Search or type company..."
                                value={formData.destinationCompany}
                                onValueChange={(value) => setFormData(prev => ({...prev, destinationCompany: value}))}
                            />
                            <CommandList>
                                <CommandEmpty>No company found.</CommandEmpty>
                                <CommandGroup>
                                    {destinationCompanies.map((company) => (
                                        <CommandItem
                                            key={company.value}
                                            value={company.value}
                                            onSelect={(currentValue) => {
                                                setFormData(prev => ({ ...prev, destinationCompany: currentValue === formData.destinationCompany ? "" : currentValue }));
                                                setIsCompanyPopoverOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    formData.destinationCompany === company.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {company.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="dates">Trip Dates</Label>
                <DateRangePicker value={date} onChange={setDate} />
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
