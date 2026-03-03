interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <p className="text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
