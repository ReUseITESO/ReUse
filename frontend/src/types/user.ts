// Scaffolding: TypeScript types for the User model and auth payloads.
// Update these interfaces to match the actual backend response shape
// once the core module is implemented.
// See docs/architecture/contracts.md section 2.4 for typing conventions.

export interface User {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	student_id: string;
	phone: string;
	campus: string;
	avatar_url: string | null;
	rating: number;
	is_verified: boolean;
	created_at: string;
}

export interface UserRegistrationPayload {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	student_id: string;
}

export interface UserLoginPayload {
	email: string;
	password: string;
}

export interface AuthTokens {
	access: string;
	refresh: string;
}
