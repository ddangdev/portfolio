/* aina-moana: Magic Island, Honolulu, as a field of dots.
   Every dot is a point sampled on a 4 m grid from OpenStreetMap (see scripts/build_dots.py): grass,
   sand or paving. The ocean is not drawn; the island floats on black. It is seen from straight
   above through an orthographic camera, so the grid stays perfectly even. The build turns the map
   so its long east edge - the harbour side - stands straight up the screen, about 15 degrees off
   north, and samples the grid after turning so the rows of dots run straight across. Every dot is
   one electric mint (owner's call, 2026-10-30); the grass, sand and paving classes are still in the
   data but no longer coloured apart. The whole field is one THREE.Points draw call; a small shader colours it and
   draws each dot as a soft round light.

   Contents
     1  setup      renderer, scene, camera
     2  shaders    one colour, round dots, and the lamps' pools of light
     3  data       load the grid, build the geometry
     4  flicker    each lamp lights 12 to 16 of its nearest dots, re-rolled constantly; and every
                   5 to 9 s one lamp cuts out for 3 to 6 s and stutters back on a ramping spring
     5  people     walkers wandering the island, and runners in groups on the run route
     6  loop       the build, the flicker and the walking
*/
import * as THREE from 'three';

const stage = document.getElementById('stage');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const UNIT = 10;          // metres per scene unit, so the island is about 50 x 90 units
const DOT_FILL = 0.8;     // dot diameter as a share of the grid spacing
// The build (owner's call, 2026-10-30): on load the island assembles from the bottom up. A wave
// sweeps from the southern tip to the top, slowly at first and faster as it spreads. Each dot it
// reaches flickers on - fast and dim at first, then slower, steadier and brighter - and settles into
// place on its own clock, so the island eases in rather than snapping on at once.
const BUILD_MS = 4400;
const FADE_MS = 500;      // the walkers fade in once the island is built
const PADDING = 1.1;      // breathing room around the island, as a multiple of its size

/* ---------- 1. setup ---------- */

// Transparent where nothing is drawn, so the title behind the canvas shows through the gaps.
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Straight down from above, with the camera's "up" pointing -z, so the data's north is up the screen.
// Orthographic: no perspective, so every row of dots stays straight and evenly spaced.
const camera = new THREE.OrthographicCamera();
camera.up.set(0, 0, -1);
camera.position.set(0, 200, 0);
camera.lookAt(0, 0, 0);

// No drag, pan or zoom (owner's call, 2026-10-30): the board is a fixed composition, and the island
// stays exactly where it is laid out.

const island = { halfW: 25, halfD: 45 };   // replaced by the real extent once the data loads
let pixelsPerUnit = 1;

// Sized to the board (see style.css), not the window: the composition keeps one shape at any size.
function fit() {
  const w = stage.clientWidth || window.innerWidth;
  const h = stage.clientHeight || window.innerHeight;
  const aspect = w / h;
  renderer.setSize(w, h, false);
  // Fit whichever of the island's width or depth is the tighter squeeze for this screen.
  const halfH = Math.max(island.halfD, island.halfW / aspect) * PADDING;
  const halfW = halfH * aspect;
  Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH, near: 1, far: 1000 });
  camera.updateProjectionMatrix();
  pixelsPerUnit = (h * renderer.getPixelRatio()) / (2 * halfH);
}

/* ---------- 2. shaders ---------- */

// Electric mint, oklch(0.88 0.192 162): the most saturated mint an sRGB screen can show at this
// lightness. Chosen 2026-10-30 from rendered samples, over the pastel (#A8E6B8), which read washed
// out on black, and a softer vivid mint (#46F3A9).
const DOT_COLOR = 0x0bfdb0;

// The lights: eight lamps down the harbour side (see build_dots.py). A lamp does not glow on its
// own; it colours the dots around it, the way a lamp pools warm light on grass. Each lamp lights a
// set number of its nearest dots - re-rolled between 12 and 16, independently per lamp, every 450 to
// 1400 ms - so the pools breathe like live flames (owner's call, 2026-10-30). The nearest are fully
// lamp-coloured; the furthest of the set are tinted less. The lamp's own dot is a little larger.
// Warm lamplight, oklch(0.96 0.08 95): a pale yellow that sits beside electric mint on the wheel, so
// it belongs with the dots while still reading as light. Chosen 2026-10-30 from rendered samples.
const LIGHT_COLOR = 0xfff2b5;
const LIT_MIN = 12;           // dots each lamp lights, at least...
const LIT_MAX = 16;           // ...and at most
const FLICKER_MS = [450, 1400];  // how long each count holds before the next roll (slowed from 150-600)
const EDGE_TINT = 0.4;        // how lit the furthest dot of the set is (the nearest are fully lit)
const LAMP_SIZE = 1.35;       // the lamp's own dot, relative to a dot

