/* hanging-book: the coffee cup. In place of the bean (owner's call, 2026-10-31), a flat brown silhouette
   of a coffee cup, and letters of "coffee" pour into it: drifting slowly up, swaying side to side, turning lazily, and fading.

   Sections:
     1  the cup        size, colours, place
     2  the letters    which, how often, how they rise
     3  drawing        the hand-drawn wobble, the shadow, the cup, the letters
     4  loop
   index.html loads this by default; ?subject=bean for the bean, ?subject=book for the book. */

/* ---------- 1. the cup ---------- */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The colours, from palettes.js: the one chosen there, or another for a look with ?palette=<name>
import { PALETTE } from './palettes.js';
const C = {
  cup: PALETTE.cup,
  steel: PALETTE.pitcher,
  coffee: PALETTE.coffee,
  podTop: PALETTE.podTop, podLeft: PALETTE.podLeft, podRight: PALETTE.podRight,
  milk: PALETTE.letters,
  cream: PALETTE.milk || PALETTE.letters,   // the milk in the pitcher: its own colour if the palette gives one
  letter: PALETTE.cup,
  shadowRGB: PALETTE.shadowRGB,
  // the pitcher's lip and inside: set outright by a palette that wants no in-between shades, else derived
  lip: PALETTE.pitcherLip, inside: PALETTE.pitcherInside,
};

const TABLE_IN = 1.6;   // the cup stands this far in from the table's left edge (the table: section 3)

const canvas = document.getElementById('book');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1, U = 1, CX = 0, CY = 0, shadowSprite = null, pitcherShadow = null, tableDirty = true;
const glyphCache = new Map();

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  // the cup's half-width at the rim; on a wide screen a little smaller, so the pitcher held high above it
  // keeps a margin from the top of the page (owner's call)
  U = (W > H ? H * 0.1 : Math.min(W, H) * 0.12) * DPR;
  // The table's left edge sits a little left of the page's middle, and the cup stands just in from it
  // (owner's call): the left of the page open, the table running off to the right
  CX = (W * 0.44) * DPR + (TABLE_IN * U);
  CY = (H * (W > H ? 0.38 : 0.4)) * DPR;          // the rim's centre: the pour above; the cup, table and "say stop" below
  shadowSprite = null; pitcherShadow = null; glyphCache.clear();
  tableDirty = true;   // the statement's table line, set on the next frame (the cup's sizes come later)
}
addEventListener('resize', resize);
resize();

// a point in the cup's own units (x across, y down, 1 = the rim's half-width; 0,0 the rim's centre)
const at = (x, y) => [CX + x * U, CY + y * U];

/* ---------- 2. the letters ---------- */

// the letters of "coffee" (owner's call, 2026-10-31; tried as the kanji 珈琲 on 2026-11-01 and changed
// back), picked at random - so f and e twice as often as c and o
const LETTERS = [...'coffee'];
const RATE = 2.6;                 // letters a second
const STEAM = false;              // letters rising out of the cup like steam: off
const LIFE = [7, 11];             // seconds before a letter has faded away
const SIZES = [13, 15, 17, 20];   // CSS pixels
const RISE = [22, 38];            // CSS px a second, upward
const letters = [];
let owed = 0;

function spawnLetter() {
  // from the far side of the coffee's surface, clear of the pour coming in on the near side
  const [x, y] = at(0.2 + Math.random() * 0.55, -0.02);
  letters.push({
    ch: LETTERS[Math.floor(Math.random() * LETTERS.length)],
    x, y,
    vy: -(RISE[0] + Math.random() * (RISE[1] - RISE[0])) * DPR,
    // a steam sway: side to side on its own slow beat, wider as it rises
    sway: (10 + Math.random() * 18) * DPR, beat: 0.6 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2,
    drift: (2 + Math.random() * 8) * DPR,   // drifting a little away from the pitcher
    rot: (Math.random() - 0.5) * 0.8, spin: (Math.random() - 0.5) * 0.6,
    size: SIZES[Math.floor(Math.random() * SIZES.length)],
    age: 0, life: LIFE[0] + Math.random() * (LIFE[1] - LIFE[0]),
  });
}

function stepLetters(dt) {
  if (!reduceMotion) {
    // no steam now: the letters only go into the cup (owner's call - rising out of it read as bouncing out)
    if (STEAM) { owed += RATE * dt; while (owed >= 1) { spawnLetter(); owed -= 1; } }
  }
  for (const l of letters) {
    l.age += dt;
    l.vy *= 1 - 0.06 * dt;            // easing as it climbs
    l.y += l.vy * dt;
    l.x += l.drift * dt;
    l.rot += l.spin * dt;
  }
  let keep = 0;
  for (const l of letters) if (l.age < l.life && l.y > -60) letters[keep++] = l;
  letters.length = keep;
}

/* ---------- 3. drawing ---------- */

// the hand-drawn wobble: edges cut into short steps, each nudged by a fixed smooth field over the screen
function nudge(x, y) {
  const a = 1.3 * DPR, u = x / DPR, v = y / DPR;
  return [
    x + a * (Math.sin(v * 0.021 + u * 0.007) + 0.6 * Math.sin(v * 0.053 - u * 0.017 + 1.3)),
    y + a * (Math.sin(u * 0.019 - v * 0.009 + 2.1) + 0.6 * Math.sin(u * 0.047 + v * 0.021)),
  ];
}
function wobbly(points) {
  const step = 9 * DPR, n = points.length;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[(i + 1) % n];
    const k = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let j = i === 0 ? 0 : 1; j <= k; j++) {
      const [x, y] = nudge(x0 + ((x1 - x0) * j) / k, y0 + ((y1 - y0) * j) / k);
      if (i === 0 && j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

// a smooth closed curve through some points (Catmull-Rom), in the cup's units, onto the screen
function smooth(pts, per = 8) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push(at(f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])));
    }
  }
  return out;
}

