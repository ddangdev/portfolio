/* ddanghnl-site: work's projects as dots floating about in a box (owner's call, 2026-11-02, in place of a
   list of names), the box split into columns by dotted lines, a column for each kind of work with its
   name at the top (owner's call, the same day): each project a small solid dot in its kind's colour,
   drifting slowly on its own course within its column, turning softly off the column's sides and
   nudging away from the others so no two sit on top of each other. Pointing at a dot slows it right
   down and writes its name out beside it on the page - a line drawn out, the words typed on, as the
   services' dots do; a tap or click opens the project (`onGo`). Pressing and holding a dot (a finger on
   a phone, where there is no pointing; a mouse too) shows its name and picks the dot up: it follows
   the finger, kept inside its column, and is let go where it is dropped, carrying on from there
   (owner's call, 2026-11-02). A short tap still opens the project. Positions are set on the dots
   directly, every frame; React only draws them. Reduced motion: the dots stand where they start. Rendered by
   page/PageDialog.jsx for a page with `links` (the projects, each with a `name` and `kind`) and `kinds`
   (each with its `color`). */

import { useLayoutEffect, useRef } from 'react';
import { track } from '../analytics/analytics.js';

// a dot's pace, in px a second, and the share of it kept while pointed at: slow motion, not a stop
const PACE = [10, 20];
const SLOW = 0.1;
// how close two dots may come (centre to centre) before they nudge apart
const APART = 36;
// how long a press is before it picks the dot up (a shorter one is a tap, and opens the project); a
// finger that moves further than this before then picks it up at once
const HOLD = 180;
const WOBBLE = 4;
// the room a dot keeps from its column's sides, and from the box's top (under the column's name) and bottom
const EDGE = 14;
const TOP = 44;
const BOTTOM = 16;
// a column narrower than this (a phone) has its name down its left edge instead of across its top: the
// dots keep right of the name, and start higher
const NARROW = 90;
const NAME = 18;
const TOP_NARROW = 14;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// a fixed scatter: the same each visit, different for each dot
const seeded = (i, k) => { const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

export default function WorkField({ projects, kinds, onGo }) {
  const field = useRef(null);
  const dots = useRef([]);
  const held = useRef(-1);   // the dot the pointer is over: it slows
  const grabbed = useRef(-1);   // the dot picked up: it goes where the finger goes
  const put = useRef(null);     // puts a dot where the finger is (set up with the field)
  const press = useRef({ i: -1, timer: 0, dragged: false, x: 0, y: 0 });

  useLayoutEffect(() => {
    const el = field.current;
    const still = reduced();
    let raf = 0, last = performance.now(), w = el.clientWidth, h = el.clientHeight;
    const cols = kinds.length;
    let narrow = false, top = TOP;
    const size = () => { narrow = w / cols < NARROW; top = narrow ? TOP_NARROW : TOP; el.classList.toggle('is-narrow', narrow); };
    size();
    // a column's span across: its left and right, less the edge (and its name, down the left when narrow)
    const span = (c) => { const cw = w / cols; return [c * cw + EDGE + (narrow ? NAME : 0), (c + 1) * cw - EDGE]; };
    // each dot: its column, where it is and which way it goes, scattered down its column to start
    const ds = projects.map((p, i) => {
      const c = Math.max(0, kinds.findIndex((k) => k.kind === p.kind)), [l, r] = span(c);
      const a = seeded(i, 2) * Math.PI * 2, v = PACE[0] + seeded(i, 3) * (PACE[1] - PACE[0]);
      return { c, x: l + seeded(i, 0) * (r - l), y: top + seeded(i, 1) * (h - top - BOTTOM), vx: Math.cos(a) * v, vy: Math.sin(a) * v };
    });
    const place = () => ds.forEach((d, i) => {
      const dot = dots.current[i];
      if (!dot) return;
      dot.style.transform = `translate(${(d.x - dot.offsetWidth / 2).toFixed(1)}px, ${(d.y - dot.offsetHeight / 2).toFixed(1)}px)`;
      // a dot on the right half writes its name out to the left, so it stays in the box
      dot.classList.toggle('is-flipped', d.x > w / 2);
    });
    // a dot kept inside its column: off a side, it turns back
    const keep = (d) => {
      const [l, r] = span(d.c);
      if (d.x < l) { d.x = l; d.vx = Math.abs(d.vx); } else if (d.x > r) { d.x = r; d.vx = -Math.abs(d.vx); }
      if (d.y < top) { d.y = top; d.vy = Math.abs(d.vy); } else if (d.y > h - BOTTOM) { d.y = h - BOTTOM; d.vy = -Math.abs(d.vy); }
    };
    // a dot picked up goes where the finger is, kept in its column
    put.current = (i, px, py) => { const d = ds[i], r = el.getBoundingClientRect(); d.x = px - r.left; d.y = py - r.top; keep(d); if (still) place(); };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ds.forEach((d, i) => { if (i === grabbed.current) return; const k = i === held.current ? SLOW : 1; d.x += d.vx * dt * k; d.y += d.vy * dt * k; });
      // too close: each nudges the other away, a little each frame (one picked up stays put: the other
      // moves the whole way)
      for (let i = 0; i < ds.length; i += 1) for (let j = i + 1; j < ds.length; j += 1) {
        const a = ds[i], b = ds[j], dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 0.01;
        if (dist < APART) {
          const push = ((APART - dist) / APART) * 60 * dt, ux = dx / dist, uy = dy / dist;
          const ga = i === grabbed.current, gb = j === grabbed.current;
          if (!ga) { a.x -= ux * push * (gb ? 2 : 1); a.y -= uy * push * (gb ? 2 : 1); }
          if (!gb) { b.x += ux * push * (ga ? 2 : 1); b.y += uy * push * (ga ? 2 : 1); }
        }
      }
      ds.forEach(keep);
      place();
      if (!still) raf = requestAnimationFrame(tick);
    };
    place();
    if (!still) raf = requestAnimationFrame(tick);
    // the box resized: keep every dot in its column
    const ro = new ResizeObserver(() => {
      const ow = w, oh = h; w = el.clientWidth; h = el.clientHeight; size();
      if (ow && oh) ds.forEach((d) => { d.x = (d.x / ow) * w; d.y = (d.y / oh) * h; keep(d); });
      place();
    });
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); put.current = null; };
  }, [projects, kinds]);

  // a press on a dot: held long enough (or moved), it picks the dot up and shows its name; let go, the
  // dot stays where it was dropped. A short still press is a tap, and the click opens the project
  const take = (i, dot) => { press.current.dragged = true; grabbed.current = i; dot.classList.add('is-held'); track('work_dot', { project: projects[i].name, kind: projects[i].kind, action: 'hold' }); };
  const down = (i) => (e) => {
    const p = press.current;
    clearTimeout(p.timer);
    p.i = i; p.dragged = false; p.x = e.clientX; p.y = e.clientY; held.current = i;
    e.currentTarget.setPointerCapture(e.pointerId);
    const dot = e.currentTarget;
    p.timer = setTimeout(() => { if (p.i === i) take(i, dot); }, HOLD);
  };
  const move = (i) => (e) => {
    const p = press.current;
    if (p.i !== i) return;
    if (!p.dragged && Math.hypot(e.clientX - p.x, e.clientY - p.y) > WOBBLE) { clearTimeout(p.timer); take(i, e.currentTarget); }
    if (p.dragged && put.current) put.current(i, e.clientX, e.clientY);
  };
  const up = (i) => (e) => {
    const p = press.current;
    if (p.i !== i) return;
    clearTimeout(p.timer); p.i = -1; grabbed.current = -1;
    e.currentTarget.classList.remove('is-held');
    if (e.pointerType !== 'mouse') held.current = -1;
  };

  return (
    <div className="wrk">
      <div ref={field} className="wrk-field" onPointerLeave={() => { held.current = -1; }}>
        {/* the columns: a kind's name at the top of each, dotted lines between them */}
        <div className="wrk-cols" aria-hidden="true">
          {kinds.map((k) => <div key={k.kind} className="wrk-col" style={{ '--kind': k.color }}><span className="wrk-col-name">{k.kind}</span></div>)}
        </div>
        {projects.map((p, i) => (
          <a key={p.name} ref={(d) => { dots.current[i] = d; }} className="wrk-dot" href={`#${p.name}`} aria-label={`${p.name} (${p.kind})`}
             style={{ '--kind': kinds.find((k) => k.kind === p.kind)?.color }}
             onPointerEnter={() => { held.current = i; }} onPointerLeave={() => { if (press.current.i !== i) held.current = -1; }}
             onPointerDown={down(i)} onPointerMove={move(i)} onPointerUp={up(i)} onPointerCancel={up(i)}
             draggable={false} onDragStart={(e) => e.preventDefault()}   /* a link drags natively, and that would cancel the pick-up */
             onClick={(e) => { e.preventDefault(); if (press.current.dragged) return; track('work_dot', { project: p.name, kind: p.kind, action: 'open' }); onGo(p.name); }}>
            {/* its name, written on the page beside the dot when pointed at */}
            <span className="wrk-tip" aria-hidden="true" style={{ '--n': p.name.length }}><span className="wrk-tip-line" /><span className="wrk-tip-text">{p.name}</span></span>
          </a>
        ))}
      </div>
      <p className="wrk-hint">each dot is a project. tap one, or hold one to see its name.</p>
    </div>
  );
}
