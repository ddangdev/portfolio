/* ddanghnl-site: the services as an orbit, instead of a list (owner's pick, 2026-11-01, over a drift of
   discs): the services circling an empty middle as discs (the red core came off, owner's call 2026-11-02), each on the ring its catalog
   entry names (owner's call, 2026-11-02: branding, websites and social media nearest, local visibility and
   custom video on the middle ring, ai tools on the outer). Its parts - its packages - are named under
   the field once the service is chosen; the small dots that stood for them on the ring came off (owner's
   call, 2026-11-02: just the big ones). A ring's discs go round together, each ring at its own pace, the
   inner ones quicker; a ring is as wide as its discs need, and the rest of the room is shared out. Where a screen has no room for that (a phone, a short laptop), the services share
   whatever rings fit. Pointing at a disc slows its ring right down; choosing a service brings its
   line (and a price, if it has one) up beside the field, and it carries on round (owner's call,
   2026-11-02). The rings can be spun, one at a time: dragging on the field (a finger, a mouse) turns
   the ring nearest where the drag began with the pointer, round the middle, and a flick sends it on
   with the momentum, slowing back to its own pace (owner's calls, 2026-11-02). Positions are set on the
   discs directly, every frame; React only knows which is chosen. Reduced motion: the discs stand still,
   but a drag still turns them (without the momentum).
   Rendered by PageDialog.jsx. */

import { useLayoutEffect, useRef, useState } from 'react';
import { track } from '../measure/measure.js';

