import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Detalle del producto | ReUseITESO",
};

export default function ProductDetailPage({
	params,
}: {
	params: { id: string };
}) {
	return (
		<main className="p-8">
			<h1 className="text-2xl font-bold">Detalle del producto {params.id}</h1>
			{/* TODO: add ProductDetail component with full product data */}
		</main>
	);
}
