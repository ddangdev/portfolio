/* ddanghnl-site: the cursor, a square (owner's call, 2026-11-04, after the circle on matsunori.com, squared
   to fit the site's sharp edges): a small square dot on the pointer, inside a thin square frame. Over a link or a button
   the ring swells; on a press it shrinks. It inverts against whatever is under it (difference blend),
   so it reads on the black page and in the white pop-ups alike. Behind it a sharp trail (owner's call,
   2026-11-04): a thin crisp line along the last third of a second of the pointer's path, thinning and
   fading towards its tail, drawn on a canvas over the page. Only for a real mouse (`pointer: fine`):
   on a phone there is nothing to draw. The native cursor is hidden everywhere but in text fields, where
   the I-beam still says where the caret will land. With reduced motion the ring keeps up exactly. */

import { useEffect, useRef } from 'react';

// what the ring swells over
const HOT = 'a, button, [role="button"], label, summary, .svc-disc, .wrk-dot, .wheel-tag';

// the trail: how long a point stays on it, and how wide the line is at the head
const TRAIL_MS = 320;
const TRAIL_W = 1.5;

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('has-cursor');
    const d = dot.current, r = ring.current, c = canvas.current;
    const ctx = c.getContext('2d');
    let x = -100, y = -100, rx = x, ry = y, raf = 0, shown = false;
    const trail = [];   // [x, y, time], oldest first

    // the canvas covers the window at device resolution, so the line stays crisp
    const size = () => {
      const k = devicePixelRatio || 1;
      c.width = innerWidth * k; c.height = innerHeight * k; ctx.setTransform(k, 0, 0, k, 0, 0);
    };
    size();
    addEventListener('resize', size);

    // the dot and the ring go straight to the pointer; the trail is redrawn each frame
    // from the points still young enough, each segment thinner and fainter the older it is
    const draw = () => {
      rx = x; ry = y;   // the ring sits on the pointer too (owner's call, 2026-11-04: no lag)
      r.style.transform = `translate(${rx}px, ${ry}px)`;
      const now = performance.now();
      while (trail.length && now - trail[0][2] > TRAIL_MS) trail.shift();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (!reduce) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 1; i < trail.length; i++) {
          const age = (now - trail[i][2]) / TRAIL_MS;   // 0 at the head, 1 at the tail
          ctx.strokeStyle = `rgba(255,255,255,${(1 - age) * 0.9})`;
          ctx.lineWidth = TRAIL_W * (1 - age) + 0.3;
          ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
        }
      }
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 || trail.length ? requestAnimationFrame(draw) : 0;
    };
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      trail.push([x, y, performance.now()]);
      d.style.transform = `translate(${x}px, ${y}px)`;
      if (!shown) { shown = true; rx = x; ry = y; d.classList.add('is-on'); r.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(draw);
      const hot = e.target instanceof Element && e.target.closest(HOT);
      r.classList.toggle('is-hot', Boolean(hot));
    };
    const leave = () => { shown = false; trail.length = 0; d.classList.remove('is-on'); r.classList.remove('is-on'); };
    const down = () => r.classList.add('is-down');
    const up = () => r.classList.remove('is-down');

    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerdown', down, { passive: true });
    addEventListener('pointerup', up, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', size);
      removeEventListener('pointermove', move); removeEventListener('pointerdown', down); removeEventListener('pointerup', up);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="cursor-trail" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
    </>
  );
}
