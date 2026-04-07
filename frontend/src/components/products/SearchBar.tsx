'use client';

import { RotateCcw, Search } from 'lucide-react';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SearchBarProps } from '@/types/searchs';

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  onShowAll,
  showContainer = true,
  showShowAllButton = true,
}: SearchBarProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onSearch(query.trim());
    }
  }

  function handleSearch() {
    onSearch(query.trim());
  }

  function handleShowAll() {
    onQueryChange('');
    onShowAll();
  }

  const searchContent = (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <Input
          value={query}
          onChange={onQueryChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos por nombre o descripcion..."
          className="border-border/70 bg-bg/90"
        />
      </div>
      <div className="flex items-center justify-end gap-2 sm:ml-2">
        <Button onClick={handleSearch} className="inline-flex items-center gap-2 px-6">
          <Search className="h-4 w-4" />
          Buscar
        </Button>
        {showShowAllButton && (
          <Button
            variant="template"
            onClick={handleShowAll}
            className="inline-flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar todo
          </Button>
        )}
      </div>
    </div>
  );

  if (!showContainer) {
    return searchContent;
  }

  return <div className="rounded-xl border border-border bg-card p-3 sm:p-4">{searchContent}</div>;
}
