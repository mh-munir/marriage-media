"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function toBengaliDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  const isBengali = props.locale?.code === "bn";

  return (
    <DayPicker
      className={cn("p-0", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        month_caption: "flex items-center justify-between px-1",
        caption_label: "sr-only",
        dropdowns: "flex items-center gap-2",
        dropdown_root: "relative",
        dropdown: "h-9 appearance-none rounded-lg border border-border bg-background px-3 pr-7 text-sm font-medium shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
        nav: "flex items-center gap-1",
        button_previous: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm hover:bg-accent",
        button_next: "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm hover:bg-accent",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 rounded-md text-center text-[0.8rem] font-normal text-muted-foreground",
        week: "mt-2 flex w-full",
        day: "relative h-9 w-9 p-0 text-center text-sm",
        day_button: "inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent",
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "font-bold text-primary",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
      formatters={{
        ...props.formatters,
        ...(isBengali
          ? {
              formatDay: (date: Date) => toBengaliDigits(String(date.getDate())),
              formatYearDropdown: (date: Date) => toBengaliDigits(String(date.getFullYear())),
            }
          : {}),
      }}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };