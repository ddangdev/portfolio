/* hanging-book: the coffee bean. In place of the book (owner's call, 2026-10-31), a brown coffee bean
   floats on the page, and letters - from "ddanghnl", "studio", "hawaii", "honolulu" - seep out from under
   its edge, then drift slowly away as if in space, and fade.

   Sections:
     1  the bean       size, colours, place
     2  the words      which, how often, how they drift
     3  drawing        the hand-drawn wobble, the shadow, the bean and its crease, the words
     4  loop
   index.html loads this or the book (main.js) by ?subject=; this is the default. */

/* ---------- 1. the bean ---------- */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const C = {
  bean: '#5a3520',
  word: '#2a1a10',
  shadow: 'rgba(60, 38, 20, 0.22)',
};
const PAPER = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#f2ece3';
const TURN = (-32 * Math.PI) / 180;   // the bean lies at an angle
const WIDE = 0.64;                    // its width against its length

const canvas = document.getElementById('book');
const ctx = canvas.getContext('2d');
let W = 0, H = 0, DPR = 1, R = 1, CX = 0, CY = 0, shadowSprite = null;

function resize() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  R = Math.min(W, H) * 0.2 * DPR;        // half the bean's length
  CX = (W / 2) * DPR; CY = (H * 0.34) * DPR;
  shadowSprite = null; wordCache.clear();
}
const wordCache = new Map();
addEventListener('resize', resize);
resize();

// a point on the bean, in its own frame (u along its length, v across, both -1..1), on the screen
let bob = 0, sway = 0;
function onBean(u, v) {
  const x = u * R, y = v * R * WIDE, a = TURN + sway;
  return [CX + x * Math.cos(a) - y * Math.sin(a), CY + bob + x * Math.sin(a) + y * Math.cos(a)];
}


/* ---------- 2. the words ---------- */

// single letters now, not whole words (owner's call): the letters of these, picked at random
const WORDS = [...('ddanghnl' + 'studio' + 'hawaii' + 'honolulu')];
const RATE = 3;                   // letters a second
const LIFE = [10, 15];            // seconds before a word has faded away
const SIZES = [13, 15, 17, 20];   // CSS pixels
// They leave the crease with a push that eases off into a slow drift, so they clear the bean quickly and
// then wander as if in space: DRIFT_DRAG slows them, down to about DRIFT_SPEED.
const DRIFT_DRAG = 0.55, DRIFT_SPEED = 16;
const words = [];
let owed = 0;

function spawnWord() {
  // from a point on the bean's edge, pushed straight out from it
  const t = Math.random() * Math.PI * 2;
  const [x, y] = onBean(Math.cos(t) * 0.97, Math.sin(t) * 0.97 * (1 + 0.07 * Math.cos(t)));
  const out = Math.atan2(y - CY - bob, x - CX) + (Math.random() - 0.5) * 0.5;
  const speed = (60 + Math.random() * 50) * DPR;   // a push out of the bean, eased away by DRIFT_DRAG
  words.push({
    text: WORDS[Math.floor(Math.random() * WORDS.length)],
    x, y,
    vx: Math.cos(out) * speed, vy: Math.sin(out) * speed + 6 * DPR,
    rot: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.7,
    size: SIZES[Math.floor(Math.random() * SIZES.length)],
    age: 0, life: LIFE[0] + Math.random() * (LIFE[1] - LIFE[0]),
  });
}

function stepWords(dt) {
  if (!reduceMotion) {
    owed += RATE * dt;
    while (owed >= 1) { spawnWord(); owed -= 1; }
  }
  for (const w of words) {
    w.age += dt;
    const sp = Math.hypot(w.vx, w.vy), floor = DRIFT_SPEED * DPR;
    if (sp > floor) { const k = Math.max(floor / sp, 1 - DRIFT_DRAG * dt); w.vx *= k; w.vy *= k; }
    w.vy += 5 * DPR * dt;          // a whisper of gravity
    w.x += w.vx * dt; w.y += w.vy * dt; w.rot += w.spin * dt;
  }
  let keep = 0;
  for (const w of words) if (w.age < w.life && w.y < canvas.height + 60) words[keep++] = w;
  words.length = keep;
}

/* ---------- 3. drawing ---------- */