// The blink (owner's call, 2026-10-30): every 5 to 9 seconds one lamp, picked at random, cuts out,
// stays dark for a random 3 to 6 seconds, then stutters back - a couple of slow blinks, then quicker
// ones, until it holds steady, about 1.7 s. The stutter's timing comes from a spring: released from "off", with its stiffness ramping up as it goes,
// so each swing is quicker than the last while damping winds it down. The lamp is dark while the
// spring is on the "off" side of rest and lit while it is on the other. Tuned offline:
// blinks of 0.38, 0.14, 0.08, 0.07 s ... down to 0.02 s.
const BLINK_EVERY_MS = [5000, 9000];   // how often a lamp goes out
const OUT_MS = [3000, 6000];   // how long a lamp stays dark before it sputters back
const BLINK_SPRING = { slowHz: 0.6, fastHz: 12, rampS: 1.5, rampPower: 3, damping: 2.2, settle: 0.035 };
const LAMP_OFF = 0.12;        // how bright a lamp is while out: an ember, not nothing

const uniforms = {
  // Stored as-is, not converted to linear: this shader writes its colour straight to the screen with
  // no sRGB step, so a converted value would land darker than the hex says.
  uColor: { value: new THREE.Color().setHex(DOT_COLOR, THREE.LinearSRGBColorSpace) },
  uFade: { value: reduceMotion ? 1 : 0 },    // the walkers' fade-in
  uBuild: { value: reduceMotion ? 1 : 0 },   // 0 -> 1 over the build; 1 is the island fully on
  uDepth: { value: 45 },                     // half the island's height, set on load
  uSize: { value: 0.4 },   // set from the data's spacing on load
  uScale: { value: 1 },   // device pixels per scene unit, zoom included
  uLightColor: { value: new THREE.Color().setHex(LIGHT_COLOR, THREE.LinearSRGBColorSpace) },
  uTime: { value: 0 },     // seconds, wrapped; drives the small dots' flicker
};

// The small dots flicker (owner's call, 2026-10-30): each one, on its own random clock, keeps popping
// back up to full size and dropping to small again - constantly, all of them. Every dot gets a random
// seed; the shader cuts time into slots of a per-dot length and, in each slot, decides from the seed
// whether the dot is up or down. The numbers below are the slot rate range and the share of slots up.
const SMALL_FLICKER = { slotsPerSecond: [0.3, 0.9], upShare: 0.4 };   // slowed twice the same day: 2.5-7, then 0.7-2

