'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import EasterEggOverlay from './EasterEggOverlay';

export default function EasterEggDice() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (pathname === '/hacked') return;
    if (typeof window === 'undefined') return;

    if (searchParams.get('easter') === 'on') {
      sessionStorage.removeItem('reuse-easter-fired');
      setActive(true);
      return;
    }

    if (sessionStorage.getItem('reuse-easter-fired') === '1') return;

    const roll = Math.floor(Math.random() * 100) + 1;
    if (roll === 69) {
      sessionStorage.setItem('reuse-easter-fired', '1');
      setActive(true);
    }
  }, [pathname, searchParams]);

  if (!active) return null;
  return <EasterEggOverlay onClose={() => setActive(false)} />;
}
