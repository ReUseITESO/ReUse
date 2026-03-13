import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-12">
      <div className="relative z-10 flex items-center justify-center gap-2 select-none">
        <span className="text-numeral-hero font-bold leading-none text-primary sm:text-numeral-hero-lg">4</span>
        <img
          src="/ReUseITESOLogo.png"
          alt="0"
          className="h-32 w-32 object-contain sm:h-44 sm:w-44"
        />
        <span className="text-numeral-hero font-bold leading-none text-primary sm:text-numeral-hero-lg">4</span>
      </div>

      <div className="relative z-10 mt-6 flex items-center gap-4 w-full max-w-xs">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-fg">página no encontrada</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="relative z-10 mt-4 max-w-sm text-center text-sm text-muted-fg">
        La página que buscas ya fue reciclada o la dirección no es correcta.
      </p>

      <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-lg bg-btn-primary px-8 py-3 text-sm font-medium text-btn-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
        >
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