const material = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  // Additive colour, so dots read as points of light and crowd into glow where the field is dense.
  // Alpha adds at full strength rather than squared (three's AdditiveBlending squares it), so over
  // the see-through canvas each dot is properly opaque and covers the title behind it.
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.SrcAlphaFactor,
  blendDst: THREE.OneFactor,
  blendSrcAlpha: THREE.OneFactor,
  blendDstAlpha: THREE.OneFactor,
  vertexShader: /* glsl */ `
    attribute float aSize;    // 1, or 1/phi on the scattered smaller edge dots
    attribute float aLit;     // 0..1, how much lamplight this dot is catching right now
    attribute float aDim;     // 0..1, how far this dot is dimmed (only a lamp that is out)
    attribute float aSeed;    // 0..1, random per dot: its flicker clock
    uniform vec3 uColor;
    uniform vec3 uLightColor;
    uniform float uBuild;
    uniform float uDepth;
    uniform float uSize;
    uniform float uScale;
    uniform float uTime;
    varying vec3 vColor;
    varying float vAlpha;

    float hash(float x) { return fract(sin(x * 127.1) * 43758.5453); }

    void main() {
      vColor = mix(uColor, uLightColor, aLit);

      // The build. The wave reaches this dot at 'arrives' (0 at the bottom of the island, about
      // 0.65 at the top, with a little scatter so the front is not a ruled line). It accelerates:
      // a dot a share r of the way up is reached at r^0.45, so it creeps out of the tip and then
      // spreads ever faster. From then each dot settles on its own clock over 'settle': it starts
      // flickering fast and dim, and flickers less often, slower and brighter until it holds - so
      // the island eases into place in a long, staggered tail rather than locking on at once.
      float rise = clamp((uDepth - position.z) / (2.0 * uDepth), 0.0, 1.0);
      float arrives = pow(rise, 0.45) * 0.6 + hash(aSeed * 57.3) * 0.05;
      float settle = mix(0.22, 0.35, hash(aSeed * 23.9));   // arrives + settle never passes 1
      float on = 1.0;
      if (uBuild < 1.0) {
        float age = (uBuild - arrives) / settle;
        if (age < 0.0) on = 0.0;
        else if (age < 1.0) {
          float rate = mix(14.0, 4.0, age);                    // fast flicker at first, slower as it settles
          float slot = floor(uTime * rate + aSeed * 31.0);
          float chance = mix(0.2, 1.0, smoothstep(0.0, 1.0, age));   // on more and more of the time
          on = step(hash(slot * 0.71 + aSeed * 7.13), chance) * mix(0.45, 1.0, age);   // and brighter
        }
      }
      vAlpha = 0.95 * on * (1.0 - aDim);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      float s = aSize;
      if (aSize < 0.999) {
        float rate = mix(${SMALL_FLICKER.slotsPerSecond[0].toFixed(2)}, ${SMALL_FLICKER.slotsPerSecond[1].toFixed(2)}, hash(aSeed * 91.7));
        float slot = floor(uTime * rate + aSeed * 13.0);
        if (hash(slot * 0.37 + aSeed * 101.3) < ${SMALL_FLICKER.upShare.toFixed(2)}) s = 1.0;
      }
      gl_PointSize = uSize * s * uScale;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.36, d));
    }`,
});

// People (owner's call, 2026-10-30): a handful of walkers wandering the island. Tangerine,
// oklch(0.72 0.18 50): warm, so they read as alive against the cool mint land, and saturated enough
// to stand clear of the pale yellow lamps. Tried after hibiscus pink (#FE4986).
const PERSON_COLOR = 0xfa7c20;
const PERSON_SIZE = 1.05;   // the black disc that hides the dot underneath, a touch wider than a dot
const PEOPLE = {
  count: 10,
  speed: 0.3,          // scene units a second - 3 m/s, a brisk walk sped up a little so it reads
  pauseS: [0.6, 4],    // people stop now and then: to look, to talk, to sit
  legUnits: [5, 16],   // how far each walk goes before the next stop (50-160 m)
};

const personMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: new THREE.Color().setHex(PERSON_COLOR, THREE.LinearSRGBColorSpace) },
    uFade: uniforms.uFade,
    uSize: uniforms.uSize,
    uScale: uniforms.uScale,
  },
  transparent: true,
  depthWrite: false,
  // Ordinary blending, not additive. A walker is a small dot (owner's call, 2026-10-30): the same
  // 1/phi size as the scattered small dots, in tangerine. It covers the mint dot it stands on with
  // black, so that grid point simply reads as a small orange dot.
  vertexShader: /* glsl */ `
    uniform float uSize;
    uniform float uScale;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(0.0, 0.5, 0.0), 1.0);
      gl_PointSize = uSize * ${PERSON_SIZE.toFixed(2)} * uScale;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uFade;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float figure = 1.0 - smoothstep(0.27, 0.30, d);   // 1/phi of a dot across (0.5 / phi = 0.309)
      float edge = smoothstep(0.5, 0.47, d);          // black over the mint dot underneath
      gl_FragColor = vec4(uColor * figure, uFade * edge);
    }`,
});

/* ---------- 3. data ---------- */

