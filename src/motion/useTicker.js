/* Odometer ticker for one text ("Sept 2026"). Phases:
     'static'  reduced motion or no observer: render plain text
     'idle'    digit strips already at their digit, so it reads right before it rolls
     'reset'   first time on screen: strips jump to 0 with no transition
     'rolling' one reflow later: strips roll back to their digit, staggered
   The strips' transforms are React-owned (Ticker renders them from the phase). */
import { useEffect, useLayoutEffect, useState } from 'react';
import { hasIntersectionObserver, useReducedMotion } from './useMediaQuery';

const ROOT_MARGIN = '0px 0px -15% 0px';

export function useTicker(ref) {
  const reduced = useReducedMotion();
  const isStatic = reduced || !hasIntersectionObserver();
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    if (isStatic) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        setPhase('reset');
      },
      { rootMargin: ROOT_MARGIN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isStatic, ref]);

  useLayoutEffect(() => {
    if (phase !== 'reset') return undefined;
    const el = ref.current;
    if (el) void el.offsetHeight;   // commit the start position before the roll begins
    const raf = requestAnimationFrame(() => setPhase('rolling'));
    return () => cancelAnimationFrame(raf);
  }, [phase, ref]);

  return isStatic ? 'static' : phase;
}
