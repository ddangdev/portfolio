/* The view pill for one stage.
   Mouse: feeds the shared viewPillStore, and ViewPillCursor follows the pointer.
   Touch: the stage's own .pill settles on while the stage crosses the middle of the screen ({ isFocus }).
   No IntersectionObserver: the label just shows. */
import { useEffect, useState } from 'react';
import { hasIntersectionObserver, useFinePointer } from './useMediaQuery';
import { pillEnter, pillLeave, pillMove } from './viewPillStore';

const MID_SCREEN = '-30% 0px -30% 0px';

export function useViewPill(ref, label) {
  const fine = useFinePointer();
  const canObserve = hasIntersectionObserver();
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (fine) {
      const enter = (e) => pillEnter(label, e.clientX, e.clientY);
      const move = (e) => pillMove(e.clientX, e.clientY);
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', pillLeave);
      return () => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', pillLeave);
      };
    }

    if (!canObserve) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsFocus(entry.isIntersecting)),
      { rootMargin: MID_SCREEN },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [fine, canObserve, label, ref]);

  if (fine) return { isFocus: false };
  return { isFocus: canObserve ? isFocus : true };
}