// the hand-drawn wobble: edges cut into short steps, each nudged by a fixed smooth field over the screen
function nudge(x, y) {
  const a = 1.4 * DPR, u = x / DPR, v = y / DPR;
  return [
    x + a * (Math.sin(v * 0.021 + u * 0.007) + 0.6 * Math.sin(v * 0.053 - u * 0.017 + 1.3)),
    y + a * (Math.sin(u * 0.019 - v * 0.009 + 2.1) + 0.6 * Math.sin(u * 0.047 + v * 0.021)),
  ];
}
function wobbly(points, closed) {
  ctx.beginPath();
  const step = 9 * DPR, n = points.length, last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const [x0, y0] = points[i], [x1, y1] = points[(i + 1) % n];
    const k = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let j = i === 0 ? 0 : 1; j <= k; j++) {
      const [x, y] = nudge(x0 + ((x1 - x0) * j) / k, y0 + ((y1 - y0) * j) / k);
      if (i === 0 && j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
  }
  if (closed) ctx.closePath();
}

function drawShadow() {
  if (!shadowSprite) {
    const rx = R * 1.05, ry = R * 0.28, pad = 40 * DPR;
    shadowSprite = document.createElement('canvas');
    shadowSprite.width = Math.ceil(2 * (rx + pad)); shadowSprite.height = Math.ceil(2 * (ry + pad));
    const g = shadowSprite.getContext('2d');
    g.filter = `blur(${16 * DPR}px)`;
    g.beginPath(); g.ellipse(shadowSprite.width / 2, shadowSprite.height / 2, rx, ry, 0, 0, Math.PI * 2);
    g.fillStyle = C.shadow; g.fill();
  }
  const lift = 1 - bob / (R * 2);
  const w = shadowSprite.width * lift, h = shadowSprite.height * lift;
  ctx.drawImage(shadowSprite, CX - w / 2, CY + R * 1.55 - h / 2, w, h);
}

// The bean as a silhouette (owner's call, 2026-10-31): one flat brown shape, no shading, no outline and
// no line down the middle.
function drawBean() {
  const outline = Array.from({ length: 64 }, (_, i) => {
    const t = (i / 64) * Math.PI * 2;
    return onBean(Math.cos(t), Math.sin(t) * (1 + 0.07 * Math.cos(t)));
  });
  wobbly(outline, true);
  ctx.fillStyle = C.bean; ctx.fill();
  // no crease: a plain silhouette (owner's call)
}

// each word at each size drawn once, bold, in wet ink, and stamped from then on
function wordSprite(text, size) {
  const key = `${text}|${size}`;
  let c = wordCache.get(key);
  if (!c) {
    const px = size * DPR;
    const font = `700 ${px.toFixed(1)}px Georgia, 'Times New Roman', serif`;
    c = document.createElement('canvas');
    const m = c.getContext('2d'); m.font = font;
    c.width = Math.ceil(m.measureText(text).width + px); c.height = Math.ceil(px * 1.8);
    const g = c.getContext('2d');
    g.font = font; g.fillStyle = C.word; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(30, 18, 10, 0.5)'; g.shadowBlur = 2.2 * DPR;
    g.fillText(text, c.width / 2, c.height / 2);
    g.shadowBlur = 0; g.fillText(text, c.width / 2, c.height / 2);
    wordCache.set(key, c);
  }
  return c;
}

function drawWords() {
  for (const w of words) {
    // squeezes out small, fades in, and fades away at the end of its life
    const grow = Math.min(1, 0.25 + w.age / 1.1);
    const alpha = Math.min(1, w.age / 0.6, (w.life - w.age) / 4, Math.max(0, (canvas.height - w.y) / (canvas.height * 0.2)));
    if (alpha <= 0) continue;
    const s = wordSprite(w.text, w.size), co = Math.cos(w.rot) * grow, si = Math.sin(w.rot) * grow;
    ctx.globalAlpha = alpha;
    ctx.setTransform(co, si, -si, co, w.x, w.y);
    ctx.drawImage(s, -s.width / 2, -s.height / 2);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

/* ---------- 4. loop ---------- */

const started = performance.now();
let last = started;
function frame(now) {
  const t = (now - started) / 1000, dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!reduceMotion) { bob = Math.sin(t * 0.8) * 5 * DPR; sway = Math.sin(t * 0.55) * 0.025; }
  stepWords(dt);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShadow();
  drawWords();     // behind the bean, so each seems to seep out from under its edge
  drawBean();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