async function load() {
  const res = await fetch('./data/dots.json');
  if (!res.ok) throw new Error(`dots.json: HTTP ${res.status}`);
  const data = await res.json();
  const { dots, stride } = data;
  const n = dots.length / stride;
  uniforms.uSize.value = (data.spacing / UNIT) * DOT_FILL;


  const position = new Float32Array(n * 3);
  const size = new Float32Array(n);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < n; i++) {
    // The build already turned the map upright, so "north" in the data is up the screen (-z).
    const x = dots[i * stride] / UNIT;
    const z = -dots[i * stride + 1] / UNIT;
    position[i * 3] = x;
    position[i * 3 + 2] = z;
    size[i] = stride > 4 ? dots[i * stride + 4] : 1;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  }
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  for (let i = 0; i < n; i++) {
    position[i * 3] -= cx;
    position[i * 3 + 2] -= cz;
  }
  const halfW = (maxX - minX) / 2;
  const halfD = (maxZ - minZ) / 2;
  uniforms.uDepth.value = halfD;

  const lit = new THREE.BufferAttribute(new Float32Array(n), 1);
  lit.setUsage(THREE.DynamicDrawUsage);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geometry.setAttribute('aLit', lit);
  geometry.setAttribute('aDim', new THREE.BufferAttribute(new Float32Array(n), 1));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(Float32Array.from({ length: n }, () => Math.random()), 1));
  scene.add(new THREE.Points(geometry, material));

  const lights = data.lights || [];
  const count = lights.length / 2;
  if (count) {
    const spacing = data.spacing / UNIT;
    const lampPosition = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = lights[i * 2] / UNIT - cx;
      const z = -lights[i * 2 + 1] / UNIT - cz;
      lampPosition[i * 3] = x;
      lampPosition[i * 3 + 2] = z;
      lamps.push({ rings: ringsAround(position, n, x, z, spacing), indices: [], weights: [], next: 0, bright: 1, outUntil: 0, spring: null });
    }
    // The lamp itself: drawn with the dots' own shader, fully lit, at LAMP_SIZE dots across.
    const lampGeometry = new THREE.BufferGeometry();
    lampGeometry.setAttribute('position', new THREE.BufferAttribute(lampPosition, 3));
    lampGeometry.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(count).fill(LAMP_SIZE), 1));
    lampLit = new THREE.BufferAttribute(new Float32Array(count).fill(1), 1);
    lampDim = new THREE.BufferAttribute(new Float32Array(count), 1);
    lampLit.setUsage(THREE.DynamicDrawUsage);
    lampDim.setUsage(THREE.DynamicDrawUsage);
    lampGeometry.setAttribute('aLit', lampLit);
    lampGeometry.setAttribute('aDim', lampDim);
    // Seeded like the dots so the lamps flicker out of step during the build; at LAMP_SIZE they never
    // take part in the small dots' size flicker.
    lampGeometry.setAttribute('aSeed', new THREE.BufferAttribute(Float32Array.from({ length: count }, () => Math.random()), 1));
    scene.add(new THREE.Points(lampGeometry, material));
    litAttribute = lit;
    for (const lamp of lamps) roll(lamp, performance.now());
  }

  // Which grid points a walker may stand on, keyed by grid step: every dot of land, but not the water
  // and not a lamp post (owner's call, 2026-10-30) - the lamps were never added to the dots, and are
  // deliberately left out here.
  const step = data.spacing / UNIT;
  const cellKey = (x, z) => `${Math.round(x / step)},${Math.round(z / step)}`;
  const land = new Set();
  const landPoints = [];
  for (let i = 0; i < n; i++) {
    land.add(cellKey(position[i * 3], position[i * 3 + 2]));
    landPoints.push([position[i * 3], position[i * 3 + 2]]);
  }
  ground = { land, landPoints, cellKey, step };
  addPeople();
  try {
    const res = await fetch('./data/run-route.json');
    if (res.ok) addRunners((await res.json()).points, cx, cz);
  } catch (err) {
    console.warn('aina-moana: no run route', err);
  }

  Object.assign(island, { halfW, halfD });
  fit();
}

/* ---------- 4. the flicker ---------- */

const lamps = [];
let litAttribute = null;
let lampLit = null;
let lampDim = null;
let nextBlink = Infinity;   // booked once the island has faded in