// The handle (owner's call: more work on it): an ear that leaves the cup just under the rim, swells out
// and round, and tucks back in lower down - thicker at the top, as real handles are - with a hole that
// follows its shape. The outer line runs on inside the bowl, which covers the joins.
// A latte cup (owner's call, 2026-10-31, after a tall mug): a wide rim and a round bowl curving in to a
// small foot, a small ear of a handle near the top. RIM is the rim's half-width; the bowl's half-width at
// depth h (0 at the rim, 1 at the bowl's bottom) is bowlW(h); the foot is a short ring under it.
const RIM = 1.25, BOWL_D = 0.9, FOOT_W = 0.46, MUG_H = 1.0;   // MUG_H: rim to the foot's base
const bowlW = (h) => FOOT_W + (RIM - FOOT_W) * Math.sqrt(Math.max(0, 1 - h ** 2.2));
const BOWL = Array.from({ length: 15 }, (_, i) => { const h = i / 14; return [bowlW(h), h * BOWL_D]; });
const HANDLE = [[1.1, 0.08], [1.36, 0.06], [1.58, 0.16], [1.62, 0.32], [1.5, 0.47], [1.28, 0.56], [1.08, 0.55], [1.02, 0.4]];
const HOLE = [[1.28, 0.18], [1.42, 0.2], [1.47, 0.3], [1.4, 0.4], [1.28, 0.43], [1.22, 0.31]];

// The milk pitcher (owner's call, 2026-10-31, after a photo of a steel frothing jug): beside the cup, its
// body straight and a little narrowing from the rim, then swelling to a round belly; a pointed spout at the
// rim on the left; a squared handle on the right. Steel grey, one flat colour like the cup. In the cup's units, about its own middle, then placed by PITCHER.
// Now pouring (owner's call, 2026-10-31): turned to face the cup and tipped, held up so its spout is over
// the coffee, a stream of white letters running out of it into the cup.
const PITCHER = { scale: 0.9, tilt: (56 * Math.PI) / 180, spout: [-0.48, -1.6] };   // held high: a long pour (owner's call)   // spout: where its tip is, in the cup's units
const P_BODY = [[-1.0, -0.98], [-0.66, -0.83], [0, -0.86], [0.6, -0.88], [0.58, -0.4], [0.62, 0.02], [0.86, 0.38],
  // the base rounds out (owner's call): tipped toward us, the jug's round bottom shows as a full curve
  [0.93, 0.7], [0.82, 1.0], [0.48, 1.2], [0, 1.27], [-0.48, 1.2], [-0.82, 1.0], [-0.93, 0.7],
  [-0.86, 0.38], [-0.62, 0.02], [-0.6, -0.45], [-0.72, -0.7]];
const P_HANDLE = [[0.5, -0.8], [0.9, -0.81], [1.18, -0.8], [1.22, -0.68], [1.21, -0.2], [1.17, 0.08], [0.98, 0.3], [0.7, 0.44], [0.5, 0.2]];
const P_HOLE = [[0.68, -0.64], [1.04, -0.64], [1.05, -0.2], [1.0, 0.06], [0.88, 0.18], [0.8, 0.2], [0.68, -0.2]];
// the pitcher's own units -> the cup's: mirrored (spout to the right, toward the cup), scaled, tipped,
// then moved so the spout's tip lands at PITCHER.spout
function turnP([x, y]) {
  const mx = -x * PITCHER.scale, my = y * PITCHER.scale, c = Math.cos(PITCHER.tilt), n = Math.sin(PITCHER.tilt);
  return [mx * c - my * n, mx * n + my * c];
}
const SPOUT_TIP = P_BODY[0];
const P_OFF = (() => { const t = turnP(SPOUT_TIP); return [PITCHER.spout[0] - t[0], PITCHER.spout[1] - t[1]]; })();
const pAt = (p) => { const t = turnP(p); return [t[0] + P_OFF[0], t[1] + P_OFF[1]]; };
// the way the milk leaves the spout: along the spout's lip, outward
const POUR_DIR = (() => { const a = turnP(P_BODY[1]), b = turnP(SPOUT_TIP); const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; })();

const arc = (cx, cy, rx, ry, a0, a1, n = 24) =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return at(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); });

function drawPitcher() {
  const fill = (pts, colour) => { ctx.beginPath(); wobbly(pts); ctx.fillStyle = colour; ctx.fill(); };
  // its shadow
  // held up in the air: its shadow falls on the table well to the right of it, faint and soft
  if (!pitcherShadow) pitcherShadow = shadowBlob(U * 0.9, U * 0.16, 20 * DPR, 0.09, SHADOW_TILT);
  const [px] = at(...pAt([0, 0])), [, ty] = at(0, MUG_H + 0.1);
  stamp(pitcherShadow, px + U * 1.3, ty);
  // handle and body, one flat colour, no streak (owner's calls)
  const handle = smooth(P_HANDLE.map(pAt)), body = smooth(P_BODY.map(pAt));
  fill(handle, C.steel);
  fill(body, C.steel);
  // the same stipple as the cup, a little lighter, so both are lit from the upper left (owner's call); the
  // hole is cut through it below, and the mouth and milk are drawn clean over it
  const st = pitcherStipple(handle, body);
  ctx.save(); ctx.beginPath(); wobbly(handle); wobbly(body); ctx.clip();
  ctx.drawImage(st.c, st.x, st.y);
  ctx.restore();
  // the handle's hole, cut through to the paper
  ctx.globalCompositeOperation = 'destination-out';
  fill(smooth(P_HOLE.map(pAt)), '#000');
  ctx.globalCompositeOperation = 'source-over';
  drawPitcherMouth();
}

