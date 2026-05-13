// Handles scroll behavior on route/hash change.
//   - No hash  -> scroll to top of page.
//   - With hash -> scroll to the element with that id, after render.
//     This makes direct-link navigation (QR codes, shared URLs, bookmarks)
//     land on the correct section even on fresh page loads, not just on
//     in-page anchor clicks.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '');
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      };
      // Try immediately for already-rendered sections, then again after a
      // short delay as a safety retry for sections that animate or render late.
      requestAnimationFrame(tryScroll);
      const t = setTimeout(tryScroll, 250);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);
  return null;
}
