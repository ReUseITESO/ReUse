interface SearchResultsBadgeProps {
  totalCount: number;
  isLoading: boolean;
}

export default function SearchResultsBadge({ totalCount, isLoading }: SearchResultsBadgeProps) {
  if (isLoading) {
    return <p className="mt-2 text-sm text-gray-400">Buscando productos...</p>;
  }

  if (totalCount === 0) {
    return <p className="mt-2 text-sm text-red-500">No se encontraron resultados</p>;
  }

  const label = totalCount === 1 ? 'producto similar' : 'productos similares';

  return (
    <p className="mt-2 text-sm text-green-600">
      Se han encontrado {totalCount} {label}
    </p>
  );
}
