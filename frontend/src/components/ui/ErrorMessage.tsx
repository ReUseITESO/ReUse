interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-error/20 bg-error/5 p-8 text-center">
      <p className="text-body font-semibold text-error">Algo salió mal</p>
      <p className="mt-2 text-sm text-error">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-error px-4 py-2 text-sm font-medium text-error-fg transition-colors hover:opacity-90"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
