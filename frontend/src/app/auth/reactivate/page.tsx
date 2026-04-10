import { Suspense } from 'react';
import ReactivateContent from './ReactivateContent';

export default function ReactivatePage() {
  return (
    <Suspense fallback={null}>
      <ReactivateContent />
    </Suspense>
  );
}
