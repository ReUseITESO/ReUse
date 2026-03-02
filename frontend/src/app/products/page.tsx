import type { Metadata } from "next";
import Link from "next/link";

import ProductList from "@/components/products/ProductList";

export const metadata: Metadata = {
	title: "Productos disponibles | ReUseITESO",
	description:
		"Explora productos de segunda mano disponibles entre estudiantes del ITESO",
};

export default function ProductsPage() {
	return (
		<main className="px-6 py-8">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">
					Productos disponibles
				</h1>
				<Link
					href="/products/new"
					className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
				>
					<span aria-hidden="true">+</span>
					Publicar artículo
				</Link>
			</div>
			<ProductList />
		</main>
	);
}
