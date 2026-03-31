import type { ProductCondition, TransactionType } from '@/types/product';

export const CONDITION_LABELS: Record<ProductCondition, string> = {
    nuevo: 'Nuevo',
    como_nuevo: 'Como nuevo',
    buen_estado: 'Buen estado',
    usado: 'Usado',
};

export const TRANSACTION_OPTIONS: { value: TransactionType; label: string; description: string }[] =
    [
        { value: 'sale', label: 'Venta', description: 'Establece un precio' },
        { value: 'donation', label: 'Donación', description: 'Regala a quien lo necesite' },
        { value: 'swap', label: 'Intercambio', description: 'Cambia por otro artículo' },
    ];

export const INPUT_CLASS =
    'w-full rounded-lg border border-input bg-muted px-4 py-2.5 text-fg placeholder:text-muted-fg transition-colors focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50';
