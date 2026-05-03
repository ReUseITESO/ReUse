import { cn } from '@/lib/utils';

interface ProductBadgeProps {
  label: string;
  className?: string;
}

export default function ProductBadge({ label, className }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors',
        className,
      )}
    >
      {label}
    </span>
  );
}
