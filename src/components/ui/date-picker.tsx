"use client";

import * as React from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", disabled }: DatePickerProps) {
  const selectedDate = value ? parseISO(value) : undefined;
  const validDate = selectedDate && isValid(selectedDate) ? selectedDate : undefined;
  const currentYear = new Date().getFullYear();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-11 w-full justify-between rounded-xl border-input bg-background px-4 font-normal",
            !validDate && "text-muted-foreground"
          )}
        >
          {validDate ? format(validDate, "PPP") : placeholder}
          <CalendarDays className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
          disabled={{ after: new Date() }}
          defaultMonth={validDate}
          captionLayout="dropdown"
          startMonth={new Date(1940, 0)}
          endMonth={new Date(currentYear, 11)}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}