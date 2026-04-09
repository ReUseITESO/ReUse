import { useEffect, useState } from 'react';

function calculateItemsPerPage(width: number): number {
  if (width >= 1024) {
    return 3;
  }

  if (width >= 640) {
    return 2;
  }

  return 1;
}

export function useResponsiveSwapPageSize() {
  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    function handleResize() {
      setItemsPerPage(calculateItemsPerPage(window.innerWidth));
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return itemsPerPage;
}
