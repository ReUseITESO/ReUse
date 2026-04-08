'use client';

import { Suspense } from 'react';
import MicrosoftCallbackContent from './MicrosoftCallbackContent';

export default function MicrosoftCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <MicrosoftCallbackContent />
    </Suspense>
  );
}