// A lamp's neighbours, grouped into rings of equal distance (on a square grid, the dots around a
// point come in rings of 4 or 8). A count like 13 cuts a ring part-way, so which of that ring's
// dots light is decided at random on each roll - the pool's shape shifts as well as its size.
function ringsAround(position, n, x, z, spacing) {
  const reach = (spacing * 3.2) ** 2;
  const byDistance = new Map();
  for (let i = 0; i < n; i++) {
    const dx = position[i * 3] - x;
    const dz = position[i * 3 + 2] - z;
    const d2 = dx * dx + dz * dz;
    if (d2 > reach || d2 < 1e-6) continue;
    const key = Math.round(d2 / (spacing * spacing));   // whole grid steps squared: 1, 2, 4, 5, 8...
    if (!byDistance.has(key)) byDistance.set(key, []);
    byDistance.get(key).push(i);
  }
  return [...byDistance.keys()].sort((a, b) => a - b).map((key) => ({ steps: Math.sqrt(key), indices: byDistance.get(key) }));
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Light this lamp's nearest N dots, N between LIT_MIN and LIT_MAX, and book the next roll.
function roll(lamp, now) {
  const values = litAttribute.array;
  for (const i of lamp.indices) values[i] = 0;
  const want = reduceMotion ? Math.round((LIT_MIN + LIT_MAX) / 2) : LIT_MIN + Math.floor(Math.random() * (LIT_MAX - LIT_MIN + 1));
  const chosen = [];
  for (const ring of lamp.rings) {
    if (chosen.length >= want) break;
    for (const i of shuffle([...ring.indices]).slice(0, want - chosen.length)) chosen.push({ i, steps: ring.steps });
  }
  const far = chosen.length ? chosen[chosen.length - 1].steps : 1;
  // nearest ring fully lit, furthest ring at EDGE_TINT
  lamp.weights = chosen.map(({ steps }) => 1 - (1 - EDGE_TINT) * (far > 1 ? (steps - 1) / (far - 1) : 0));
  lamp.indices = chosen.map(({ i }) => i);
  lamp.next = now + FLICKER_MS[0] + Math.random() * (FLICKER_MS[1] - FLICKER_MS[0]);
  paint(lamp);
}

// Write a lamp's pool and its own dot at its current brightness.
function paint(lamp) {
  const values = litAttribute.array;
  lamp.indices.forEach((i, k) => { values[i] = lamp.weights[k] * lamp.bright; });
  litAttribute.needsUpdate = true;
  const n = lamps.indexOf(lamp);
  lampLit.array[n] = lamp.bright;
  lampDim.array[n] = 1 - lamp.bright;
  lampLit.needsUpdate = true;
  lampDim.needsUpdate = true;
}

// Cut one lamp out. It stays dark for OUT_MS, then the spring brings it back (see tick).
function blink(now) {
  const idle = lamps.filter((lamp) => !lamp.spring && !lamp.outUntil);
  if (idle.length) {
    const lamp = idle[Math.floor(Math.random() * idle.length)];
    lamp.outUntil = now + OUT_MS[0] + Math.random() * (OUT_MS[1] - OUT_MS[0]);
    lamp.bright = LAMP_OFF;
    paint(lamp);
  }
  nextBlink = now + BLINK_EVERY_MS[0] + Math.random() * (BLINK_EVERY_MS[1] - BLINK_EVERY_MS[0]);
}

// Advance a blinking lamp's spring by dt seconds, in small fixed steps so the fast end stays stable.
function stepBlink(lamp, dt) {
  const { slowHz, fastHz, rampS, rampPower, damping, settle } = BLINK_SPRING;
  const sp = lamp.spring;
  const kSlow = (2 * Math.PI * slowHz) ** 2;
  const kFast = (2 * Math.PI * fastHz) ** 2;
  let k = kSlow;
  for (let left = dt; left > 1e-6; left -= 1 / 240) {
    const h = Math.min(1 / 240, left);
    k = kSlow + (kFast - kSlow) * Math.min(1, sp.t / rampS) ** rampPower;
    sp.v += (-k * sp.x - damping * sp.v) * h;
    sp.x += sp.v * h;
    sp.t += h;
  }
  const settled = Math.hypot(sp.x, sp.v / Math.sqrt(k)) < settle;
  lamp.bright = settled || sp.x <= 0 ? 1 : LAMP_OFF;
  if (settled) lamp.spring = null;
  paint(lamp);
}

/* ---------- 5. people ---------- */

let ground = null;
let peopleAttribute = null;
const walkers = [];

const between = ([lo, hi]) => lo + Math.random() * (hi - lo);

// True when every point along the straight line from a to b is walkable ground: a walker never
// crosses the lagoon, steps off the shore or walks onto a lamp post. Checked every quarter grid step,
// fine enough that a path cannot clip the corner of a forbidden dot between two samples.
function onLand(ax, az, bx, bz) {
  const length = Math.hypot(bx - ax, bz - az);
  const samples = Math.max(1, Math.ceil(length / (ground.step * 0.25)));
  for (let k = 0; k <= samples; k++) {
    const t = k / samples;
    if (!ground.land.has(ground.cellKey(ax + (bx - ax) * t, az + (bz - az) * t))) return false;
  }
  return true;
}

// Choose the walker's next destination: a land point a walk's length away, reachable in a
// straight line over land. If nothing qualifies after a few tries, it stays put a little longer.
function nextLeg(walker) {
  for (let tries = 0; tries < 30; tries++) {
    const angle = Math.random() * Math.PI * 2;
    const reach = between(PEOPLE.legUnits);
    const tx = walker.x + Math.cos(angle) * reach;
    const tz = walker.z + Math.sin(angle) * reach;
    if (onLand(walker.x, walker.z, tx, tz)) {
      walker.tx = tx;
      walker.tz = tz;
      return;
    }
  }
  walker.wait = between(PEOPLE.pauseS);
}

function addPeople() {
  const pts = ground.landPoints;
  for (let i = 0; i < PEOPLE.count; i++) {
    const [x, z] = pts[Math.floor(Math.random() * pts.length)];
    const walker = { x, z, tx: x, tz: z, wait: Math.random() * 2 };
    walkers.push(walker);
  }
  peopleAttribute = new THREE.BufferAttribute(new Float32Array(PEOPLE.count * 3), 3);
  peopleAttribute.setUsage(THREE.DynamicDrawUsage);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', peopleAttribute);
  const points = new THREE.Points(geometry, personMaterial);
  points.frustumCulled = false;   // the walkers move; their bounds are never recomputed
  scene.add(points);
  placePeople();
}

// A walker is drawn on whichever grid dot it is nearest, not where it actually is, so it moves by
// hopping from dot to dot like a figure on an LED board (owner's call, 2026-10-30). Underneath, the
// walk is still smooth; only the drawing snaps.
function placePeople() {
  const snap = (v) => Math.round(v / ground.step) * ground.step;
  walkers.forEach((w, i) => peopleAttribute.setXYZ(i, snap(w.x), 0, snap(w.z)));
  peopleAttribute.needsUpdate = true;
}

function walk(dt) {
  for (const w of walkers) {
    if (w.wait > 0) {
      w.wait -= dt;
      if (w.wait <= 0) nextLeg(w);
      continue;
    }
    const dx = w.tx - w.x;
    const dz = w.tz - w.z;
    const left = Math.hypot(dx, dz);
    const stride = PEOPLE.speed * dt;
    if (left <= stride) {
      w.x = w.tx;
      w.z = w.tz;
      w.wait = between(PEOPLE.pauseS);   // arrived: stop for a moment
    } else {
      w.x += (dx / left) * stride;
      w.z += (dz / left) * stride;
    }
  }
  placePeople();
}

// Runners (owner's call, 2026-10-30): groups of one to four running the owner's route (traced from
// their red line into data/run-route.json, closed into a loop along the top edge). A group runs as a
// formation - pairs side by side, trios two abreast with one behind, quads two by two - at its own
// pace, from its own start, so groups lap and pass each other. Same small orange dot as the walkers,
// hopping dot to dot, but over three times as fast. Never on a lamp post: the route runs down the
// lamp column, and a runner who would land on a lamp steps to the nearest dot beside it.
const RUN = {
  groups: [1, 2, 3, 4, 1, 2, 3, 1, 2],
  speed: 1.0,          // scene units a second (10 m/s, sped up like the walkers)
  paceSpread: 0.15,    // each group up to 15% faster or slower
};
const FORMATIONS = {   // [sideways, back] in dots; sideways is to the runner's left
  1: [[0, 0]],
  2: [[-0.6, 0], [0.6, 0]],
  3: [[-0.6, 0], [0.6, 0], [0, -1.3]],
  4: [[-0.6, 0], [0.6, 0], [-0.6, -1.3], [0.6, -1.3]],
};

let route = null;   // { pts, cum, length } in scene units
let runnerAttribute = null;
const runGroups = [];

function addRunners(points, cx, cz) {
  const pts = points.map(([x, y]) => [x / UNIT - cx, -y / UNIT - cz]);
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  route = { pts, cum, length: cum[pts.length] };
  let total = 0;
  for (const size of RUN.groups) {
    runGroups.push({ size, first: total, s: Math.random() * route.length, speed: RUN.speed * (1 + (Math.random() * 2 - 1) * RUN.paceSpread) });
    total += size;
  }
  runnerAttribute = new THREE.BufferAttribute(new Float32Array(total * 3), 3);
  runnerAttribute.setUsage(THREE.DynamicDrawUsage);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', runnerAttribute);
  const points3 = new THREE.Points(geometry, personMaterial);
  points3.frustumCulled = false;
  scene.add(points3);
  placeRunners();
}

// The point a distance s along the loop, and the route's direction there.
function along(s) {
  const { pts, cum, length } = route;
  s = ((s % length) + length) % length;
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cum[mid] <= s) lo = mid; else hi = mid - 1;
  }
  const a = pts[lo];
  const b = pts[(lo + 1) % pts.length];
  const seg = cum[lo + 1] - cum[lo] || 1;
  const t = (s - cum[lo]) / seg;
  return { x: a[0] + (b[0] - a[0]) * t, z: a[1] + (b[1] - a[1]) * t, tx: (b[0] - a[0]) / seg, tz: (b[1] - a[1]) / seg };
}

