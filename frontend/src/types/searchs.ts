
//SearchBar.tsx
export interface SearchBarProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSearch: (query: string) => void;
    onShowAll: () => void;
    showContainer?: boolean;
    showShowAllButton?: boolean;
}

// SearchResultsBadge.tsx
export interface SearchResultsBadgeProps {
    totalCount: number;
    isLoading: boolean;
    hasFilters: boolean;
}
