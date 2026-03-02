import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
			<h1 className="text-4xl font-bold">ReUseITESO</h1>
			<p className="text-lg text-gray-600">
				Plataforma de compraventa de segunda mano para estudiantes del ITESO
			</p>

			{/* TODO: reemplazar con navegacion real cuando exista layout con header */}
			<Link
				href="/products"
				className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				Ver productos
			</Link>
		</main>
	);
}
