/* ddanghnl-site: the page counter. Top left under the nav, the number of the page on show ("01 / 04
   about") in red dots on the clock's grid (owner's call, 2026-11-01), alive the way a board is: the dark
   dots are faintly there with a slow shimmer passing over them, a lit dot now and then flickers, and
   on a change of page the dots scramble for a beat before settling, column by column, into the new
   number. On one of work's projects, a line under the page's name gives the path down to it,
   "↳ NORI BAR" (owner's call, 2026-11-01), the page above it dimmed. Reduced motion: none of that, the number just changes. Decorative - the nav says the page. */

import { useEffect, useRef, useState } from 'react';
import { COLS, ROWS, dotsFor } from './digits.js';

const SCRAMBLE = [0, 60, 120];   // ms: the noise frames before the number settles
const SETTLE_MS = 180;
const FLICKER_MS = 160;          // how often a dot may flicker, idle

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const noise = (n) => Array.from({ length: n }, () => Math.random() < 0.45);

export default function Counter({ index, total, name, sub, shown }) {
  const [dots, setDots] = useState(() => dotsFor(index));
  const [settling, setSettling] = useState(false);
  const board = useRef(null);
  const first = useRef(true);

  // a new page: scramble, then settle into its number
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    const final = dotsFor(index);
    if (reduced()) { setDots(final); return undefined; }
    const timers = SCRAMBLE.map((t) => setTimeout(() => { setSettling(false); setDots(noise(final.length)); }, t));
    timers.push(setTimeout(() => { setSettling(true); setDots(final); }, SCRAMBLE.at(-1) + 60));
    timers.push(setTimeout(() => setSettling(false), SCRAMBLE.at(-1) + 60 + SETTLE_MS + COLS * 2 * 22));
    return () => timers.forEach(clearTimeout);
  }, [index]);

  // idle: now and then a dot flickers - straight on the element, no render
  useEffect(() => {
    if (!shown || reduced()) return undefined;
    const id = setInterval(() => {
      const all = board.current?.children;
      if (!all?.length) return;
      const dot = all[Math.floor(Math.random() * all.length)];
      dot.classList.remove('is-flicker');
      void dot.offsetWidth;   // restart the animation if it was mid-flicker
      dot.classList.add('is-flicker');
    }, FLICKER_MS);
    return () => clearInterval(id);
  }, [shown]);

  return (
    <div className={`counter${shown ? ' is-shown' : ''}`} aria-hidden="true">
      <div ref={board} className={`counter-board${settling ? ' is-settling' : ''}`}
           style={{ '--cols': COLS * 2 + 1, '--rows': ROWS }}>
        {dots.map((lit, i) => {
          const digit = Math.floor(i / (COLS * ROWS)), cell = i % (COLS * ROWS);
          const r = Math.floor(cell / COLS), c = (cell % COLS) + digit * (COLS + 1);   // a dark column between digits
          return <span key={i} className={`counter-dot${lit ? ' is-lit' : ''}`}
                       style={{ gridRow: r + 1, gridColumn: c + 1, '--r': r, '--c': c }}
                       onAnimationEnd={(e) => e.animationName.startsWith('counter-') && e.animationName !== 'counter-wave' && e.currentTarget.classList.remove('is-flicker')} />;
        })}
      </div>
      <div className="counter-label">
        <span className="counter-total">/ {String(total).padStart(2, '0')}</span>
        <span key={name} className={`counter-name${sub ? ' is-parent' : ''}`}>{name}</span>
        {sub && <span key={sub} className="counter-sub"><span className="counter-sub-mark">↳</span> {sub}</span>}
      </div>
    </div>
  );
}