// The pitcher's mouth (owner's call, 2026-10-31): drawn as if it tips toward us, so we look down into it - a
// rim round the opening, the inside of the jug, and the milk pooled in it, lying level toward the spout. In the pitcher's own units the opening is an
// ellipse across its top.
const MOUTH = { cx: -0.03, cy: -0.87, rx: 0.66, ry: 0.34, lip: 0.05 };
const mouthPts = (inset, n = 40) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return at(...pAt([MOUTH.cx + (MOUTH.rx - inset) * Math.cos(a), MOUTH.cy + (MOUTH.ry - inset * 0.4) * Math.sin(a)]));
});
// a colour a little lighter or darker than another
function tint(hex, f) {
  const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return `rgb(${c.map((v) => Math.round(f > 0 ? v + (255 - v) * f : v * (1 + f))).join(',')})`;
}

// the convex hull of some screen points (monotone chain), in order round it
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length > 1 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

// the two points of a hull either side of a given vertex: [upper, lower] on screen
function besides(H, v) {
  const i = H.indexOf(v), a = H[(i + 1) % H.length], b = H[(i - 1 + H.length) % H.length];
  return a[1] < b[1] ? [a, b] : [b, a];
}
// a gently curved edge from p to q, bowed toward the point `toward` by f of its length (owner's call: the
// spout's lip should curve naturally, not run straight)
function bow(p, q, toward, f, n = 10) {
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, L = Math.hypot(q[0] - p[0], q[1] - p[1]);
  let dx = toward[0] - mx, dy = toward[1] - my; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  const c = [mx + dx * L * f, my + dy * L * f];
  return Array.from({ length: n + 1 }, (_, k) => {
    const t = k / n, u = 1 - t;
    return [u * u * p[0] + 2 * u * t * c[0] + t * t * q[0], u * u * p[1] + 2 * u * t * c[1] + t * t * q[1]];
  });
}

function drawPitcherMouth() {
  const fill = (pts, colour) => { ctx.beginPath(); wobbly(pts); ctx.fillStyle = colour; ctx.fill(); };
  const rim = mouthPts(0), inner = mouthPts(MOUTH.lip);
  const tip = at(...pAt(P_BODY[0]));         // the spout's tip
  const mid = at(...pAt([MOUTH.cx, MOUTH.cy]));   // the mouth's middle
  // the spout's neck: the body filled out from the mouth to the tip, its upper lip a soft curve that flares
  // up into the tip rather than a straight line
  const H = hull([...rim, tip]), [up, low] = besides(H, tip);
  fill([...bow(up, tip, mid, 0.18), low, mid], C.steel);
  // the opening in two colours only (owner's call): no lighter lip and no shading - the body's own green
  // round the rim, one flat shade inside, and the milk
  fill(rim, C.steel);
  fill(inner, C.inside || tint(C.steel, -0.45));
  // the milk: level in the world, so a band across the opening on the spout's (lower) side - no letters in
  // it (owner's call)
  const ys = inner.map((q) => q[1]), top = Math.min(...ys), bot = Math.max(...ys);
  const line = top + (bot - top) * 0.7;    // where the surface meets the far side: low in the opening (owner's sketch)
  // the milk's surface (owner's sketch): nearly level across the opening, easing down as it nears the spout
  // side, where it runs on over the lip to the tip
  const xs = inner.map((q) => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), w = x1 - x0;
  // one smooth sweep from the far side of the opening to the spout's tip (owner's sketch): nearly flat
  // most of the way across, curving down only as it reaches the spout - no corner where it meets it
  const p1 = [x0, line], ctrl = [x0 + w * 0.85, line + (tip[1] - line) * 0.06];
  const surface = Array.from({ length: 20 }, (_, k) => {
    const t = k / 19, u = 1 - t;
    return [u * u * p1[0] + 2 * u * t * ctrl[0] + t * t * tip[0], u * u * p1[1] + 2 * u * t * ctrl[1] + t * t * tip[1]];
  });
  ctx.save();
  ctx.beginPath();
  [[x0 - 30, line], ...surface, [tip[0], Math.max(bot, tip[1]) + 200], [x0 - 30, Math.max(bot, tip[1]) + 200]]
    .forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath(); ctx.clip();
  // under that line: the pool inside the opening, and the run of milk out over the lip to the tip
  fill(inner, C.cream);
  fill(hull([...inner, tip]), C.cream);
  ctx.restore();
}

// Shadows (owner's call: work on their angle): the light comes from the upper left, so each thing casts
// a long soft shadow off to the right along the table, slightly tilted, and sits on a small dark contact
// shadow at its foot. Each is blurred once into a canvas of its own and stamped.
function shadowBlob(rx, ry, blur, alpha, tilt = 0) {
  const pad = blur * 2.5;
  const c = document.createElement('canvas');
  const half = Math.max(rx, ry) + pad;
  c.width = Math.ceil(2 * half); c.height = Math.ceil(2 * (ry + Math.abs(Math.sin(tilt)) * rx + pad));
  const g = c.getContext('2d');
  g.filter = `blur(${blur}px)`;
  g.beginPath(); g.ellipse(c.width / 2, c.height / 2, rx, ry, tilt, 0, Math.PI * 2);
  g.fillStyle = `rgba(${C.shadowRGB}, ${alpha})`; g.fill();
  return c;
}
const stamp = (c, x, y) => ctx.drawImage(c, x - c.width / 2, y - c.height / 2);
const SHADOW_TILT = (-7 * Math.PI) / 180;

