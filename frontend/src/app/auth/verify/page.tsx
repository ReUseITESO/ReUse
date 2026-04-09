'use client';

import { Suspense } from 'react';
import VerifyContent from './VerifyContent';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <VerifyContent />
    </Suspense>
  );
}
