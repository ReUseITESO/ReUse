'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('rounded-lg border border-border bg-card p-3', className)}
      classNames={{
        months: 'space-y-4',
        month: 'space-y-4',
        month_caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-semibold text-fg',
        nav: 'flex items-center gap-1',
        button_previous:
          'absolute left-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-fg cursor-pointer transition-colors hover:bg-muted',
        button_next:
          'absolute right-1 inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-card text-fg cursor-pointer transition-colors hover:bg-muted',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 rounded-md text-[0.8rem] font-normal text-muted-fg',
        weeks: 'mt-2 flex flex-col gap-1.5',
        week: 'flex w-full',
        day: 'relative h-9 w-9 p-0 text-center text-sm',
        day_button:
          'h-9 w-9 rounded-full text-sm font-medium text-fg cursor-pointer transition-colors hover:bg-primary/10 hover:text-primary aria-selected:bg-primary aria-selected:text-primary-fg aria-selected:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-transparent',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-fg [&>button]:hover:bg-primary-hover',
        today:
          '[&>button]:border [&>button]:border-info/60 [&>button]:bg-info/10 [&>button]:text-fg',
        outside: 'text-muted-fg opacity-45',
        disabled: 'opacity-75',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" {...iconProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
