
'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from './ui/date-picker';
import { contractTypes } from '@/lib/employees';
import { FormField, FormItem, FormControl, FormLabel } from './ui/form';


export function EmployeeFormStep4({ form }: { form: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="contractType"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Contract Type</FormLabel>
                         <FormControl>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <SelectTrigger><SelectValue placeholder="Select a type..."/></SelectTrigger>
                                <SelectContent>
                                    {contractTypes.map(ct => <SelectItem key={ct} value={ct}>{ct}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="contractNumber"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Contract Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="contractStartDate"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Contract Start Date</FormLabel>
                        <FormControl>
                            <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="contractEndDate"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Contract End Date</FormLabel>
                         <FormControl>
                             <DatePicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
