interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <p className="text-muted-fg">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="
            rounded-lg
            border
            border-btn-tmpl-border
            bg-btn-tmpl
            px-4
            py-2
            text-sm
            font-medium
            text-primary
            transition-colors
            hover:bg-btn-tmpl-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
