/* Magnetic lean for one button (mouse only, never under reduced motion).
   The button leans toward the pointer, never more than a third of the gap to a neighbouring
   [data-magnetic] sibling, so two buttons leaning together always keep a clear gap. Its .mag-in label
   drifts a further 0.4x. The transforms are written straight to the DOM on every pointermove; those
   elements get no React `style` prop, so a re-render never fights them. Returns { isMag }. */
import { useEffect, useState } from 'react';
import { useFinePointer, useReducedMotion } from './useMediaQuery';

const PULL_X = 0.18;
const PULL_Y = 0.28;
const LABEL_SHARE = 0.4;

const box = (el) => ({
  l: el.offsetLeft,
  t: el.offsetTop,
  r: el.offsetLeft + el.offsetWidth,
  b: el.offsetTop + el.offsetHeight,
});

export function useMagnetic(ref, max = 6) {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const active = fine && !reduced;
  const [isMag, setIsMag] = useState(false);

  useEffect(() => {
    const btn = ref.current;
    if (!btn || !active) return undefined;
    const inner = btn.querySelector('.mag-in');
    let lim = { l: max, r: max, u: max, d: max };
    let leaning = false;

    const measure = () => {
      lim = { l: max, r: max, u: max, d: max };
      const me = box(btn);
      Array.from(btn.parentNode ? btn.parentNode.children : []).forEach((sib) => {
        if (sib === btn || !sib.hasAttribute('data-magnetic')) return;
        const o = box(sib);
        const sameRow = o.t < me.b && o.b > me.t;
        const sameCol = o.l < me.r && o.r > me.l;
        if (sameRow && o.l >= me.r) lim.r = Math.min(lim.r, (o.l - me.r) / 3);
        if (sameRow && o.r <= me.l) lim.l = Math.min(lim.l, (me.l - o.r) / 3);
        if (sameCol && o.t >= me.b) lim.d = Math.min(lim.d, (o.t - me.b) / 3);
        if (sameCol && o.b <= me.t) lim.u = Math.min(lim.u, (me.t - o.b) / 3);
      });
    };
    const move = (e) => {
      const r = btn.getBoundingClientRect();
      const tx = Math.max(-lim.l, Math.min(lim.r, (e.clientX - (r.left + r.width / 2)) * PULL_X));
      const ty = Math.max(-lim.u, Math.min(lim.d, (e.clientY - (r.top + r.height / 2)) * PULL_Y));
      if (!leaning) {
        leaning = true;
        setIsMag(true);
      }
      btn.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0)`;
      if (inner) inner.style.transform = `translate3d(${(tx * LABEL_SHARE).toFixed(2)}px,${(ty * LABEL_SHARE).toFixed(2)}px,0)`;
    };
    const clearStyles = () => {
      btn.style.transform = '';
      if (inner) inner.style.transform = '';
    };
    const leave = () => {
      leaning = false;
      setIsMag(false);
      clearStyles();
    };

    btn.addEventListener('pointerenter', measure);
    btn.addEventListener('pointermove', move);
    btn.addEventListener('pointerleave', leave);
    return () => {
      btn.removeEventListener('pointerenter', measure);
      btn.removeEventListener('pointermove', move);
      btn.removeEventListener('pointerleave', leave);
      clearStyles();
    };
  }, [active, max, ref]);

  return { isMag: active && isMag };
}
