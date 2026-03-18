interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'gray' | 'red' | 'yellow';
  className?: string;
}

const VARIANT_STYLES: Record<string, string> = {
  blue: 'bg-info/10 text-info border border-info/30',
  green: 'bg-success/10 text-success border border-success/30',
  gray: 'bg-muted text-muted-fg border border-border',
  red: 'bg-error/10 text-error border border-error/30',
  yellow: 'bg-warning/10 text-warning border border-warning/30',
};

export default function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variantClass = className ?? VARIANT_STYLES[variant];

  return (
    <span
      className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${variantClass}`}
    >
      {children}
    </span>
  );
}