function drawShadowSprites() {
  shadowSprite = {
      cast: shadowBlob(U * 1.2, U * 0.2, 14 * DPR, 0.17, SHADOW_TILT),
      contact: shadowBlob(U * FOOT_W * 1.1, U * 0.07, 5 * DPR, 0.32),
      floor: shadowBlob(U * TABLE_R * 0.9, U * 0.3, 26 * DPR, 0.16, SHADOW_TILT),
      foot: shadowBlob(U * 0.95, U * 0.11, 6 * DPR, 0.3),
  };
}
function drawShadow() {
  if (!shadowSprite) drawShadowSprites();
  // the cup's shadows fall only on what it stands on: clipped to the podium's top, so none spills over its
  // front edge onto the faces below, which made the cup look as if it were hovering (owner's report)
  const [cx, cy] = at(0.75, MUG_H + 0.06), [fx, fy] = at(0, MUG_H + 0.01);
  ctx.save(); ctx.beginPath(); tableTopPath(); ctx.clip();
  stamp(shadowSprite.cast, cx, cy);       // cast off to the right across the podium's top
  stamp(shadowSprite.contact, fx, fy);    // under the foot
  ctx.restore();
}
function tableTopPath() {
  const [x, y] = at(TABLE_CX, MUG_H + GROUND * TABLE_CZ);
  ctx.ellipse(x, y, TABLE_R * U, TABLE_R * GROUND * U, 0, 0, Math.PI * 2);
}

// the table: its stem, down off the page, then its thin edge and its top
function drawTable() {
  const fill = (pts, colour) => { ctx.beginPath(); wobbly(pts); ctx.fillStyle = colour; ctx.fill(); };
  const ring = (cx, cz, r, drop, n = 72) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2; return at(cx + r * Math.cos(a), MUG_H + GROUND * (cz + r * Math.sin(a)) + drop);
  });
  // the slim stem, running all the way down off the bottom of the page (owner's call) - no foot or floor
  // in view
  const w = 0.09, top = MUG_H + GROUND * TABLE_CZ + TABLE_T, bot = screenBottom() + 0.5;
  fill([at(TABLE_CX - w, top), at(TABLE_CX + w, top), at(TABLE_CX + w * 1.15, bot), at(TABLE_CX - w * 1.15, bot)], C.podLeft);
  // the edge: the top's outline dropped by its thickness, under the top
  fill(ring(TABLE_CX, TABLE_CZ, TABLE_R, TABLE_T), C.podRight);
  fill(ring(TABLE_CX, TABLE_CZ, TABLE_R, 0), C.podTop);
}

// The cup as a silhouette, one flat brown shape like the bean: a bowl that narrows to its foot, and an
// ear-shaped handle with its hole cut out.
function drawCup() {
  const fill = (pts, colour) => { ctx.beginPath(); wobbly(pts); ctx.fillStyle = colour; ctx.fill(); };
  // the bowl: along the rim's far edge left to right, down the side, round the foot, up the other side
  const bowl = [
    ...arc(0, 0, RIM, 0.17, Math.PI, Math.PI * 2, 24),
    ...BOWL.slice(1).map(([w, y]) => at(w, y)),
    at(FOOT_W - 0.02, MUG_H),
    ...arc(0, MUG_H, FOOT_W - 0.02, 0.06, 0, Math.PI, 12),
    at(-FOOT_W, BOWL_D),
    ...BOWL.slice(1, -1).reverse().map(([w, y]) => at(-w, y)),
  ], handle = smooth(HANDLE);
  fill(bowl, C.cup);
  // the handle; its hole is cut out below
  fill(handle, C.cup);
  // the stipple, kept to the bowl and handle
  const st = cupStipple();
  ctx.save(); ctx.beginPath(); wobbly(bowl); wobbly(handle); ctx.clip();
  ctx.drawImage(st.c, st.x, st.y);
  ctx.restore();
  // no saucer (owner's call)
  // the coffee's surface, a little darker, inside the rim
  fill(arc(0, 0.01, RIM - 0.12, 0.14, 0, Math.PI * 2, 36), C.coffee);
  // the handle's hole: cut through to the paper
  ctx.globalCompositeOperation = 'destination-out';
  fill(smooth(HOLE), '#000');
  ctx.globalCompositeOperation = 'source-over';
}

