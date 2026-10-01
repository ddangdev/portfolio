/* Scroll reveal for one element: { isIn, index }. `index` is the element's place in the batch that entered
   together (the CSS staggers on it as --i). Reduced motion, no observer, or `enabled` false: in at once. */
import { useEffect, useState } from 'react';
import { observeReveal } from './revealObserver';
import { hasIntersectionObserver, useReducedMotion } from './useMediaQuery';

const SHOWN = { isIn: true, index: 0 };

export function useScrollReveal(ref, enabled = true) {
  const reduced = useReducedMotion();
  const [state, setState] = useState({ isIn: false, index: 0 });
  const immediate = !enabled || reduced || !hasIntersectionObserver();

  useEffect(() => {
    if (immediate) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    return observeReveal(el, (index) => setState({ isIn: true, index }));
  }, [immediate, ref]);

  return immediate ? SHOWN : state;
}
