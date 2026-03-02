// Scaffolding: hook for fetching gamification summary data (points, badges, impact).
// This hook depends on gamification endpoints that are not yet implemented.
// Update the endpoint path and response types to match your backend contract.
// See docs/architecture/modules.md (Gamification) for the expected endpoints.
"use client";

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/api";

import type { GamificationSummary } from "@/types/gamification";

export function useGamification() {
	const [summary, setSummary] = useState<GamificationSummary | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSummary = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const data = await apiClient<GamificationSummary>(
				"/gamification/summary/",
			);
			setSummary(data);
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error loading gamification data";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSummary();
	}, [fetchSummary]);

	return { summary, isLoading, error, refetch: fetchSummary };
}
