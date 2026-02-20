'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onShowAll: () => void;
}

export default function SearchBar({ onSearch, onShowAll }: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onSearch(query);
    }
  }

  function handleSearch() {
    onSearch(query);
  }

  function handleShowAll() {
    setQuery('');
    onShowAll();
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={query}
        onChange={setQuery}
        onKeyDown={handleKeyDown}
        placeholder="Buscar productos..."
      />
      <Button onClick={handleSearch}>Buscar</Button>
      <Button variant="secondary" onClick={handleShowAll}>
        Mostrar todos
      </Button>
    </div>
  );
}
