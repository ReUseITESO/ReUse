// Scaffolding: reusable Card component for consistent container styling.
// The team can modify the default classes or add variants as needed.
// See reglas_de_escritura_front.md section 6 for component organization.

import type { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
	return (
		<div
			className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}
		>
			{children}
		</div>
	);
}
