'use client';

import { cn } from '@/lib/utils';

interface TimeScrollPickerProps {
  value: string;
  minHour: number;
  maxHour: number;
  disabled?: boolean;
  onChange: (nextTime: string) => void;
  onInvalidSelection?: () => void;
}

type Period = 'AM' | 'PM';

const HOURS_12 = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
const PERIODS: Period[] = ['AM', 'PM'];

function to24Hour(hour12: number, period: Period): number {
  if (period === 'AM') {
    return hour12 === 12 ? 0 : hour12;
  }
  return hour12 === 12 ? 12 : hour12 + 12;
}

function to12Hour(hour24: number): { hour12: number; period: Period } {
  if (hour24 === 0) {
    return { hour12: 12, period: 'AM' };
  }

  if (hour24 < 12) {
    return { hour12: hour24, period: 'AM' };
  }

  if (hour24 === 12) {
    return { hour12: 12, period: 'PM' };
  }

  return { hour12: hour24 - 12, period: 'PM' };
}

function parseTime(value: string): { hour24: number; minute: number } {
  const [hourText, minuteText] = value.split(':');
  const hour24 = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour24) || Number.isNaN(minute)) {
    return { hour24: 0, minute: 0 };
  }

  return { hour24, minute };
}

function buildTime(hour24: number, minute: number): string {
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function isInRange(hour24: number, minute: number, minHour: number, maxHour: number): boolean {
  if (hour24 < minHour || hour24 > maxHour) {
    return false;
  }

  if (hour24 === maxHour && minute > 0) {
    return false;
  }

  return true;
}

export default function TimeScrollPicker({
  value,
  minHour,
  maxHour,
  disabled = false,
  onChange,
  onInvalidSelection,
}: TimeScrollPickerProps) {
  const parsed = parseTime(value || `${String(minHour).padStart(2, '0')}:00`);
  const minute = parsed.minute;
  const { hour12, period } = to12Hour(parsed.hour24);

  function tryCommit(nextHour12: number, nextMinute: number, nextPeriod: Period) {
    const nextHour24 = to24Hour(nextHour12, nextPeriod);
    if (!isInRange(nextHour24, nextMinute, minHour, maxHour)) {
      if (onInvalidSelection) {
        onInvalidSelection();
      }
      return;
    }

    onChange(buildTime(nextHour24, nextMinute));
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-md border border-input bg-card p-1">
        <p className="px-2 pb-1 text-xs text-muted-fg">Hora</p>
        <div className="max-h-36 space-y-1 overflow-y-auto px-1 pb-1">
          {HOURS_12.map(option => {
            const optionHour24 = to24Hour(option, period);
            const isDisabled = !isInRange(optionHour24, minute, minHour, maxHour);

            return (
              <button
                key={option}
                type="button"
                disabled={disabled || isDisabled}
                onClick={() => tryCommit(option, minute, period)}
                className={cn(
                  'w-full rounded-md px-2 py-1 text-sm transition-colors',
                  option === hour12 ? 'bg-primary text-primary-fg' : 'text-fg hover:bg-muted',
                  (disabled || isDisabled) && 'cursor-not-allowed opacity-45 hover:bg-transparent',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-input bg-card p-1">
        <p className="px-2 pb-1 text-xs text-muted-fg">Minuto</p>
        <div className="max-h-36 space-y-1 overflow-y-auto px-1 pb-1">
          {MINUTES.map(option => {
            const optionMinute = Number(option);
            const isDisabled = !isInRange(parsed.hour24, optionMinute, minHour, maxHour);

            return (
              <button
                key={option}
                type="button"
                disabled={disabled || isDisabled}
                onClick={() => tryCommit(hour12, optionMinute, period)}
                className={cn(
                  'w-full rounded-md px-2 py-1 text-sm transition-colors',
                  optionMinute === minute ? 'bg-primary text-primary-fg' : 'text-fg hover:bg-muted',
                  (disabled || isDisabled) && 'cursor-not-allowed opacity-45 hover:bg-transparent',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-input bg-card p-1">
        <p className="px-2 pb-1 text-xs text-muted-fg">Periodo</p>
        <div className="max-h-36 space-y-1 overflow-y-auto px-1 pb-1">
          {PERIODS.map(option => {
            const optionHour24 = to24Hour(hour12, option);
            const isDisabled = !isInRange(optionHour24, minute, minHour, maxHour);

            return (
              <button
                key={option}
                type="button"
                disabled={disabled || isDisabled}
                onClick={() => tryCommit(hour12, minute, option)}
                className={cn(
                  'w-full rounded-md px-2 py-1 text-sm transition-colors',
                  option === period ? 'bg-primary text-primary-fg' : 'text-fg hover:bg-muted',
                  (disabled || isDisabled) && 'cursor-not-allowed opacity-45 hover:bg-transparent',
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
