import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/api";
import type { PaginatedResponse } from "@/types/api";
import type { Category } from "@/types/product";

export function useCategories() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchCategories = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await apiClient<PaginatedResponse<Category>>(
				"/marketplace/categories/",
			);
			setCategories(data.results);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al cargar categorías";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	return { categories, isLoading, error };
}
