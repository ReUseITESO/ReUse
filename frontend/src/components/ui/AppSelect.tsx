'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface AppSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AppSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: AppSelectOption[];
  disabled?: boolean;
  emptyOptionLabel?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const EMPTY_SENTINEL = '__empty__';

export default function AppSelect({
  value,
  onValueChange,
  placeholder,
  options,
  disabled = false,
  emptyOptionLabel,
  triggerClassName,
  contentClassName,
}: AppSelectProps) {
  const normalizedValue = value === '' && emptyOptionLabel ? EMPTY_SENTINEL : value || undefined;

  return (
    <Select
      value={normalizedValue}
      onValueChange={next => onValueChange(next === EMPTY_SENTINEL ? '' : next)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          'w-full rounded-lg border-input bg-card px-3 text-fg cursor-pointer hover:bg-muted focus-visible:ring-ring/30',
          triggerClassName,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className={cn('rounded-lg border-border bg-card text-card-fg', contentClassName)}
      >
        {emptyOptionLabel && <SelectItem value={EMPTY_SENTINEL}>{emptyOptionLabel}</SelectItem>}
        {options.map(option => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
