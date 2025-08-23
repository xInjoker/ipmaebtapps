
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, type CalendarProps } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;
}

interface DateRangePickerProps {
    value: DateRange | undefined;
    onChange: (date: DateRange | undefined) => void;
    placeholder?: string;
    calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;
}

export function DatePicker({ value, onChange, placeholder = 'Pick a date', calendarProps }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          captionLayout="dropdown-buttons"
          fromYear={1960}
          toYear={new Date().getFullYear() + 10}
          initialFocus
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  );
}

export function DateRangePicker({ value, onChange, placeholder = 'Pick a date range', calendarProps}: DateRangePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value?.from ? (
                        value.to ? (
                            <>
                                {format(value.from, "LLL dd, y")} -{" "}
                                {format(value.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(value.from, "LLL dd, y")
                        )
                    ) : (
                        <span>{placeholder}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={value?.from}
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 10}
                    toYear={new Date().getFullYear() + 10}
                    {...calendarProps}
                />
            </PopoverContent>
        </Popover>
    )
}
