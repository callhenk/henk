'use client';

import { CalendarIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Calendar } from '@kit/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';

interface DatePickerProps {
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  minDate,
}: DatePickerProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onValueChange}
          disabled={(date) => {
            if (!minDate) return false;
            // Compare dates only (ignore time) to avoid timezone issues
            const dateOnly = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
            );
            const minDateOnly = new Date(
              minDate.getFullYear(),
              minDate.getMonth(),
              minDate.getDate(),
            );
            return dateOnly < minDateOnly;
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
