/* hanging-book: a hardcover held up by its boards, open like a tent - the spine at the peak, the pages
   hanging below in a ragged fan - drawn live on a canvas in a three-quarter view, and every so often it
   holds still, black, while a breeze stirs its pages and letters drift out of it (owner's calls,
   2026-10-30 and 31; the sway and the tapped shake are kept, switched off by STILL).
   Letters fall out of it all the while, from between the two hanging pages - a steady stream, a flood in
   a shake - drawn behind the nearer of the two, so they seem to drop through the gap.

   Sections:
     1  the book       sizes, colours, the view
     2  projection     book space -> world (the shake) -> screen
     3  the pages      each sheet a chain of points: verlet, a spring back to its resting curve, fixed lengths
     4  the shake      a constant slow sway, and a hard shake on a tap
     5  drawing        far board, pages, headband, near board, spine with its raised bands and hinges
     6  letters        falling from between the two hanging pages, tumbling down the screen
     7  loop
   Book space: a runs across the spine, s along it (centred), z up; the spine's ridge is a = 0, z = 0. */

/* ---------- 1. the book ---------- */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const SPINE = 10;                 // spine length
const BOARD = 6.6;                // board width, spine to fore-edge
const TENT = (75 * Math.PI) / 180;   // each board's slope down from the ridge: steep, the book only ajar (owner's call)
const THICK = 0.3;                // board thickness
// The pages (owner's call): most lie against the inside of each board, a few a side, and just two hang
// free between them, swinging the most.
const SIDE_PAGES = 3;             // lying against each board
const DANGLING = [-0.1, 0.12];    // the two that hang, each by its lean (-1 one board's way, 1 the other's)
const PAGE_LEN = 7.4;             // a hanging sheet, spine to its edge
const INSET = 0.3;                // pages a little shorter than the boards at head and tail
const SEG = 14;                   // points along a sheet

// the view: turned a little to the side of looking straight down the spine, and from above
const YAW = (58 * Math.PI) / 180;
const ELEV = (30 * Math.PI) / 180;
// and the whole book tipped steeply, the near end of its spine higher than the far (owner's call: the
// other way, and way more)
const TILT = (-56 * Math.PI) / 180;   // tilted more again (owner's call)

// Inkwell (owner's call, 2026-10-31): black and white only, high contrast, like old ink on paper - a
// black book, its faces in near-blacks so its shape still reads, pure white pages, no colour anywhere.
const C = {
  ink: '#0b0b0b',
  page: '#fbfbf9', pageShade: '#e4e4e1',
  board: '#1e1e1e', boardEdge: '#0e0e0e', boardEnd: '#2a2a2a',
  spine: '#181818', spineLit: '#353535', band: '#090909', joint: '#3a3a3a',
  headA: '#1a1a1a', headB: '#f2f2f0',
  shadow: 'rgba(0, 0, 0, 0.2)',
};

/* ---------- 2. projection ---------- */

const canvas = document.getElementById('book');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1, SC = 1, CX = 0, CY = 0, LW = 1;
let shadowSprite = null;   // the shadow, drawn once per size (section 5)

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  SC = Math.min(W / 57, H / 58) * DPR;     // made smaller again and again (owner's call): the last step, three times over
  CX = (W / 2) * DPR; CY = (H * 0.3) * DPR;
  LW = Math.max(0.4, Math.min(1, SC / DPR / 60));   // ink lines thin with the book, so a small one is not all outline
  shadowSprite = null;               // remade at the new size
  window.dispatchEvent(new Event('book-resized'));
}
addEventListener('resize', resize);
resize();

// the book's pose in the world, set by the shake each frame; env is how hard it is shaking, 0 to 1
const pose = { roll: 0, ox: 0, oz: 0, env: 0 };

// book space -> world space: rolled about the spine, then moved
function world(a, s, z) {
  const c = Math.cos(pose.roll), n = Math.sin(pose.roll);
  return [a * c - z * n + pose.ox, s, a * n + z * c + pose.oz];
}

