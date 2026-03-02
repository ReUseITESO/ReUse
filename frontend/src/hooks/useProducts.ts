import { useCallback, useEffect, useRef, useState } from "react";

import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types/api";
import type { Product } from "@/types/product";

export interface ProductFilters {
	search?: string;
	category?: string;
	condition?: string;
	transaction_type?: string;
	ordering?: string;
}

export function useProducts() {
	const [products, setProducts] = useState<Product[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [hasPrevPage, setHasPrevPage] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [hasFilters, setHasFilters] = useState(false);

	// Keep a ref to the latest filters so goToPage never closes over stale state.
	const activeFiltersRef = useRef<ProductFilters>({});

	const fetchProducts = useCallback(
		async (filters: ProductFilters = {}, page = 1) => {
			activeFiltersRef.current = filters;
			setIsLoading(true);
			setError(null);

			const { search, category, condition, transaction_type, ordering } =
				filters;
			const isFiltered = Boolean(
				search || category || condition || transaction_type || ordering,
			);
			setHasFilters(isFiltered);

			const params = new URLSearchParams();
			if (search) params.set("search", search);
			if (category) params.set("category", category);
			if (condition) params.set("condition", condition);
			if (transaction_type) params.set("transaction_type", transaction_type);
			if (ordering) params.set("ordering", ordering);
			if (page > 1) params.set("page", String(page));

			const query = params.toString() ? `?${params.toString()}` : "";

			try {
				const data = await apiClient<PaginatedResponse<Product>>(
					`/marketplace/products/${query}`,
				);
				setProducts(data.results);
				setTotalCount(data.count);
				setCurrentPage(page);
				setHasNextPage(Boolean(data.next));
				setHasPrevPage(Boolean(data.previous));
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Error loading products";
				setError(message);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	const goToPage = useCallback(
		(page: number) => {
			fetchProducts(activeFiltersRef.current, page);
		},
		[fetchProducts],
	);

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	return {
		products,
		totalCount,
		currentPage,
		hasNextPage,
		hasPrevPage,
		isLoading,
		error,
		hasFilters,
		fetchProducts,
		goToPage,
	};
}