// The dot a person stands on: the grid dot under them, or - if that is water or a lamp post - the
// nearest walkable dot around it.
function standOn(x, z) {
  const st = ground.step;
  const gx = Math.round(x / st);
  const gz = Math.round(z / st);
  let best = null;
  let bestD = Infinity;
  for (let r = 0; r <= 2 && !best; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        const px = (gx + dx) * st;
        const pz = (gz + dz) * st;
        if (!ground.land.has(ground.cellKey(px, pz))) continue;
        const d2 = (px - x) ** 2 + (pz - z) ** 2;
        if (d2 < bestD) { bestD = d2; best = [px, pz]; }
      }
    }
  }
  return best || [gx * st, gz * st];
}

function placeRunners() {
  const st = ground.step;
  for (const g of runGroups) {
    FORMATIONS[g.size].forEach(([side, back], k) => {
      const q = along(g.s + back * st);
      const [x, z] = standOn(q.x - q.tz * side * st, q.z + q.tx * side * st);
      runnerAttribute.setXYZ(g.first + k, x, 0, z);
    });
  }
  runnerAttribute.needsUpdate = true;
}

function run(dt) {
  for (const g of runGroups) g.s += g.speed * dt;
  placeRunners();
}

/* ---------- 6. loop ---------- */

let started = 0;
let lastTick = performance.now();

