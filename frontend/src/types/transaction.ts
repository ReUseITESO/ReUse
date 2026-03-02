// Scaffolding: TypeScript types for marketplace transactions.
// Update these interfaces to match the actual backend response shape
// once the transaction endpoints are implemented.
// See docs/architecture/contracts.md for typing conventions.

import type { Product } from "@/types/product";
import type { User } from "@/types/user";

export type TransactionStatus =
	| "pending"
	| "accepted"
	| "rejected"
	| "completed"
	| "cancelled";

export interface Transaction {
	id: number;
	product: Product;
	buyer: Pick<User, "id" | "first_name" | "last_name">;
	seller: Pick<User, "id" | "first_name" | "last_name">;
	status: TransactionStatus;
	message: string | null;
	created_at: string;
	updated_at: string;
}
