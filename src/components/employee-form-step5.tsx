
'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from './ui/currency-input';
import { FormField, FormItem, FormControl, FormLabel } from './ui/form';

export function EmployeeFormStep5({ form }: { form: any }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Salary</FormLabel>
                         <FormControl>
                            <CurrencyInput
                                value={field.value || 0}
                                onValueChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>Bank Account Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="npwp"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>NPWP Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="ptkpStatus"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                        <FormLabel>PTKP Status</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
}
