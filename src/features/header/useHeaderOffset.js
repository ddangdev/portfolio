/* Publishes the header's rendered height on <html> as --top-h, so the sticky bar's scroll-padding (base.css
   section 4) matches the bar at any text size, including when the pill wraps to its own line.
   One ResizeObserver on the border box (it includes the safe-area padding), no resize listener.
   <html> is not rendered by React, so style.setProperty is the right tool here. Until this runs, or without
   ResizeObserver, the CSS falls back to --header-h. */
import { useEffect } from 'react';

export function useHeaderOffset(headerRef) {
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty('--top-h', `${el.offsetHeight}px`));
    ro.observe(el, { box: 'border-box' });
    return () => {
      ro.disconnect();
      root.style.removeProperty('--top-h');
    };
  }, [headerRef]);
}