// world space -> screen: turned by YAW about the vertical, seen from ELEV above; returns [x, y, depth]
function screen([a, s0, z0]) {
  const s = s0 * Math.cos(TILT) + z0 * Math.sin(TILT), z = z0 * Math.cos(TILT) - s0 * Math.sin(TILT);
  const X = a * Math.cos(YAW) + s * Math.sin(YAW);
  const Yh = -a * Math.sin(YAW) + s * Math.cos(YAW);
  return [CX + X * SC, CY + (Yh * Math.sin(ELEV) - z * Math.cos(ELEV)) * SC, Yh * Math.cos(ELEV) + z * Math.sin(ELEV)];
}
const P = (a, s, z) => screen(world(a, s, z));

/* ---------- 3. the pages ---------- */

// a fixed scatter, so the same book every visit
const rand = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// A hanging sheet's resting curve across the spine: it leaves the spine at a lean and gravity bends it
// toward straight down. t runs -1 (one board's side) to 1 (the other's).
function restCurve(t) {
  const start = t * (44 * Math.PI) / 180;
  const len = PAGE_LEN * (1 + 0.035 * Math.sin(t * 37) + 0.02 * Math.cos(t * 91));
  const out = [[0, -0.12]];
  let a = 0, z = -0.12;
  for (let i = 1; i <= SEG; i++) {
    const f = i / SEG, ang = start * (1 - f) ** 2.4, step = len / SEG;
    a += Math.sin(ang) * step; z -= Math.cos(ang) * step;
    out.push([a, z]);
  }
  return out;
}

// A sheet lying against a board's inside: from the spine along the board, a little below it, each one
// further in a little lower and shorter, its edge just dipping.
function boardCurve(side, k) {
  const ca = Math.cos(TENT), sa = Math.sin(TENT);
  const along = [side * ca, -sa], inward = [-side * sa, -ca];   // down the board; away from it, inside
  const len = BOARD - 0.45 - 0.22 * k, off = 0.07 + 0.09 * k;
  return Array.from({ length: SEG + 1 }, (_, i) => {
    const f = i / SEG, d = f * len, o = off * Math.min(1, f * 4) + 0.18 * f ** 3;   // the edge dips a touch
    return [along[0] * d + inward[0] * o, -0.12 + along[1] * d + inward[1] * o];
  });
}

function sheet(rest, j, stiff) {
  const seg = rest.slice(1).map((p, i) => Math.hypot(p[0] - rest[i][0], p[1] - rest[i][1]));
  return {
    rest, seg,
    pos: rest.map((p) => [...p]), prev: rest.map((p) => [...p]),   // world (a, z), the s extrusion is fixed
    k: stiff * (0.8 + 0.4 * rand(j, 1)),     // how strongly it springs back to its curve
    damp: 0.984 + 0.008 * rand(j, 2),       // how quickly it calms
    shade: j % 2 === 0,
  };
}

const sheets = [
  // against the boards: held close, they only flutter at their edges
  ...[-1, 1].flatMap((side, n) => Array.from({ length: SIDE_PAGES }, (_, k) => sheet(boardCurve(side, k), n * 10 + k, 0.1))),
  // the two hanging free: loose, they swing the most
  ...DANGLING.map((t, i) => sheet(restCurve(t), 40 + i, 0.03)),
];

const G = 38;   // gravity, book units a second squared

// A soft breeze through the pages all the while (owner's call: more motion): a push across the spine,
// on each page its own slow rhythm, strongest at the edge and nothing at the spine, so the pages ripple
// out of step rather than moving as one.
const BREEZE = 9;   // its strength, book units a second squared
let breezeT = 0;