// Texture (owner's calls, 2026-11-01): stipple on the cup and the pitcher, picked over specks, marble veins,
// a print grain and a sheen - grainy shading, dense toward each one's lower right, away from the light,
// thinning to nothing on its lit side. The tabletop, coffee, stem, the pitcher's mouth and milk stay flat. Made once per size into a canvas of its
// own and stamped clipped to the cup.
const seeded = (seed) => () => {   // a small repeatable random (mulberry32), so the stipple never reshuffles
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rgbOf = (colour) => colour.startsWith('#')
  ? [1, 3, 5].map((i) => parseInt(colour.slice(i, i + 2), 16)) : colour.match(/\d+/g).slice(0, 3).map(Number);
// shade(u, v): how far into shadow a point is, 0..1, from its place across (u) and down (v) the box
function makeStipple(w, h, base, shade, seed) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
  const g = c.getContext('2d'), img = g.createImageData(c.width, c.height), d = img.data, rnd = seeded(seed);
  const dk = rgbOf(base).map((v) => v * 0.55);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
    if (rnd() >= shade(x / c.width, y / c.height) * 0.6) continue;
    const k = (y * c.width + x) * 4;
    d[k] = dk[0]; d[k + 1] = dk[1]; d[k + 2] = dk[2]; d[k + 3] = 0.75 * 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
const ramp = (t, from, to) => Math.min(1, Math.max(0, (t - from) / (to - from))) ** 1.6;
let stipple = null, stippleKey = '', pStipple = null, pStippleKey = '';
function pitcherStipple(handle, body) {
  const key = `${DPR}|${CX}|${CY}|${U}`;
  if (key !== pStippleKey) {
    pStippleKey = key;
    // the box round its handle and body on screen; shaded toward its lower right, lighter than the cup's
    const pts = [...handle, ...body], xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
    const x0 = Math.min(...xs) - 4, y0 = Math.min(...ys) - 4, x1 = Math.max(...xs) + 4, y1 = Math.max(...ys) + 4;
    pStipple = { x: x0, y: y0, c: makeStipple(x1 - x0, y1 - y0, C.steel, (u, v) => 0.75 * ramp(u * 0.5 + v * 0.7, 0.5, 1.1), 13) };
  }
  return pStipple;
}
function cupStipple() {
  const key = `${DPR}|${CX}|${CY}|${U}`;
  if (key !== stippleKey) {
    stippleKey = key;
    // the cup's box, rim to foot and out past the handle; shaded toward its lower right
    const [x0, y0] = at(-RIM - 0.1, -0.3), [x1, y1] = at(RIM + 1.1, MUG_H + 0.1);
    stipple = { x: x0, y: y0, c: makeStipple(x1 - x0, y1 - y0, C.cup, (u, v) => ramp(u * 0.45 + v * 0.75, 0.45, 1.05), 7) };
  }
  return stipple;
}

// each letter at each size drawn once, bold, in wet ink, and stamped from then on
function glyph(ch, size, white = false) {
  const key = `${ch}|${size}|${white}`;
  let c = glyphCache.get(key);
  if (!c) {
    const px = size * DPR;
    c = document.createElement('canvas');
    c.width = c.height = Math.ceil(px * 1.8);
    const g = c.getContext('2d');
    g.font = `700 ${px.toFixed(1)}px Georgia, 'Times New Roman', serif`;
    // flat letters: no shadow, outline or bleed (owner's call)
    g.fillStyle = white ? C.milk : C.letter; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(ch, c.width / 2, c.height / 2);
    glyphCache.set(key, c);
  }
  return c;
}

function drawLetters() {
  for (const l of letters) {
    // rises out of the coffee small and faint, fills out, sways wider as it climbs, and fades away
    const grow = Math.min(1, 0.35 + l.age / 1.2);
    const alpha = Math.min(1, l.age / 0.8, (l.life - l.age) / 3.5);
    if (alpha <= 0) continue;
    const swayNow = Math.sin(l.age * l.beat + l.phase) * l.sway * Math.min(1, l.age / 3);
    const g = glyph(l.ch, l.size), co = Math.cos(l.rot) * grow, si = Math.sin(l.rot) * grow;
    ctx.globalAlpha = alpha;
    ctx.setTransform(co, si, -si, co, l.x + swayNow, l.y);
    ctx.drawImage(g, -g.width / 2, -g.height / 2);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

/* the pour: white letters out of the spout, into the coffee - and over (owner's call, 2026-10-31).
   A letter falls slowly; where it hits the coffee it stays, lying at the angle it landed. The coffee
   brims, so the letters on it drift outward across the surface, tip over the rim, slide down the
   outside of the cup and spill onto the table, where they skid to a stop and stay a while.
   States: fall -> float (on the coffee) -> side (down the cup's outside) -> table. */

const POUR_RATE = 45;             // letters a second: a full stream (owner's calls, raised three times)
// slowed again (owner's call): speeds at 70% and accelerations at half, so every path is the same as
// before, only taken more slowly
const POUR_SPEED = 0.315;         // leaving the spout, in cup units a second
const POUR_G = 0.74;              // gravity, cup units a second squared: a slow fall
const DRIFT = 0.049;              // across the coffee toward the rim, cup units a second
const SLIDE_G = 0.54;             // pulling a letter down the cup's side
const TABLE_Y = MUG_H + 0.12;     // the table, just under the mug's foot
// The table as a plane in the cup's perspective: a point at radius r and angle th round the cup's axis
// sits at x = r cos th, y = MUG_H + GROUND * r sin th (in front of the foot when sin th > 0, behind it
// when < 0). Letters land on it and skid across it in these terms, so the spill stays joined to the cup.
// The ground plane is seen exactly as flat as the cup's rim and foot (their ellipses are 0.17 deep for 1.25
// wide), so the podium and the spill share the cup's eye line (owner's call: the perspectives must match).
const GROUND = 0.17 / RIM;
// The table (owner's call, 2026-10-31): a cute, thin, round cafe table under the cup, big enough to run off
// the right of the page. Its top is a disc in the ground plane, of radius TABLE_R round (TABLE_CX, TABLE_CZ)
// - the cup stands TABLE_IN in from its left edge - with a thin edge TABLE_T deep, on one slim stem down
// TABLE_LEG to a round foot. Letters pool on the top; pushed past its edge they tumble off and fade.
const TABLE_R = 5.2, TABLE_CZ = 0.25;         // the top's radius, and its centre's depth (a little behind the cup)
const TABLE_CX = TABLE_R - TABLE_IN;          // its centre, right of the cup
const TABLE_T = 0.1, TABLE_LEG = 1.7;         // the top's thickness; from the top down to the floor
const onTable = (gx, gz) => (gx - TABLE_CX) ** 2 + (gz - TABLE_CZ) ** 2 <= TABLE_R ** 2;
const FLOOR_Y = MUG_H + GROUND * TABLE_CZ + TABLE_LEG;   // the floor under the table's middle
const screenBottom = () => (canvas.height - CY) / U;     // the bottom of the screen, in cup units
const groundY = (r, th) => MUG_H + GROUND * r * Math.sin(th);
// A letter slides all the way down the bowl and onto the foot (owner's call), and steps off the foot's
// edge onto the table. The foot is drawn in the rim's perspective and the table in its own, so at that
// step any gap between them closes over a moment (SETTLE) rather than in one frame, which read as a jump.
const SETTLE = 7;
// The piles (owner's calls, 2026-10-31): letters gather on the coffee and on the table rather than passing
// through, like spilt liquid pooling and swelling. Each keeps a little space from its neighbours (D below):
// pushed off by any that crowd closer, drawn gently toward any just beyond - so they jostle, bond and the
// mass bulges as more arrive. Past PILE_MAX the oldest on the table slowly dissolve, so it never grows forever.
// Two piles behave this way, each with its own feel: the letters on the coffee, and those on the table.
//   D     the spacing letters keep, in cup units      push  how hard a crowding neighbour pushes
//   bond  how hard a near neighbour pulls             damp  how quickly the jostling calms
//   crowd neighbours within D before riding up        stack how high it rides per one over crowd
//   tip   how hard a riding letter tips toward the open side
// On the coffee they crowd, stack and tip, and the press of them pushes the outer ones over the rim. On
// the table they flow freely - little pull between them, little drag - to anywhere (owner's calls).
const SURF_P = { D: 0.075, push: 9, bond: 0.8, damp: 2.4, crowd: 4, stack: 0.03, tip: 1.1 };
// On the table they behave like water and coins (owner's call): they arrive at the cup's foot with almost no
// speed and gather round it; the mound grows, and only the press of new letters pushes the outer ones on -
// strong push, a little cohesion, heavy damping - stacking and tipping where crowded, until the spreading
// edge reaches the table's edge and they fall off (on the left first, which is nearest)
const TABLE_P = { D: 0.08, push: 12, bond: 0.5, damp: 2.6, crowd: 3, stack: 0.035, tip: 1.3 };
// and the table leans a touch to the left (owner's call): every letter on it is drawn that way, so the
// spill runs off the left edge rather than spreading evenly
const TABLE_TILT = 0.32;          // cup units a second squared, leftward
const PILE_MAX = 1100;
// Like coins in a pusher (owner's call): where the pile is crowded a letter rides up on top of the others,
// but it is unstable there - it tips toward the emptier side, slides off and drops, shoving its neighbours.
const JOSTLE_HZ = 30;             // the jostle runs at this rate, whatever the frame rate
const MAX_POUR = PILE_MAX + 500;
const SPLASH = 0.5;               // a landing letter's skid across the coffee, at most (cup units a second)
// the coffee's surface as a plane: a disc of radius SURF[0], seen squashed to SURF[1] deep on screen
const SURF_SQUASH = 0.13 / (RIM - 0.14);
const surf = [];                  // the letters on the coffee
const SURF = [RIM - 0.14, 0.13];  // the coffee's surface: an ellipse, half-width and half-depth
// The perspective a letter takes on what it lands on (owner's call): [across, up-and-down] squash.
// Lying on the coffee or the table, a flat surface seen from above at a slant, it is foreshortened top to
// bottom like the rim's ellipse; on the cup's side, at the edge of a round cup, it is seen nearly edge-on.
// Each letter is drawn through a 2x2 matrix: where its across and its down point on the screen. It eases
// from one to the next as it moves from state to state (LIE_RATE).
const FLAT_COFFEE = 0.3, FLAT_TABLE = 0.34;
const RIM_DEPTH = 0.14;           // the rim's ellipse: depth against width
const LIE_RATE = 9;               // how fast it settles into a new perspective

// the matrix for a letter turned by r within a surface whose across is screen vector T and whose down is D
const onSurface = (r, T, D) => {
  const c = Math.cos(r), s = Math.sin(r);
  return [c * T[0] + s * D[0], c * T[1] + s * D[1], -s * T[0] + c * D[0], -s * T[1] + c * D[1]];
};

// On the cup's wall a letter wraps round it (owner's call): its across runs along the circle round the cup
// at its angle th - full width where the wall faces us, foreshortened toward the sides - and its down runs
// down the wall, following the bowl as it curves in to the foot.
function wallMatrix(l) {
  const s = sideAt(Math.min(l.d, SIDE_TOTAL));
  let T = [Math.sin(l.th), -RIM_DEPTH * Math.cos(l.th)];
  const tl = Math.hypot(T[0], T[1]);
  if (tl < 0.25) T = [T[0] * 0.25 / tl, T[1] * 0.25 / tl];   // never quite edge-on, so it still reads
  const D0 = [s.dx * Math.cos(l.th), s.dy + RIM_DEPTH * s.dx * Math.sin(l.th)], dl = Math.hypot(D0[0], D0[1]) || 1;
  const D = [D0[0] / dl, D0[1] / dl];
  return onSurface(l.rot, T, D);
}

function targetMatrix(l) {
  if (l.state === 'fall') return onSurface(l.rot, [1, 0], [0, 1]);
  if (l.state === 'float') return onSurface(l.rot, [1, 0], [0, FLAT_COFFEE]);
  if (l.state === 'wall') return wallMatrix(l);
  if (l.state === 'off') return onSurface(l.rot, [1, 0], [0, 0.8]);   // tumbling free, nearly upright
  return onSurface(l.rot, [1, 0], [0, FLAT_TABLE]);
}
const pour = [];
let pourOwed = 0;

// the cup's outside from the rim down to the foot, right-hand side (the left is its mirror)
const SIDE = [...BOWL, [FOOT_W - 0.02, MUG_H]];
const SIDE_LEN = SIDE.slice(1).map((p, i) => Math.hypot(p[0] - SIDE[i][0], p[1] - SIDE[i][1]));
const SIDE_TOTAL = SIDE_LEN.reduce((a, b) => a + b, 0);
function sideAt(d) {
  let i = 0;
  while (i < SIDE_LEN.length - 1 && d > SIDE_LEN[i]) { d -= SIDE_LEN[i]; i++; }
  const f = Math.min(1, d / SIDE_LEN[i]), [a, b] = [SIDE[i], SIDE[i + 1]];
  const dx = (b[0] - a[0]) / SIDE_LEN[i], dy = (b[1] - a[1]) / SIDE_LEN[i];
  return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, slope: dy, dx, dy };
}

// onto the table at radius r, angle th, skidding outward at speed spd
// onto the table at radius r, angle th, moving outward at speed spd. On the table a letter lives in the
// table's own plane: gx across, gz in depth (toward us positive), shown at x = gx, y = MUG_H + GROUND * gz
const pile = [];                  // the letters on the table, in the order they arrived
let pileId = 0, jostleT = 0;
function toTable(l, r, th, spd) {
  const sp = spd * (0.5 + Math.random() * 0.5);
  l.state = 'table'; l.t = 0; l.yOff = 0; l.fading = false; l.pid = ++pileId; l.gh = 0; l.crowd = 0;
  l.gx = r * Math.cos(th); l.gz = r * Math.sin(th); l.gvx = Math.cos(th) * sp; l.gvz = Math.sin(th) * sp;
  l.x = l.gx; l.y = MUG_H + GROUND * l.gz;
  pile.push(l);
}

// the pile's jostle: each pair of near letters pushed apart or drawn together, found through a grid
function jostle(list, P, dt) {
  const cell = P.D * 1.6, grid = new Map();
  const key = (i, j) => i * 73856093 ^ j * 19349663;
  for (const l of list) {
    const i = Math.floor(l.gx / cell), j = Math.floor(l.gz / cell), k = key(i, j);
    let b = grid.get(k); if (!b) grid.set(k, (b = [])); b.push(l);
    l.ci = i; l.cj = j;
  }
  const reach = P.D * 1.6;
  for (const a of list) { a.crowd = 0; a.cx = 0; a.cz = 0; }
  for (const a of list) {
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      const b0 = grid.get(key(a.ci + di, a.cj + dj)); if (!b0) continue;
      for (const b of b0) {
        if (b.pid <= a.pid) continue;   // each pair once
        let dx = b.gx - a.gx, dz = b.gz - a.gz, d = Math.hypot(dx, dz);
        if (d >= reach) continue;
        if (d < 1e-5) { dx = Math.random() - 0.5; dz = Math.random() - 0.5; d = Math.hypot(dx, dz); }
        const f = (d < P.D ? P.push : P.bond) * (d - P.D) * dt / d;   // < 0 pushes apart, > 0 pulls in
        a.gvx += dx * f; a.gvz += dz * f; b.gvx -= dx * f; b.gvz -= dz * f;
        if (d < P.D) { a.crowd++; b.crowd++; a.cx += dx; a.cz += dz; b.cx -= dx; b.cz -= dz; }
      }
    }
  }
  // crowded: ride up, and tip away from where the neighbours are
  for (const l of list) {
    const over = l.crowd - P.crowd;
    l.targetH = over > 0 ? over * P.stack : 0;
    if (over > 0) {
      const m = Math.hypot(l.cx, l.cz) || 1, tip = P.tip * over * dt;
      l.gvx -= (l.cx / m) * tip; l.gvz -= (l.cz / m) * tip;
    }
  }
}

function stepPour(dt) {
  if (!reduceMotion && pour.length < MAX_POUR) {
    pourOwed += POUR_RATE * dt;
    while (pourOwed >= 1) {
      pourOwed -= 1;
      const sp = POUR_SPEED * (0.85 + Math.random() * 0.3);
      pour.push({
        state: 'fall',
        ch: LETTERS[Math.floor(Math.random() * LETTERS.length)],
        x: PITCHER.spout[0], y: PITCHER.spout[1] + 0.02,
        vx: POUR_DIR[0] * sp + (Math.random() - 0.5) * 0.04, vy: POUR_DIR[1] * sp,
        rot: (Math.random() - 0.5) * 1.2, spin: (Math.random() - 0.5) * 2,
        size: [9, 10, 11][Math.floor(Math.random() * 3)],   // small (owner's calls: made smaller twice, then a little bigger)
        t: 0, alpha: 1, m: null,
      });
    }
  }
  for (const l of pour) {
    l.t += dt;
    if (l.state === 'fall') {
      l.vy += POUR_G * dt;
      l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.spin * dt;
      if (l.y >= 0 && Math.abs(l.x) < SURF[0]) {
        // it lands on the coffee and stays at the angle it hit, somewhere across the surface's depth
        // it lands just where it hits, then glides off across the coffee in some direction and slows to a
        // stop - most only a little way, staying near the middle, a few much further (owner's call: spread,
        // but no jumping, and most in the middle)
        // it lands just where it hits, on the coffee, and skids a little from the impact into the letters
        // already there - which push back, stack and tip (owner's call: like coins in a pusher)
        l.state = 'float'; l.gx = l.x; l.gz = (Math.random() - 0.5) * 0.2; l.gh = 0;
        const ang = Math.random() * Math.PI * 2, sk = SPLASH * Math.random();
        l.gvx = Math.cos(ang) * sk + l.vx * 0.3; l.gvz = Math.sin(ang) * sk;
        l.pid = ++pileId; surf.push(l);
      } else if (l.y > TABLE_Y && onTable(l.x, (l.y - MUG_H) / GROUND)) {
        // missed the cup: onto the table where it fell, still sliding a little the way it was going
        const th = Math.atan2((l.y - MUG_H) / GROUND, l.x);
        toTable(l, Math.hypot(l.x, (l.y - MUG_H) / GROUND), th, Math.abs(l.vx) * 0.3);
      } else if (l.y > screenBottom() + 0.3) l.alpha = 0;   // missed the table too: gone past the bottom of the screen
    } else if (l.state === 'float') {
      // on the coffee: moved by the jostle and a faint brimming drift outward, until pushed over the rim
      const r = Math.hypot(l.gx, l.gz) || 1e-3;
      l.gvx += (l.gx / r) * DRIFT * dt; l.gvz += (l.gz / r) * DRIFT * dt;
      l.gx += l.gvx * dt; l.gz += l.gvz * dt;
      const fr = 1 - Math.min(1, SURF_P.damp * dt); l.gvx *= fr; l.gvz *= fr;
      l.gh += ((l.targetH || 0) - l.gh) * Math.min(1, 6 * dt);
      l.x = l.gx; l.y = l.gz * SURF_SQUASH - l.gh;
      if (Math.hypot(l.gx, l.gz) >= SURF[0]) {
        // over the rim here: down the front of the cup if it is the near half, behind it if the far
        l.state = 'wall'; l.th = Math.atan2(l.gz, l.gx); l.back = l.gz < 0; l.d = 0;
        l.spd = 0.05 + Math.hypot(l.gvx, l.gvz) * 0.5;
      }
    } else if (l.state === 'wall') {
      // down the outside of the cup, faster as it goes, at its point round the cup
      const s = sideAt(l.d);
      l.spd += SLIDE_G * Math.max(0.25, s.slope) * dt;
      l.d += l.spd * dt;
      const p = sideAt(Math.min(l.d, SIDE_TOTAL));
      l.x = p.x * Math.cos(l.th); l.y = p.y + RIM_DEPTH * p.x * Math.sin(l.th);
      if (l.d >= SIDE_TOTAL) {
        // off the foot's edge, onto the table just there, carrying its speed
        const y0 = l.y;
        toTable(l, p.x, l.th, 0.06 + l.spd * 0.08);   // set down at the foot, barely moving: the pile does the rest
        l.yOff = y0 - l.y;   // the step between the foot's perspective and the table's, closed over a moment
      }
    } else if (l.state === 'table') {
      // on the table: moving as the jostle pushes it, calming, and never inside the cup's foot
      l.gvx -= TABLE_TILT * dt;   // sliding left
      l.gx += l.gvx * dt; l.gz += l.gvz * dt;
      const fr = 1 - Math.min(1, TABLE_P.damp * dt); l.gvx *= fr; l.gvz *= fr;
      const r = Math.hypot(l.gx, l.gz), rmin = FOOT_W + 0.02;
      if (r < rmin) {
        const ux = l.gx / (r || 1), uz = l.gz / (r || 1); l.gx = ux * rmin; l.gz = uz * rmin;
        const vin = l.gvx * ux + l.gvz * uz; if (vin < 0) { l.gvx -= vin * ux; l.gvz -= vin * uz; }
      }
      l.yOff *= 1 - Math.min(1, SETTLE * dt);
      l.gh += ((l.targetH || 0) - l.gh) * Math.min(1, 6 * dt);   // riding up on the pile, or dropping off it
      l.x = l.gx; l.y = MUG_H + GROUND * l.gz + l.yOff - l.gh;
      if (l.fading) l.alpha = Math.max(0, l.alpha - dt / 4);
      if (!onTable(l.gx, l.gz)) {
        // over the table's edge: it tumbles off and fades as it falls - behind the table if off its far side
        l.state = 'off'; l.offBack = l.gz < TABLE_CZ; l.t = 0;
        l.vx = l.gvx; l.vy = l.gvz * GROUND + 0.1; l.spin = (Math.random() - 0.5) * 6;
      }
    } else if (l.state === 'off') {
      // falling all the way down the screen, and gone the moment it drops past the bottom (owner's calls)
      l.vy += POUR_G * 2 * dt; l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.spin * dt;
      if (l.y > screenBottom() + 0.3) l.alpha = 0;
    }
  }
  // each letter eases toward the perspective of where it now is
  const e = Math.min(1, LIE_RATE * dt);
  for (const l of pour) {
    const tm = targetMatrix(l);
    if (!l.m) l.m = tm; else for (let k = 0; k < 4; k++) l.m[k] += (tm[k] - l.m[k]) * e;
  }
  // the pile jostles (at a steady rate, to keep it light); past its limit the oldest start to dissolve
  jostleT += dt;
  if (jostleT >= 1 / JOSTLE_HZ) {
    const h = Math.min(jostleT, 0.1);
    jostle(surf, SURF_P, h); jostle(pile, TABLE_P, h); jostleT = 0;
  }
  for (let i = 0; i < pile.length - PILE_MAX; i++) pile[i].fading = true;
  let keep = 0;
  for (const l of pour) if (l.alpha > 0) pour[keep++] = l;
  pour.length = keep;
  let pk = 0;
  for (const l of pile) if (l.alpha > 0 && l.state === 'table') pile[pk++] = l;
  pile.length = pk;
  let sk = 0;
  for (const l of surf) if (l.state === 'float') surf[sk++] = l;
  surf.length = sk;
}

// behind: the letters that went over the far side of the rim, drawn before the cup so it hides them
// three passes: 'under' - tumbling off the podium's back, hidden by the block; 'behind' - behind the cup,
// on its far wall or on the podium behind its foot; 'front' - everything else
function drawPour(pass) {
  for (const l of pour) {
    const layer = l.state === 'off' ? (l.offBack ? 'under' : 'front')
      : l.state === 'table' ? (l.gz < 0 ? 'behind' : 'front')   // behind the cup's foot
      : (l.state === 'wall' && l.back) ? 'behind' : 'front';
    if (layer !== pass) continue;
    if (!l.m) continue;
    const g = glyph(l.ch, l.size, true), [x, y] = at(l.x, l.y);
    ctx.globalAlpha = l.alpha;
    // on the coffee and on the table a letter rests on its base; falling, it is centred
    const lift = l.state === 'fall' ? 0 : -g.height * 0.18;
    // through its matrix: turned within the surface it is on, and laid into that surface's perspective
    const [a, b, c, d] = l.m;
    ctx.setTransform(a, b, c, d, x, y);
    ctx.drawImage(g, -g.width / 2, -g.height / 2 + lift);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

/* ---------- 4. loop ---------- */

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (tableDirty) {
    // the table line and the cup's middle, for the statement to sit under it (CSS px)
    // the statement sits a little under the table's top, not down at the floor
    document.documentElement.style.setProperty('--table-y', `${((CY + (MUG_H + GROUND * (TABLE_CZ + TABLE_R) + 0.9) * U) / DPR).toFixed(1)}px`);
    document.documentElement.style.setProperty('--cup-x', `${(CX / DPR).toFixed(1)}px`);
    tableDirty = false;
  }
  stepLetters(dt);
  stepPour(dt);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!shadowSprite) drawShadowSprites();
  drawPour('under');   // tumbling off the table's far edge, behind it
  drawTable();
  drawShadow();
  drawPitcher();
  drawPour('behind');  // behind the cup: its far wall, the podium behind its foot
  drawCup();
  drawPour('front');   // the milk falling in, on the coffee, down the near side, on the podium, off its front
  drawLetters();   // over the cup: each one rises up out of the coffee
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