function tick() {
  if (!reduceMotion && started) {
    const t = performance.now() - started;
    uniforms.uBuild.value = Math.min(1, t / BUILD_MS);
    // the walkers arrive once the island is built
    const k = Math.min(1, Math.max(0, (t - BUILD_MS) / FADE_MS));
    uniforms.uFade.value = 1 - Math.pow(1 - k, 3);
  }
  // Reduced motion: each lamp holds one steady pool, never re-rolls and never blinks.
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTick) / 1000);
  lastTick = now;
  if (!reduceMotion && litAttribute) {
    for (const lamp of lamps) if (now >= lamp.next) roll(lamp, now);
    if (now >= nextBlink) blink(now);
    for (const lamp of lamps) {
      if (lamp.outUntil && now >= lamp.outUntil) {
        lamp.outUntil = 0;
        lamp.spring = { x: 1, v: 0, t: 0 };   // released from "off": the stutter back
      }
      if (lamp.spring) stepBlink(lamp, dt);
    }
  }
  // Reduced motion: the walkers and runners stand where they are.
  if (!reduceMotion && peopleAttribute) walk(dt);
  if (!reduceMotion && runnerAttribute) run(dt);
  // Wrapped, so the flicker's hash stays precise on phones however long the page is open.
  if (!reduceMotion) uniforms.uTime.value = (now / 1000) % 600;
  // Dots are a fixed size on the ground, so they grow with the zoom.
  uniforms.uScale.value = pixelsPerUnit * camera.zoom;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

fit();
window.addEventListener('resize', fit);
new ResizeObserver(fit).observe(stage);

load()
  .then(() => {
    started = performance.now();
    nextBlink = started + BUILD_MS + FADE_MS + BLINK_EVERY_MS[0] + Math.random() * (BLINK_EVERY_MS[1] - BLINK_EVERY_MS[0]);
  })
  .catch((err) => console.error('aina-moana:', err));
requestAnimationFrame(tick);
