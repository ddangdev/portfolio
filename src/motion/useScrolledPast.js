/* Scrolled past: true once the sentinel (a 1px marker at the very top of the page) has left the screen.
   One IntersectionObserver, no scroll listener. Drives the sticky header's hairline.
   No IntersectionObserver: reports true, so the hairline just shows. */
import { useEffect, useState } from 'react';
import { hasIntersectionObserver } from './useMediaQuery';

export function useScrolledPast(sentinelRef) {
  const canObserve = hasIntersectionObserver();
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !canObserve) return undefined;
    const io = new IntersectionObserver(([entry]) => setIsPast(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [canObserve, sentinelRef]);

  return canObserve ? isPast : true;
}
