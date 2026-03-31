'use client';

import { CalendarDays, Clock3 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TimeScrollPicker from '@/components/ui/TimeScrollPicker';
import { isCampusClosedDay } from '@/lib/campusLocations';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  disabled?: boolean;
  minHour?: number;
  maxHour?: number;
  onInvalidTimeChange?: (message: string | null) => void;
}

function mergeDateAndTime(baseDate: Date, timeValue: string): Date {
  const [hourText, minuteText] = timeValue.split(':');
  const next = new Date(baseDate);
  next.setHours(Number(hourText), Number(minuteText), 0, 0);
  return next;
}

function toTimeInputValue(date: Date | null): string {
  if (!date) {
    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function toDisplayTimeLabel(date: Date | null): string {
  if (!date) {
    return '--:-- --';
  }

  const hours24 = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const isPm = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const period = isPm ? 'PM' : 'AM';

  return `${String(hours12).padStart(2, '0')}:${minutes} ${period}`;
}

function isTimeWithinRange(timeValue: string, minHour: number, maxHour: number): boolean {
  const [hourText, minuteText] = timeValue.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return false;
  }

  if (hour < minHour || hour > maxHour) {
    return false;
  }

  if (hour === maxHour && minute > 0) {
    return false;
  }

  return true;
}

function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function isPastDay(date: Date): boolean {
  return date < getTodayStart();
}

function isWeekendFutureDay(date: Date): boolean {
  return !isPastDay(date) && isCampusClosedDay(date);
}

export default function DateTimePicker({
  value,
  onChange,
  disabled = false,
  minHour = 7,
  maxHour = 22,
  onInvalidTimeChange,
}: DateTimePickerProps) {
  const selectedTime = toTimeInputValue(value);
  const selectedTimeLabel = toDisplayTimeLabel(value);
  const weekScheduleLabel = `Disponibilidad de Lunes a viernes · ${String(minHour).padStart(2, '0')}:00 a ${String(maxHour).padStart(2, '0')}:00`;

  function emitValidation(message: string | null) {
    if (onInvalidTimeChange) {
      onInvalidTimeChange(message);
    }
  }

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger
          className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-card px-3 text-sm text-fg cursor-pointer transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
        >
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-info" />
            {value ? format(value, "dd 'de' MMMM yyyy", { locale: es }) : 'Selecciona fecha'}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={selected => {
              if (!selected) {
                onChange(null);
                emitValidation(null);
                return;
              }

              if (value) {
                onChange(mergeDateAndTime(selected, selectedTime || `${String(minHour).padStart(2, '0')}:00`));
                return;
              }

              onChange(mergeDateAndTime(selected, `${String(minHour).padStart(2, '0')}:00`));
              emitValidation(null);
            }}
            locale={es}
            disabled={date => isPastDay(date) || isWeekendFutureDay(date)}
            modifiers={{
              pastDay: date => isPastDay(date),
              weekendClosed: date => isWeekendFutureDay(date),
            }}
            modifiersClassNames={{
              pastDay: '[&>button]:!text-muted-fg [&>button]:!opacity-45',
              weekendClosed: '[&>button]:!bg-error/10 [&>button]:!text-error [&>button]:line-through',
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="rounded-lg border border-input bg-muted/40 p-2">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-warning" />
            <span className="text-sm text-fg">Selecciona hora</span>
          </span>
          <span className="rounded-md border border-input bg-card px-2 py-1 text-xs font-medium text-fg">
            {selectedTimeLabel}
          </span>
        </div>

        <TimeScrollPicker
          value={selectedTime || `${String(minHour).padStart(2, '0')}:00`}
          minHour={minHour}
          maxHour={maxHour}
          disabled={disabled || !value}
          onInvalidSelection={() => {
            emitValidation(`Horario ITESO: ${String(minHour).padStart(2, '0')}:00 a ${String(maxHour).padStart(2, '0')}:00.`);
          }}
          onChange={nextTime => {
            if (!value) {
              emitValidation('Selecciona primero una fecha.');
              return;
            }

            if (isCampusClosedDay(value)) {
              emitValidation('Solo se permiten reuniones de lunes a viernes.');
              return;
            }

            if (!isTimeWithinRange(nextTime, minHour, maxHour)) {
              emitValidation(`Horario ITESO: ${String(minHour).padStart(2, '0')}:00 a ${String(maxHour).padStart(2, '0')}:00.`);
              return;
            }

            emitValidation(null);
            onChange(mergeDateAndTime(value, nextTime));
          }}
        />
        <p className="mt-2 text-xs text-muted-fg">{weekScheduleLabel}</p>
      </div>
    </div>
  );
}