const TAU = Math.PI * 2;
// a ring's lap, in seconds, by its place out from the core: the inner ones quicker
const LAPS = [38, 58, 84, 110];
// the room between one ring's discs and the next ring's, when one passes the other
const GAP = 8;
// the room between discs along a ring
const ALONG = 10;
// how much of its pace a ring keeps while a disc on it is pointed at: slow motion, not a stop
const SLOW = 0.12;
// a spin's momentum, after a flick: the seconds it takes to lose most of it, and the pace (radians a
// second) under which it is gone; a drag shorter than DRAG px is a tap, and picks a disc
const COAST = 0.7;
const DONE = 0.02;
const DRAG = 6;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ServiceField({ services }) {
  const field = useRef(null);
  const discs = useRef([]);     // the services' discs
  const rings = useRef([]);
  const [chosen, setChosen] = useState(null);
  const chosenRef = useRef(null);
  chosenRef.current = chosen;
  const held = useRef(-1);      // the service the pointer is over: its ring slows
  // the wheel being spun by hand: whether a drag is on, the angle the pointer was last at, how far it
  // has gone (a tap, or a drag), and the pace it was flicked at
  const spin = useRef({ on: false, ring: 0, a: 0, x: 0, y: 0, moved: false, vel: 0, at: 0 });
  const turn = useRef(null);    // turns a ring by an angle (set up with the field)
  const ringAt = useRef(null);  // the ring nearest a distance from the middle

  useLayoutEffect(() => {
    const el = field.current;
    const n = services.length;
    const still = reduced();
    // each ring: its radius, and the discs on it in order with each one's angle round the ring
    let raf = 0, last = performance.now(), w = 0, h = 0, laid = [], ang = [], ringOf = [];
    const place = (d, x, y, k) => { d.style.transform = `translate(${(x - d.offsetWidth / 2).toFixed(1)}px, ${(y - d.offsetHeight / 2).toFixed(1)}px) scale(${k})`; };
    const layout = () => {
      // the field no taller than it is wide: the orbit is round, and the words sit beside it
      el.style.height = '';
      const tall = el.clientHeight;
      if (el.clientWidth < tall) el.style.height = `${el.clientWidth}px`;
      w = el.clientWidth; h = el.clientHeight;
      const disc = discs.current[0]?.offsetWidth || 60, edge = parseFloat(getComputedStyle(el).getPropertyValue('--edge')) || 10;
      const room = Math.min(w, h) / 2 - disc / 2 - edge, step = disc + GAP;
      const was = laid.length;
      // as the catalog lays them out: a ring at least as wide as its discs need along it, and a disc and a
      // gap out from the ring before, so no two ever touch; then the room left is shared out between them
      const count = Math.max(...services.map((s) => s.ring)) + 1;
      let rs = Array.from({ length: count }, (_, k) => {
        const items = [];
        services.forEach((s, i) => { if (s.ring === k) items.push({ el: discs.current[i], i }); });
        const along = items.reduce((sum, it) => sum + it.el.offsetWidth + ALONG, 0);
        return { items, need: along / TAU };
      });
      rs.forEach((r, k) => { r.r = Math.max(r.need, disc, k ? rs[k - 1].r + step : 0); });
      let rich = rs[count - 1].r <= room;
      if (rich) {
        const spare = room - rs[count - 1].r;
        rs.forEach((r, k) => { r.r += count > 1 ? (spare * k) / (count - 1) : spare; });
      } else {
        // no room for that: the services alone, on as many rings as fit, sharing them in turn
        let k = Math.min(n, LAPS.length);
        while (k > 1 && room - (k - 1) * step < disc * 0.85) k -= 1;
        rs = Array.from({ length: k }, (_, j) => ({ r: room - (k - 1 - j) * step, items: [] }));
        services.forEach((s, i) => rs[i % k].items.push({ el: discs.current[i], i }));
      }
      el.classList.toggle('is-shared', !rich);
      // each disc's place round its ring: the services spread evenly round it
      rs.forEach((r) => { r.items.forEach((it, g) => { it.a = (g / r.items.length) * TAU; }); });
      laid = rs;
      ringOf = [];
      laid.forEach((r, k) => r.items.forEach((it) => { ringOf[it.i] = k; }));
      rings.current.forEach((rg, k) => { if (rg) { rg.style.display = laid[k] ? '' : 'none'; rg.style.width = rg.style.height = `${(2 * (laid[k]?.r || 0)).toFixed(1)}px`; } });
      if (laid.length !== was) ang = laid.map((_, k) => -TAU / 4 + k * 0.9);   // each ring a little turned from the last
    };
    layout();
    turn.current = (k, da) => { if (ang[k] !== undefined) ang[k] += da; };
    ringAt.current = (dist) => laid.reduce((best, r, k) => (Math.abs(r.r - dist) < Math.abs(laid[best].r - dist) ? k : best), 0);
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      // the ring of the disc pointed at goes to slow motion; a chosen one keeps turning (owner's calls,
      // 2026-11-02). A ring held by hand goes only where the hand takes it; flicked, it coasts
      const slow = held.current < 0 ? -1 : ringOf[held.current];
      const sp = spin.current;
      if (!sp.on && sp.vel) { sp.vel *= Math.exp(-dt / COAST); if (Math.abs(sp.vel) < DONE) sp.vel = 0; }
      laid.forEach((r, k) => {
        const byHand = k === sp.ring;
        if (!still && !(sp.on && byHand)) ang[k] += (TAU / LAPS[k % LAPS.length]) * dt * (k === slow ? SLOW : 1) + (byHand ? sp.vel * dt : 0);
        r.items.forEach((it) => {
          const a = ang[k] + it.a;
          place(it.el, w / 2 + r.r * Math.cos(a), h / 2 + r.r * Math.sin(a), chosenRef.current === it.i ? 1.12 : 1);
        });
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); turn.current = null; ringAt.current = null; };
  }, [services]);

  // spinning by hand: the ring nearest the press, and the angle of the pointer round the field's
  // middle - the ring turned by as much as it moves; let go, the last pace carries on as momentum
  const angleAt = (e) => { const r = field.current.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2); };
  const distAt = (e) => { const r = field.current.getBoundingClientRect(); return Math.hypot(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2); };
  const spinDown = (e) => {
    if (e.button) return;
    const sp = spin.current;
    sp.on = true; sp.moved = false; sp.vel = 0; sp.ring = ringAt.current?.(distAt(e)) ?? 0;
    sp.a = angleAt(e); sp.x = e.clientX; sp.y = e.clientY; sp.at = performance.now();
  };
  const spinMove = (e) => {
    const sp = spin.current;
    if (!sp.on) return;
    // a drag, once it has gone far enough (a tap on a disc keeps its click: the pointer is only taken
    // over from here, since taking it on the press would send the click to the field instead)
    if (!sp.moved && Math.hypot(e.clientX - sp.x, e.clientY - sp.y) > DRAG) {
      sp.moved = true; sp.a = angleAt(e); sp.at = performance.now();
      field.current.setPointerCapture(e.pointerId); field.current.classList.add('is-spinning');
      track('services_spin', { ring: sp.ring + 1 });
    }
    if (!sp.moved) return;
    const a = angleAt(e), now = performance.now();
    let da = a - sp.a;
    if (da > Math.PI) da -= TAU; else if (da < -Math.PI) da += TAU;
    const dt = Math.max(0.001, (now - sp.at) / 1000);
    sp.vel = sp.vel * 0.6 + (da / dt) * 0.4;
    sp.a = a; sp.at = now;
    turn.current?.(sp.ring, da);
  };
  const spinUp = () => {
    const sp = spin.current;
    if (!sp.on) return;
    sp.on = false;
    // a flick held still for a moment before letting go carries nothing
    if (performance.now() - sp.at > 120 || reduced()) sp.vel = 0;
    field.current.classList.remove('is-spinning');
  };

  const pick = (i) => {
    if (spin.current.moved) return;
    const on = chosen !== i;
    track('service_pick', { service: services[i].service, on });
    setChosen(on ? i : null);
  };
  const s = chosen !== null ? services[chosen] : null;
  const holdOn = (i) => ({ onPointerEnter: () => { held.current = i; }, onPointerLeave: () => { held.current = -1; } });
  const count = Math.max(...services.map((sv) => sv.ring), services.length - 1) + 1;

  return (
    <div className="svc">
      <div ref={field} className="svc-field" onPointerLeave={() => { held.current = -1; }}
           onPointerDown={spinDown} onPointerMove={spinMove} onPointerUp={spinUp} onPointerCancel={spinUp}>
        {Array.from({ length: count }, (_, i) => <span key={i} ref={(r) => { rings.current[i] = r; }} className="svc-ring" aria-hidden="true" />)}
        {services.map((sv, i) => (
          <button key={sv.service} ref={(el) => { discs.current[i] = el; }} type="button"
                  className={`svc-disc${chosen === i ? ' is-chosen' : ''}`} aria-pressed={chosen === i} {...holdOn(i)}
                  onClick={() => pick(i)}>{sv.service}</button>
        ))}
      </div>
      {/* beside the field (under it on a phone): the chosen service's line and price, then its packages
          named; a hint before one is chosen */}
      <div className={`svc-line${s ? ' is-on' : ''}`} aria-live="polite">
        <p className="svc-line-p">{s ? <><b>{s.service}</b>{s.p}{s.price && <> <span className="svc-price">{s.price}</span></>}</> : 'tap a service'}</p>
        {s?.parts?.length > 0 && (
          <ul className="svc-packs">{s.parts.map((part) => <li key={part}>{part}</li>)}</ul>
        )}
      </div>
    </div>
  );
}
