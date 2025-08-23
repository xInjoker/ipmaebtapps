
'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from './ui/textarea';
import { DatePicker } from './ui/date-picker';
import { genders, religions } from '@/lib/employees';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from './ui/form';

export function EmployeeFormStep2({ form }: { form: any }) {
    const employeeId = form.getValues('id');
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={employeeId || 'Will be generated upon creation'} readOnly />
            </div>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>National ID (KTP)</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="placeOfBirth"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Place of Birth</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a gender..."/></SelectTrigger>
                                <SelectContent>
                                    {genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Religion</FormLabel>
                         <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a religion..."/></SelectTrigger>
                                <SelectContent>
                                    {religions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem className="md:col-span-2 space-y-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
