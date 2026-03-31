'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  disabled?: boolean;
  emptyMessage?: string;
  optionLayout?: 'list' | 'grid';
  className?: string;
  inputClassName?: string;
}

export default function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
  emptyMessage = 'Sin coincidencias',
  optionLayout = 'list',
  className,
  inputClassName,
}: SearchableSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
      return;
    }

    setSearchTerm(value);
  }, [options, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return options;
    }

    return options.filter(option => option.label.toLowerCase().includes(normalizedTerm));
  }, [options, searchTerm]);

  function handleSelect(option: SearchableSelectOption) {
    onValueChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleInputChange(nextValue: string) {
    setSearchTerm(nextValue);
    onValueChange(nextValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && event.key === 'ArrowDown') {
      setIsOpen(true);
      setHighlightedIndex(0);
      return;
    }

    if (!isOpen) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex(previous => {
        const nextIndex = previous + 1;
        return nextIndex >= filteredOptions.length ? 0 : nextIndex;
      });
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex(previous => {
        if (previous <= 0) {
          return filteredOptions.length - 1;
        }
        return previous - 1;
      });
    }

    if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) {
        handleSelect(option);
      }
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <input
        value={searchTerm}
        onChange={event => handleInputChange(event.target.value)}
        onFocus={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        className={cn(
          'h-9 w-full rounded-lg border border-input bg-card px-3 pr-9 text-sm text-fg outline-none transition-colors placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-60',
          inputClassName,
        )}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />

      {isOpen && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-md"
        >
          {filteredOptions.length > 0 ? (
            <div className={cn(optionLayout === 'grid' && 'grid grid-cols-2 gap-2 sm:grid-cols-3')}>
              {filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={cn(
                    'rounded-md border border-input px-3 py-2 text-sm text-fg transition-colors hover:bg-muted',
                    optionLayout === 'list' && 'w-full text-left',
                    optionLayout === 'grid' && 'text-center',
                    index === highlightedIndex && 'bg-muted',
                    option.value === value && 'border-primary/40 bg-primary/10 text-primary',
                  )}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-fg">{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}
