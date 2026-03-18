interface SearchResultsBadgeProps {
  totalCount: number;
  isLoading: boolean;
}

export default function SearchResultsBadge({ totalCount, isLoading }: SearchResultsBadgeProps) {
  if (isLoading) {
    return <p className="mt-2 text-sm text-muted-fg">Buscando productos...</p>;
  }

  if (totalCount === 0) {
    return <p className="mt-2 text-sm text-error">No se encontraron resultados</p>;
  }

  const label = totalCount === 1 ? 'producto similar' : 'productos similares';

  return (
    <p className="mt-2 text-sm text-success">
      Se han encontrado {totalCount} {label}
    </p>
  );
}
