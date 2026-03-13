import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Página no encontrada</h2>
        <p className="mt-2 text-base text-gray-600">
          Esta página ya fue reciclada o la dirección es incorrecta.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