function stepPages(dt) {
  const c = Math.cos(pose.roll), n = Math.sin(pose.roll);
  breezeT += dt;
  sheets.forEach((sh, j) => {
    sh.gust = BREEZE * (Math.sin(breezeT * 1.3 + j * 1.7) + 0.55 * Math.sin(breezeT * 3.1 + j * 0.6 + 1.2));
  });
  for (const sh of sheets) {
    const { pos, prev, rest, seg } = sh;
    // where its resting curve is now, with the book moved
    const target = rest.map(([a, z]) => [a * c - z * n + pose.ox, a * n + z * c + pose.oz]);
    pos[0][0] = target[0][0]; pos[0][1] = target[0][1];
    for (let i = 1; i <= SEG; i++) {
      const p = pos[i], q = prev[i];
      const vx = (p[0] - q[0]) * sh.damp, vz = (p[1] - q[1]) * sh.damp;
      q[0] = p[0]; q[1] = p[1];
      const reach = (i / SEG) ** 1.5;
      p[0] += vx + sh.gust * reach * dt * dt; p[1] += vz - G * dt * dt;
      // spring back to the curve: stiff near the spine, floppy at the edge
      const k = sh.k * (0.15 + 0.85 * (1 - i / SEG) ** 1.2);
      p[0] += (target[i][0] - p[0]) * k; p[1] += (target[i][1] - p[1]) * k;
    }
    // paper does not stretch: keep every length
    for (let it = 0; it < 3; it++) {
      for (let i = 1; i <= SEG; i++) {
        const a = pos[i - 1], b = pos[i];
        const dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz) || 1e-6;
        const diff = (d - seg[i - 1]) / d;
        if (i === 1) { b[0] -= dx * diff; b[1] -= dz * diff; }
        else { a[0] += dx * diff * 0.5; a[1] += dz * diff * 0.5; b[0] -= dx * diff * 0.5; b[1] -= dz * diff * 0.5; }
      }
    }
  }
}

/* ---------- 4. the shake ---------- */

// A constant, slow sway (owner's call, 2026-10-31: in place of a shake every few seconds) - a few slow
// waves out of step, so it never quite repeats - and a proper shake only when tapped.
const SHAKE_MS = 1250;
let shakeAt = -1e9;   // no shake until a tap
// The book holds still now (owner's call, 2026-10-31: "instead of a moving book"): no sway and no shake.
// The pages still stir in the breeze and the letters still drift out. Set false to bring the motion back.
const STILL = true;

function shake(tms) {
  const u = (tms - shakeAt) / SHAKE_MS, t = tms / 1000;
  let roll = 0.055 * Math.sin(t * 0.9) + 0.022 * Math.sin(t * 2.1 + 1.1);
  let ox = 0.28 * Math.sin(t * 0.65 + 0.4) + 0.08 * Math.sin(t * 1.7);
  let oz = 0.12 * Math.sin(t * 1.05 + 2.0) + 0.04 * Math.sin(t * 2.6);
  pose.env = 0;
  if (u >= 0 && u <= 1) {
    const env = Math.sin(Math.min(1, u * 6) * Math.PI / 2) * (1 - u) ** 2.2, tau = (tms - shakeAt) / 1000;
    pose.env = env;
    roll += 0.12 * Math.sin(2 * Math.PI * 6.5 * tau) * env;
    ox += 0.5 * Math.sin(2 * Math.PI * 5 * tau + 0.6) * env;
    oz += 0.28 * Math.sin(2 * Math.PI * 8 * tau) * env;
  }
  pose.roll = roll; pose.ox = ox; pose.oz = oz;
}
if (!STILL) document.querySelector('.stage').addEventListener('pointerdown', () => {
  const now = performance.now() - started;
  if (now - shakeAt > SHAKE_MS * 0.5) shakeAt = now;
});

/* ---------- 5. drawing ---------- */

