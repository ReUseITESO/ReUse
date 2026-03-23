'use client';

import { Suspense } from 'react';
import CheckEmailContent from './CheckEmailContent';

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <CheckEmailContent />
    </Suspense>
  );
}
