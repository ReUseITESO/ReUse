// Scaffolding: authentication hook for login, register, and logout.
// This hook depends on core auth endpoints that are not yet implemented.
// Update the endpoint paths and payload types to match your backend contract.
// See docs/architecture/contracts.md and docs/architecture/modules.md (Core).
"use client";

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/api";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth";

import type {
	AuthTokens,
	User,
	UserLoginPayload,
	UserRegistrationPayload,
} from "@/types/user";

export function useAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCurrentUser = useCallback(async () => {
		const token = getAccessToken();
		if (!token) {
			setIsLoading(false);
			return;
		}

		try {
			const data = await apiClient<User>("/auth/me/");
			setUser(data);
		} catch {
			clearTokens();
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCurrentUser();
	}, [fetchCurrentUser]);

	async function login(payload: UserLoginPayload) {
		setError(null);
		try {
			const tokens = await apiClient<AuthTokens>("/auth/login/", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			setTokens(tokens.access, tokens.refresh);
			await fetchCurrentUser();
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al iniciar sesion";
			setError(message);
			throw err;
		}
	}

	async function register(payload: UserRegistrationPayload) {
		setError(null);
		try {
			await apiClient<User>("/auth/register/", {
				method: "POST",
				body: JSON.stringify(payload),
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al registrarse";
			setError(message);
			throw err;
		}
	}

	function logout() {
		clearTokens();
		setUser(null);
	}

	const isAuthenticated = user !== null;

	return { user, isLoading, error, isAuthenticated, login, register, logout };
}
