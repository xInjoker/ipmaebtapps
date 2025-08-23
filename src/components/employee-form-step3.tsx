
'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employmentStatuses } from '@/lib/employees';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from './ui/form';

export function EmployeeFormStep3({ form }: { form: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Employment Status</FormLabel>
                        <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a status..." /></SelectTrigger>
                                <SelectContent>
                                    {employmentStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="bpjsHealth"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>BPJS Health Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="bpjsEmployment"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>BPJS Employment Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
