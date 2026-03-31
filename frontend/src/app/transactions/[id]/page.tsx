import type { Metadata } from 'next';

import TransactionDetailPageContent from '@/components/transactions/TransactionDetailPageContent';

interface TransactionDetailPageProps {
    params: {
        id: string;
    };
}

export const metadata: Metadata = {
    title: 'Detalle de transacción | ReUseITESO',
};

export default function TransactionDetailPage({ params }: TransactionDetailPageProps) {
    return <TransactionDetailPageContent transactionIdParam={params.id} />;
}
