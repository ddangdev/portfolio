/* The single mouse view pill, portalled into <body> so it keeps the PAGE --ink (not a tile's).
   Rendered once and never re-rendered with new props: its position, label and `is-on` are written
   imperatively by an rAF loop that eases toward the pointer (k = 0.24; k = 1 under reduced motion).
   CSS shows it only for a fine pointer with JS on. */
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from '../motion/useMediaQuery';
import { subscribeViewPill } from '../motion/viewPillStore';

const EASE_K = 0.24;
const SETTLE_PX = 0.2;

export default function ViewPillCursor() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);

  useEffect(() => {
    const cursor = ref.current;
    if (!cursor) return undefined;
    const label = cursor.querySelector('.cursor-t');
    let tx = -200, ty = -200, cx = -200, cy = -200, w = 0, h = 0;
    let running = false;
    let on = false;
    let raf = 0;

    const loop = () => {
      const k = reducedRef.current ? 1 : EASE_K;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      cursor.style.transform = `translate3d(${(cx - w / 2).toFixed(1)}px,${(cy - h / 2).toFixed(1)}px,0)`;
      if (Math.abs(tx - cx) > SETTLE_PX || Math.abs(ty - cy) > SETTLE_PX) raf = requestAnimationFrame(loop);
      else running = false;
    };
    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const hide = () => {
      if (!on) return;
      on = false;
      cursor.classList.remove('is-on');
    };

    const unsubscribe = subscribeViewPill((event) => {
      if (event.type === 'enter') {
        if (label && label.textContent !== event.label) label.textContent = event.label;
        w = cursor.offsetWidth;
        h = cursor.offsetHeight;
        tx = event.x;
        ty = event.y;
        if (!on) { cx = tx; cy = ty; }   // appear where the pointer is, then follow
        on = true;
        cursor.classList.add('is-on');
        kick();
      } else if (event.type === 'move') {
        tx = event.x;
        ty = event.y;
        kick();
      } else if (event.type === 'leave') {
        hide();
      }
    });
    window.addEventListener('scroll', hide, { passive: true });

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', hide);
      cancelAnimationFrame(raf);
    };
  }, []);

  return createPortal(
    <div ref={ref} className="cursor" aria-hidden="true">
      <span className="pdot"></span><span className="cursor-t">view site</span> <span className="arr">↗</span>
    </div>,
    document.body,
  );
}
