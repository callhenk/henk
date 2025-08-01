'use client';

import { useState } from 'react';

import { Clock } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';

interface TimePickerProps {
  value?: string;
  onValueChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onValueChange,
  placeholder = 'Select time',
  disabled = false,
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(value || '');

  const formatTime = (time: string | undefined) => {
    if (!time) return '';
    // Convert 24-hour format to 12-hour format for display
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (newTime: string) => {
    setTempTime(newTime);
  };

  const handleConfirm = () => {
    onValueChange?.(tempTime);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempTime(value || '');
    setIsOpen(false);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTime(timeString) || timeString;
        options.push({ value: timeString, display: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
          <Clock className="mr-2 h-4 w-4" />
          {value ? formatTime(value) || value : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="mb-3">
            <Input
              type="time"
              value={tempTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
              placeholder="HH:MM"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={tempTime === option.value ? 'default' : 'ghost'}
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => handleTimeChange(option.value)}
                >
                  {option.display}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleConfirm} className="flex-1">
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
