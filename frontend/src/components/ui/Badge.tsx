interface BadgeProps {
    children: React.ReactNode;
    variant?: 'blue' | 'green' | 'gray' | 'red' | 'yellow';
    className?: string;
}

const VARIANT_STYLES: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
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
