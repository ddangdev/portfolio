/* ddanghnl-site: the walls. The dial's spokes - the ticks with a post on them - stand up off the floor
   as solid slabs when the dial turns - taller the faster - and sink back flat when it stops, with a
   faint ripple while it rests (owner's pick, 2026-11-01: "react", of three tried; solid, no outlines;
   then the spokes alone, the bands staying flat). Drawn in screen space over the floor, every
   frame, only the spokes in view. The one on the selector is the selector's red, never white over it
   (owner's report) - so a wall passing it lights up red as it goes. It is the tick itself that rises
   (owner's call, 2026-11-02): the tick's line rides on top of the slab, the slab is its side showing
   underneath, and the slab is solid and reaches a hair below the floor, so no line is left lying there
   under it. Off with reduced motion. */

import { useEffect, useRef } from 'react';

const ISO = 0.57735;
const ISO_TURN = 45;
// how tall a wall may stand, against the dial's radius
const HEIGHT = 0.032;
// how far below the floor a slab reaches, in px: well over the tick's line lying there (1.8px wide, and a pixel or so off the slab's own floor line, drawn through a different transform)
const UNDER = 3;

// a wall's height, against the tallest: the turn's speed, and a ripple underneath at rest
const heightFor = (t, psi, level) => level + 0.12 * (0.5 + 0.5 * Math.sin(psi * 8 - t * 1.3));

export default function Walls({ ticks, rot, frame, select }) {
  const faces = useRef(null), onSelector = useRef(null), tops = useRef(null), topOnSelector = useRef(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0, last = rot.current, lastT = performance.now(), level = 0;
    const start = performance.now();
    const draw = (now) => {
      const f = frame.current, t = (now - start) / 1000;
      const dt = Math.max(1, now - lastT) / 16.7;
      // the turn's speed, smoothed: quick to rise, slow to sink
      const speed = Math.min(1, Math.abs(rot.current - last) / dt / 2.2);
      level += (speed - level) * (speed > level ? 0.3 : 0.05);
      last = rot.current; lastT = now;
      const W = innerWidth, Hh = innerHeight, H = HEIGHT * f.R, theta = rot.current + ISO_TURN;
      const out = [], lit = [], edge = [], litEdge = [];
      for (const tk of ticks) {
        const psiDeg = tk.phi + theta, psi = (psiDeg * Math.PI) / 180;
        const s = Math.sin(psi), c = Math.cos(psi);
        const x0 = f.cx + tk.r0 * f.R * s, y0 = f.cy - ISO * tk.r0 * f.R * c;
        const x1 = f.cx + tk.r1 * f.R * s, y1 = f.cy - ISO * tk.r1 * f.R * c;
        if ((x0 < -40 && x1 < -40) || (x0 > W + 40 && x1 > W + 40) || (y0 > Hh + 40 && y1 > Hh + 40) || (y0 < -80 && y1 < -80)) continue;
        const h = H * heightFor(t, psi, level);
        if (h < 0.4) continue;
        // on the selector: within a hair of its angle
        const on = Math.abs((((psiDeg - select) % 360) + 540) % 360 - 180) < 0.75;
        const top = `M${x0.toFixed(1)} ${(y0 - h).toFixed(1)}L${x1.toFixed(1)} ${(y1 - h).toFixed(1)}`;
        (on ? lit : out).push(`M${x0.toFixed(1)} ${(y0 + UNDER).toFixed(1)}L${x1.toFixed(1)} ${(y1 + UNDER).toFixed(1)}L${x1.toFixed(1)} ${(y1 - h).toFixed(1)}L${x0.toFixed(1)} ${(y0 - h).toFixed(1)}Z`);
        (on ? litEdge : edge).push(top);
      }
      faces.current.setAttribute('d', out.join(''));
      onSelector.current.setAttribute('d', lit.join(''));
      tops.current.setAttribute('d', edge.join(''));
      topOnSelector.current.setAttribute('d', litEdge.join(''));
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [ticks, select]);

  return (
    <g className="wheel-walls" aria-hidden="true">
      <path ref={faces} className="wheel-wall-face" />
      <path ref={onSelector} className="wheel-wall-face is-selected" />
      {/* the ticks themselves, riding on top */}
      <path ref={tops} className="wheel-wall-top" />
      <path ref={topOnSelector} className="wheel-wall-top is-selected" />
    </g>
  );
}
