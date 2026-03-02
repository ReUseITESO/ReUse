interface EmptyStateProps {
	message: string;
	actionLabel?: string;
	onAction?: () => void;
}

export default function EmptyState({
	message,
	actionLabel,
	onAction,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-4 p-8 text-center">
			<p className="text-gray-500">{message}</p>
			{actionLabel && onAction && (
				<button
					onClick={onAction}
					className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
				>
					{actionLabel}
				</button>
			)}
		</div>
	);
}
