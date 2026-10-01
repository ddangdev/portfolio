/* track(name, params): fire a GA4 event through the gtag snippet in index.html.
   A no-op when gtag is missing (blocked, not loaded) and never throws into the UI. */
export function track(name, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', name, params);
  } catch {
    /* analytics must never break the page */
  }
}