// The hand-drawn wobble: every edge is cut into short steps and each step nudged by a fixed, smooth
// field over the screen - what the SVG displacement filter did, but on a few hundred points rather than
// every pixel of a full-screen canvas each frame, which is what made it freeze (owner's report).
const WOBBLE = 1.6;   // how far the field pushes, in CSS pixels
function nudge(x, y) {
  const a = WOBBLE * DPR * LW, u = x / DPR, v = y / DPR;
  return [
    x + a * (Math.sin(v * 0.021 + u * 0.007) + 0.6 * Math.sin(v * 0.053 - u * 0.017 + 1.3)),
    y + a * (Math.sin(u * 0.019 - v * 0.009 + 2.1) + 0.6 * Math.sin(u * 0.047 + v * 0.021)),
  ];
}

function wobblyPath(points, closed) {
  const step = 10 * DPR;
  const n = points.length, last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[(i + 1) % n];
    const k = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let j = i === 0 ? 0 : 1; j <= k; j++) {
      const [x, y] = nudge(x0 + ((x1 - x0) * j) / k, y0 + ((y1 - y0) * j) / k);
      if (i === 0 && j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
  }
}

function poly(points, fill, width = 2.2) {
  ctx.beginPath();
  wobblyPath(points, true);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (width) { ctx.lineWidth = width * DPR * LW; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round'; ctx.stroke(); }
}
const avgDepth = (pts) => pts.reduce((d, p) => d + p[2], 0) / pts.length;

// a face is drawn only if it turns toward us: its normal, carried into view space, points our way
function facing(a, s, z, na, ns, nz) {
  return screen(world(a + na, s + ns, z + nz))[2] - screen(world(a, s, z))[2] > 1e-4;
}

const S0 = -SPINE / 2, S1 = SPINE / 2;

// a board's faces, the ones turned to us
function boardFaces(side) {
  const ca = Math.cos(TENT), sa = Math.sin(TENT);
  const fa = side * BOARD * ca, fz = -BOARD * sa;            // fore-edge, relative to the ridge
  const na = side * sa * THICK, nz = ca * THICK;              // the thickness, outward
  const faces = [];
  // outer face
  if (facing(0, 0, 0, na, 0, nz)) faces.push({ pts: [P(na, S0, nz), P(na, S1, nz), P(fa + na, S1, fz + nz), P(fa + na, S0, fz + nz)], fill: C.board });
  // fore-edge
  faces.push({ pts: [P(fa, S0, fz), P(fa, S1, fz), P(fa + na, S1, fz + nz), P(fa + na, S0, fz + nz)], fill: C.boardEdge });
  // the end toward us
  const endS = facing(0, 0, 0, 0, 1, 0) ? S1 : S0;
  faces.push({ pts: [P(0, endS, 0), P(fa, endS, fz), P(fa + na, endS, fz + nz), P(na, endS, nz)], fill: C.boardEnd });
  // the hinge's groove, a line along the board a little below the spine
  const g = 0.55;
  faces.joint = [P(side * g * ca + na, S0 + 0.05, -g * sa + nz), P(side * g * ca + na, S1 - 0.05, -g * sa + nz)];
  return faces;
}

// the spine's rounded back, proud of the boards, and its raised bands
function spineArc(r) {
  const a0 = Math.atan2(Math.cos(TENT), -Math.sin(TENT)), a1 = Math.atan2(Math.cos(TENT), Math.sin(TENT));
  return Array.from({ length: 9 }, (_, i) => { const f = a0 + (a1 - a0) * (i / 8); return [Math.cos(f) * r, Math.sin(f) * r]; });
}
const ARC = spineArc(THICK * 1.25), BAND_ARC = spineArc(THICK * 1.6);
const BANDS = [-0.3, -0.1, 0.1, 0.3].map((f) => f * SPINE);
const BAND_W = 0.24;

function drawSpine() {
  // the back: one strip per step round the arc, lighter where it faces up
  for (let i = 0; i < ARC.length - 1; i++) {
    const [a0, z0] = ARC[i], [a1, z1] = ARC[i + 1];
    const lit = Math.abs(i - (ARC.length - 2) / 2) < 1.5;
    poly([P(a0, S0, z0), P(a0, S1, z0), P(a1, S1, z1), P(a1, S0, z1)], lit ? C.spineLit : C.spine, 0);
  }
  // its outline along both hinges
  for (const [a, z] of [ARC[0], ARC[ARC.length - 1]]) line(P(a, S0, z), P(a, S1, z), 2.2, C.ink);
  // the raised bands across it
  const capS = facing(0, 0, 0, 0, 1, 0) ? 1 : -1;
  for (const b of BANDS) {
    for (let i = 0; i < BAND_ARC.length - 1; i++) {
      const [a0, z0] = BAND_ARC[i], [a1, z1] = BAND_ARC[i + 1];
      poly([P(a0, b - BAND_W / 2, z0), P(a0, b + BAND_W / 2, z0), P(a1, b + BAND_W / 2, z1), P(a1, b - BAND_W / 2, z1)], C.band, 0);
    }
    // the band's cap on the side toward us: between the spine's arc and the band's
    const sc = b + (capS * BAND_W) / 2;
    poly([...BAND_ARC.map(([a, z]) => P(a, sc, z)), ...ARC.slice().reverse().map(([a, z]) => P(a, sc, z))], C.band, 1.6);
    line(P(BAND_ARC[0][0], b - BAND_W / 2, BAND_ARC[0][1]), P(BAND_ARC[0][0], b + BAND_W / 2, BAND_ARC[0][1]), 1.6, C.ink);
  }
}

function line(p, q, width, colour) {
  ctx.beginPath(); wobblyPath([p, q], false);
  ctx.lineWidth = width * DPR * LW; ctx.strokeStyle = colour; ctx.lineCap = 'round'; ctx.stroke();
}

function drawPages() {
  const near = facing(0, 0, 0, 0, 1, 0) ? S1 - INSET : S0 + INSET;
  const far = near === S1 - INSET ? S0 + INSET : S1 - INSET;
  const drawn = sheets.map((sh) => {
    const back = sh.pos.map(([a, z]) => screen([a, far, z]));
    const front = sh.pos.map(([a, z]) => screen([a, near, z]));
    return { pts: [...back, ...front.reverse()], depth: avgDepth(front), fill: sh.shade ? C.pageShade : C.page, hanging: HANGING.includes(sh) };
  });
  // the letters go in just before the nearer of the two hanging pages, so it hides them in the gap
  const hangingDepths = drawn.filter((d) => d.hanging).map((d) => d.depth);
  const nearHanging = Math.max(...hangingDepths);
  let lettersDrawn = false;
  drawn.sort((x, y) => x.depth - y.depth).forEach((d) => {
    if (!lettersDrawn && d.hanging && d.depth === nearHanging) { drawLetters(); lettersDrawn = true; }
    poly(d.pts, d.fill, 1.3);
  });
  if (!lettersDrawn) drawLetters();
  // the headband: a little striped roll where the pages meet the spine, at the end toward us
  const r = 0.2;
  const disc = Array.from({ length: 14 }, (_, i) => { const f = (i / 14) * 2 * Math.PI; return [Math.cos(f) * r, Math.sin(f) * r - 0.1]; });
  poly(disc.map(([a, z]) => P(a, near + (near > 0 ? 0.02 : -0.02), z)), C.headA, 1.4);
  poly(disc.map(([a, z]) => P(a * 0.45, near + (near > 0 ? 0.04 : -0.04), z * 0.45 - 0.055)), C.headB, 0);
}

// the shadow, blurred once into a canvas of its own (blurring it every frame was costly), then stamped
function makeShadow() {
  const rx = 7.4 * SC, ry = 2.2 * SC, pad = 40 * DPR;
  const c = document.createElement('canvas');
  c.width = Math.ceil(2 * (rx + pad)); c.height = Math.ceil(2 * (ry + pad));
  const g = c.getContext('2d');
  g.filter = `blur(${18 * DPR}px)`;
  g.beginPath(); g.ellipse(c.width / 2, c.height / 2, rx, ry, 0, 0, Math.PI * 2);
  g.fillStyle = C.shadow; g.fill();
  shadowSprite = c;
}
function drawShadow() {
  if (!shadowSprite) makeShadow();
  const [x, y] = screen([pose.ox, 0, -11]);
  const lift = 1 - Math.max(-0.4, Math.min(0.4, pose.oz)) * 0.25;
  const w = shadowSprite.width * lift, h = shadowSprite.height * lift;
  ctx.drawImage(shadowSprite, x - w / 2, y - h / 2, w, h);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShadow();
  // which board is farther from us
  const dLeft = P(-BOARD, 0, -BOARD)[2], dRight = P(BOARD, 0, -BOARD)[2];
  const [farSide, nearSide] = dLeft < dRight ? [-1, 1] : [1, -1];
  const farB = boardFaces(farSide);
  farB.sort((x, y) => avgDepth(x.pts) - avgDepth(y.pts)).forEach((f) => poly(f.pts, f.fill));
  line(farB.joint[0], farB.joint[1], 1.8, C.joint);
  drawPages();
  const nearB = boardFaces(nearSide);
  nearB.sort((x, y) => avgDepth(x.pts) - avgDepth(y.pts)).forEach((f) => poly(f.pts, f.fill));
  line(nearB.joint[0], nearB.joint[1], 1.8, C.joint);
  drawSpine();
}

/* ---------- 6. letters ---------- */

// Letters fall out of the book (owner's call): from the gap between the two hanging pages, at a point
// along the spine, in screen space - a little sideways push, gravity, a tumble - fading as they near the
// bottom. They are drawn just before the nearer hanging page, which hides them until they drop out of
// its edge (see drawPages).
// the letters of "ddanghnl studio", "hawaii" and "honolulu" (owner's call), each picked at random -
// so the more common ones there (h, a, i, o, l, u) fall more often
const GLYPHS = 'ddanghnlstudio' + 'hawaii' + 'honolulu';
// Fewer, slower, and fluttering down like scraps of paper rather than pouring (owner's call, 2026-10-31).
const RATE = 3.5, RATE_SHAKING = 22;   // letters a second: always, and at the height of a shake
// As if in space (owner's call, 2026-10-31): they drift out slowly at their launch angle, the faintest
// pull downward bending the path a little, turning lazily, and fade away after LIFE seconds.
const FALL = 14, DRAG = 0.04;          // a whisper of gravity (CSS px/s^2), next to no drag
const LIFE = [9, 14];                  // seconds before a letter has faded away
const LAUNCH = (40 * Math.PI) / 180;   // the angle they leave the book at, off straight down, to the right
const MAX_LETTERS = 600;
const letters = [];
let owed = 0;

const HANGING = sheets.slice(-DANGLING.length);   // the two hanging pages, last in the list

function spawnLetter() {
  // somewhere in the gap between them, in its lower part, so they are soon seen leaving it
  const i = Math.floor(SEG * (0.45 + Math.random() * 0.4));
  const [p0, p1] = HANGING.map((sh) => sh.pos[i]);
  const f = 0.3 + Math.random() * 0.4;
  const a = p0[0] + (p1[0] - p0[0]) * f, z = p0[1] + (p1[1] - p0[1]) * f;
  const along = S0 + INSET + Math.random() * (SPINE - 2 * INSET);
  const [x, y] = screen([a, along, z]);
  // they come out at an angle (owner's call): launched LAUNCH off straight down, toward the open side of
  // the book, then curving down as they slow
  const ang = LAUNCH + (Math.random() - 0.5) * 0.9, speed = (20 + Math.random() * 26) * DPR;   // a wide cone, so they spread
  letters.push({
    ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    x, y,
    vx: Math.sin(ang) * speed + pose.ox * 8 * DPR,
    vy: Math.cos(ang) * speed,
    rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.7,
    // a slow wander as it drifts, each on its own beat
    sway: (2 + Math.random() * 5) * DPR, beat: 0.35 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2, age: 0,
    life: LIFE[0] + Math.random() * (LIFE[1] - LIFE[0]),
    size: LETTER_SIZES[Math.floor(Math.random() * LETTER_SIZES.length)],
  });
}

function stepLetters(dt) {
  if (!reduceMotion) {
    owed += (RATE + (RATE_SHAKING - RATE) * pose.env) * dt;
    while (owed >= 1 && letters.length < MAX_LETTERS) { spawnLetter(); owed -= 1; }
    if (owed > 1) owed = 0;
  }
  const g = FALL * DPR;
  for (const l of letters) {
    l.age += dt;
    l.vy += (g - l.vy * DRAG) * dt;            // barely pulled down
    l.vx *= 1 - DRAG * dt;                     // keeps its drift: nothing to slow it
    const flutter = Math.cos(l.age * l.beat + l.phase) * l.sway;
    l.x += (l.vx + flutter) * dt; l.y += l.vy * dt;
    l.rot += (l.spin + Math.sin(l.age * l.beat + l.phase) * 0.15) * dt;   // a lazy turn
  }
  // gone once faded, or off the screen
  let keep = 0;
  for (const l of letters) if (l.age < l.life && l.y <= canvas.height + 40 && l.x <= canvas.width + 40) letters[keep++] = l;
  letters.length = keep;
}

// Each letter at each size is drawn once, bold (owner's call: thicker), into a little canvas of its own,
// and stamped from then on: setting the font and drawing text for every letter every frame was costly.
const LETTER_SIZES = [10, 12, 14, 16, 19];   // CSS pixels
const glyphCache = new Map();
addEventListener('book-resized', () => glyphCache.clear());
function glyph(ch, size) {
  const key = `${ch}|${size}`;
  let c = glyphCache.get(key);
  if (!c) {
    const px = size * DPR;   // readable whatever the book's size
    c = document.createElement('canvas');
    c.width = c.height = Math.ceil(px * 1.7);
    const g = c.getContext('2d');
    g.font = `700 ${px.toFixed(1)}px Georgia, 'Times New Roman', serif`;
    g.fillStyle = C.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    // wet ink: a soft bleed into the paper under a crisp letter
    g.shadowColor = 'rgba(0, 0, 0, 0.55)'; g.shadowBlur = 2.2 * DPR;
    g.fillText(ch, c.width / 2, c.height / 2);
    g.shadowBlur = 0;
    g.fillText(ch, c.width / 2, c.height / 2);
    glyphCache.set(key, c);
  }
  return c;
}

function drawLetters() {
  for (const l of letters) {
    // in over its first half second, out over its last few, and near the bottom of the screen
    const fade = Math.min(1, l.age / 0.5, (l.life - l.age) / 3.5, Math.max(0, (canvas.height - l.y) / (canvas.height * 0.25)));
    if (fade <= 0) continue;
    const g = glyph(l.ch, l.size), co = Math.cos(l.rot), si = Math.sin(l.rot);
    ctx.globalAlpha = fade;
    ctx.setTransform(co, si, -si, co, l.x, l.y);
    ctx.drawImage(g, -g.width / 2, -g.height / 2);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

/* ---------- 7. loop ---------- */

const started = performance.now();
let last = started;

function frame(now) {
  const tms = now - started;
  if (!reduceMotion && !STILL) shake(tms);
  // fixed small steps, however the frames fall
  let dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  stepLetters(dt);
  const STEP = 1 / 120;
  while (dt > 1e-6) { const h = Math.min(STEP, dt); stepPages(h); dt -= h; }
  draw();   // the letters are drawn within it, among the pages
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
