/* ddanghnl-site: the wheel. After the reference the owner marked up, 2026-10-30, cut down at their
   call to the lines alone: bands of radial ticks growing denser outward, and nothing else - no rings,
   no rim, no numbers, no hub. It lies flat, seen in isometric (owner's call), and is set so far off
   the bottom-right that only an arc of those bands sweeps across the screen. The categories stand on
   the rim, past the tick ends, as posts with their names above (after the owner's sketch): the posts
   ride round with the wheel, the names stay upright. It fades in first of all, and
   the visitor turns it to get around: drag it round, scroll, or use the arrow keys. It coasts after a
   flick and settles with a category on the selector - a fixed red line across the bands - and that
   category's post turns red. What each category opens is
   still to be decided. */

import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, REPEAT, START } from './categories.js';
import Preview from '../preview/Preview.jsx';
import PageDialog from '../page/PageDialog.jsx';
import Nav from '../nav/Nav.jsx';
import Counter from '../counter/Counter.jsx';
import Walls from './Walls.jsx';
import { track, view, slug } from '../measure/measure.js';

// Every post round the wheel, in order of angle. The wheel only ever comes to rest with one of them
// on the selector, however unevenly they are spaced.
const POSTS = Array.from({ length: REPEAT }, (_, k) =>
  CATEGORIES.map((c) => ({ ...c, at: c.at + (k * 360) / REPEAT }))).flat()
  .sort((p, q) => p.at - q.at);

// Bands of ticks, as fractions of the radius, each twice as dense as the one inside it (halved
// throughout at the owner's call - too many ticks).
const BANDS = [
  { r0: 0.56, r1: 0.645, n: 12 },
  { r0: 0.645, r1: 0.73, n: 24 },
  { r0: 0.73, r1: 0.815, n: 48 },
  { r0: 0.815, r1: 0.905, n: 96 },
  { r0: 0.905, r1: 1.0, n: 192 },
];
// Isometric: the dial lies on the floor, turned 45 degrees and flattened to cos(54.74) = 0.577 tall.
const ISO = 0.57735;
const ISO_TURN = 45;

// The dial's size and place on screen. Its centre sits off the bottom-right, diagonally out from the
// screen's corner (measured on the floor), and that corner - the nearest point of the screen to the
// centre - stays just outside the innermost band, so nothing inside the bands is ever in view. The
// radius is SIZE times the screen's longer side (made smaller twice at the owner's call).
const SIZE = 0.95;     // the radius, against the screen's longer side
const CORNER = 0.62;   // the screen's bottom-right corner, as a fraction of the radius from the centre
const RAISE = 0.18;    // then lifted by this much of the screen's height (owner's call)
const SHIFT = 0.1;     // and moved right by this much of its width (owner's call)
// On a phone held upright the wheel is sized to the width instead: sized to the height it showed only
// a sliver of the rim, too little to see any page go by while turning (owner's report).
const SIZE_PORTRAIT = 1.5;
function frameFor(w, h) {
  const R = w < h ? w * SIZE_PORTRAIT : Math.max(w, h) * SIZE;
  const e = (CORNER * R) / Math.SQRT2;
  return { R, cx: w + e + SHIFT * w, cy: h + e * ISO - RAISE * h };
}

// The selector, as an angle on screen (clockwise from straight up, before the flattening): up and to
// the left of the centre, the middle of the arc in view, so a post one stop either side still shows.
const SELECT = -60;

// A rule of the site's (owner's call, 2026-11-01): the preview never runs to the right edge - the last
// tenth of the screen's width stays open, so the card sits on the page rather than filling it.
const RIGHT_FREE = 0.1;
// where the counter ends (top, dots, its path line), below which the preview may rise
const COUNTER_BOTTOM = 190;

// Flicks. The speed at release is read over the last stretch of the drag, not the last two pointer
// events - those can land a millisecond apart and turn a nudge into a spin - and a drag that has
// held still before letting go doesn't coast at all.
const FLICK_WINDOW = 90;   // ms of drag the release speed is read over
const FLICK_STALE = 70;    // ms without movement before release that cancel the coast
const MAX_SPEED = 9;       // degrees per frame
// Scrolling turns the wheel smoothly, but measured in pages rather than degrees: every page is the
// same scroll away however far round it stands, so work's wide room is no longer a long scroll
// (owner's call). The wheel follows the scroll with a little lag, so it is felt turning, and settles
// on the nearest page when the scrolling stops.
const SCROLL_PAGE = 200;   // px of scroll from one page to the next
const SCROLL_FOLLOW = 0.2; // how much of the way to the scroll the wheel catches up each frame
const SCROLL_QUIET = 160;  // ms without scrolling before it settles
const clamp = (v, m) => Math.max(-m, Math.min(m, v));

// The category posts: where they stand (just past the tick ends), and their type, which scales with
// the screen between a phone's and a desktop's.
const TAG_R = 1.025;
const tagType = (w) => {
  const size = Math.max(17, Math.min(30, w * 0.022));
  return { size, stem: size * 1.06, gap: size * 0.45 };   // stem 15% shorter at the owner's call
};

const toDeg = (rad) => (rad * 180) / Math.PI;
const mod = (v, m) => ((v % m) + m) % m;

// The rotation that puts post j on the selector, the nearest such to `near`.
const restFor = (j, near) => {
  const base = SELECT - ISO_TURN - POSTS[j].at;
  return base + 360 * Math.round((near - base) / 360);
};
// The rotation at a position counted in pages - whole numbers on a page, fractions between - running
// on round and round the wheel.
const rotAtPos = (pos) => {
  const n = POSTS.length, i = Math.floor(pos), f = pos - i;
  const a = POSTS[mod(i, n)].at, b = POSTS[mod(i + 1, n)].at;
  const angle = a + 360 * Math.floor(i / n) + f * mod(b - a, 360);
  return SELECT - ISO_TURN - angle;
};
// The position in pages of the post nearest the selector at a rotation.
const posAt = (r) => {
  const j = postAt(r);
  return j + POSTS.length * Math.round((SELECT - ISO_TURN - r - POSTS[j].at) / 360);
};
// The post nearest the selector at a rotation.
const postAt = (r) => {
  let best = 0, gap = Infinity;
  POSTS.forEach((p, j) => {
    const d = Math.abs(mod(p.at + r + ISO_TURN - SELECT + 180, 360) - 180);
    if (d < gap) { gap = d; best = j; }
  });
  return best;
};
const FIRST = POSTS.findIndex((p) => p.name === START);   // the post on the selector to begin with
// a small post: one of work's projects, or one of the notes
const small = (p) => Boolean(p.project || p.note);
const NAV = CATEGORIES.filter((c) => !small(c)).map((c) => c.name);   // the nav's pages: the main ones

export default function Wheel({ shown }) {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [frame, setFrame] = useState(() => frameFor(innerWidth, innerHeight));
  // The frame as of the latest render. Animation loops keep the paint of the render they started in,
  // so paint reads the frame from here: reading it from that render put the names where the wheel
  // was before a resize - inside the dial, while scrolling (owner's report).
  const [chosen, setChosen] = useState(FIRST);
  // The selected page, opened in the pop-up: by clicking its name or the preview, or with Enter.
  // While it is open the wheel takes no input.
  const [opened, setOpened] = useState(false);
  const openedRef = useRef(false);
  openedRef.current = opened;
  // The post the pop-up shows once it has gone on to another page (its links, its arrows): set at once,
  // so the wheel can turn there under it without the pop-up following every name it passes
  const [shownJ, setShownJ] = useState(null);
  const shut = () => { setOpened(false); setShownJ(null); };
  // opening the selected page, and how (analytics)
  const open = (how) => { track('page_open', { page: POSTS[postAt(rot.current)].name, how }); setOpened(true); };
  // A link straight to a page (owner's ask, 2026-11-04): ddanghnl.com/#contact, /#hale-build, /#notes.
  // On arrival the hash names a page by its slug (the one analytics uses, so the two agree), the wheel
  // is set to it before the first paint and the pop-up opens on it. Only on arrival: the hash is not
  // kept up to date as the wheel turns, so the address stays plain while people browse.
  useEffect(() => {
    const h = slug(decodeURIComponent(location.hash.slice(1)));   // so '#ʻāina-moana' and '#aina-moana' both land
    if (!h) return;
    const j = POSTS.findIndex((p) => slug(p.name) === h);
    if (j < 0) return;
    rot.current = restFor(j, rot.current); goal.current = j;
    paint();
    track('page_open', { page: POSTS[j].name, how: 'link' });
    setOpened(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // analytics: each page the pop-up comes to show is a page view, however it got there (a click, the
  // nav, a link, the arrows, the back arrow); the pop-up going away is a close
  const onShow = opened ? POSTS[shownJ ?? chosen].name : null;
  const wasShown = useRef(null);
  useEffect(() => {
    if (onShow) view(POSTS[shownJ ?? chosen]);
    else if (wasShown.current) track('page_close', { page: wasShown.current });
    wasShown.current = onShow;
  }, [onShow]);
  const rot = useRef(restFor(FIRST, 0));   // degrees, clockwise
  const vel = useRef(0);          // degrees per frame
  const drag = useRef(null);
  const goal = useRef(null);      // the post a step is heading for, so quick steps add up
  const raf = useRef(0);
  const spinner = useRef(null);
  const svg = useRef(null);
  const tags = useRef([]);
  const live = useRef(frame);
  live.current = frame;

  useEffect(() => {
    const onResize = () => setFrame(frameFor(innerWidth, innerHeight));
    addEventListener('resize', onResize);
    return () => removeEventListener('resize', onResize);
  }, []);

  // Draw the current rotation, and note the stop it is on. Each category's post is placed where its
  // stop's point on the rim lands on screen: turned with the dial, then laid flat in isometric.
  const paint = () => {
    spinner.current.style.transform = `rotate(${rot.current}deg)`;
    const f = live.current;
    const r = TAG_R * f.R;
    tags.current.forEach((el, j) => {
      if (!el) return;
      const a = ((POSTS[j].at + rot.current + ISO_TURN) * Math.PI) / 180;
      el.setAttribute('transform', `translate(${(f.cx + r * Math.sin(a)).toFixed(1)} ${(f.cy - ISO * r * Math.cos(a)).toFixed(1)})`);
    });
    setChosen(postAt(rot.current));
  };

  // After a release: coast with friction, then settle on the nearest stop on a light spring. Given a
  // stop to go to (the arrow keys), it skips the coast and springs straight there. The coast runs on
  // elapsed time, so it is the same on a 120 Hz screen as a 60 Hz one. Once the spring has started
  // it stays in charge: the speed it adds must never be taken for a new coast, or the wheel overshoots,
  // picks the next stop, gets kicked again, and wanders off on its own.
  const settle = (to) => {
    cancelAnimationFrame(raf.current);
    let last = performance.now();
    let springing = to !== undefined;
    const tick = (now) => {
      const f = Math.min(4, Math.max(0, (now - last) / 16.7));
      last = now;
      if (!springing && Math.abs(vel.current) > 0.15) {
        rot.current += vel.current * f;
        vel.current *= 0.93 ** f;
      } else {
        if (!springing) { springing = true; to = restFor(postAt(rot.current), rot.current); }
        const target = to;
        const d = target - rot.current;
        vel.current = vel.current * 0.6 + d * 0.18;
        rot.current += vel.current;
        if (Math.abs(d) < 0.02 && Math.abs(vel.current) < 0.02) {
          rot.current = target; vel.current = 0; paint();
          return;
        }
      }
      paint();
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  // The pointer's angle round the centre, measured on the floor: the flattening is undone first.
  const angleAt = (e) => toDeg(Math.atan2((e.clientY - live.current.cy) / ISO, e.clientX - live.current.cx));

  // A press that barely moves is a click: on the selected page's name it opens the page, on another
  // name it turns the wheel to that page.
  const CLICK_PX = 6, CLICK_MS = 500;
  const onPointerDown = (e) => {
    if (drag.current || openedRef.current) return;
    const tag = e.target.closest?.('.wheel-tag');
    const click = { x: e.clientX, y: e.clientY, t: performance.now(), tag: tag ? Number(tag.dataset.j) : null, was: postAt(rot.current) };
    goal.current = null;
    cancelAnimationFrame(raf.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    const t = performance.now();
    drag.current = { id: e.pointerId, last: angleAt(e), samples: [{ r: rot.current, t }], click };
    vel.current = 0;
  };
  const onPointerMove = (e) => {
    const g = drag.current;
    if (!g || e.pointerId !== g.id) return;
    const a = angleAt(e);
    let d = a - g.last;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    g.last = a;
    rot.current += d;
    const t = performance.now();
    g.samples.push({ r: rot.current, t });
    while (g.samples.length > 2 && t - g.samples[0].t > FLICK_WINDOW) g.samples.shift();
    paint();
  };
  const onPointerUp = (e) => {
    const g = drag.current;
    if (!g || e.pointerId !== g.id) return;
    drag.current = null;
    const t = performance.now();
    const c = g.click;
    if (c.tag !== null && Math.hypot(e.clientX - c.x, e.clientY - c.y) < CLICK_PX && t - c.t < CLICK_MS) {
      vel.current = 0;
      if (c.tag === c.was) { settle(restFor(c.was, rot.current)); open('wheel'); }
      else { goal.current = c.tag; settle(restFor(c.tag, rot.current)); track('wheel_turn', { how: 'tap', to: POSTS[c.tag].name }); }
      return;
    }
    const first = g.samples[0], last = g.samples[g.samples.length - 1];
    const span = last.t - first.t;
    const still = t - last.t > FLICK_STALE;
    vel.current = reduce || still || span < 8 ? 0 : clamp(((last.r - first.r) / span) * 16.7, MAX_SPEED);
    track('wheel_turn', { how: vel.current ? 'flick' : 'drag' });
    settle();
  };

  // One step to the next page round (the wheel turns back) or the one before, from wherever a step
  // already under way is heading. With the pop-up open (its arrows), the pop-up goes there too.
  const step = (next) => {
    const cur = goal.current ?? postAt(rot.current);
    const to = mod(cur + (next ? 1 : -1), POSTS.length);
    const here = restFor(cur, rot.current);
    const turn = next ? mod(POSTS[to].at - POSTS[cur].at, 360) : mod(POSTS[cur].at - POSTS[to].at, 360);
    const target = here + (next ? -turn : turn);
    goal.current = to;
    vel.current = 0;
    if (openedRef.current) setShownJ(to);
    if (reduce) { rot.current = target; paint(); return; }
    settle(target);
  };

  // A link in a pop-up, or the nav, to another page: an open pop-up changes over to that page (see
  // PageDialog.jsx), and the wheel turns to the nearest post of that name
  const go = (name) => {
    let to = null, at = null;
    POSTS.forEach((p, j) => {
      if (p.name !== name) return;
      const r = restFor(j, rot.current);
      if (to === null || Math.abs(r - rot.current) < Math.abs(to - rot.current)) { to = r; at = j; }
    });
    if (to === null) return;
    goal.current = at; vel.current = 0;
    if (openedRef.current) setShownJ(at);
    if (reduce) { cancelAnimationFrame(raf.current); rot.current = to; paint(); return; }
    settle(to);
  };

  // Scroll turns it page by page (see SCROLL_PAGE): the scroll moves a position counted in pages, the
  // wheel eases after it, and when the scrolling stops it springs to the nearest page.
  useEffect(() => {
    if (!shown) return undefined;
    let pos = null, quiet = 0;
    const follow = () => {
      const target = rotAtPos(pos);
      rot.current += (target - rot.current) * (reduce ? 1 : SCROLL_FOLLOW);
      paint();
      raf.current = requestAnimationFrame(follow);
    };
    const onWheel = (e) => {
      if (openedRef.current) return;   // the pop-up's own content scrolls
      // so do a page's words in the preview, when there is more of them than fits
      const words = e.target.closest?.('.preview-copy');
      if (words && words.scrollHeight > words.clientHeight) return;
      e.preventDefault();
      if (drag.current) return;
      if (pos === null) {
        cancelAnimationFrame(raf.current);
        goal.current = null;
        vel.current = 0;
        pos = posAt(rot.current);
        raf.current = requestAnimationFrame(follow);
      }
      // scrolling down goes on through the pages - about, work, its projects, contact (owner's call)
      pos += (e.deltaY + e.deltaX) / SCROLL_PAGE;
      clearTimeout(quiet);
      quiet = setTimeout(() => {
        const to = rotAtPos(Math.round(pos));
        pos = null;
        if (drag.current) return;   // a drag took over meanwhile
        cancelAnimationFrame(raf.current);
        if (reduce) { rot.current = to; paint(); return; }
        settle(to);
      }, SCROLL_QUIET);
    };
    addEventListener('wheel', onWheel, { passive: false });
    return () => { removeEventListener('wheel', onWheel); clearTimeout(quiet); };
  }, [shown]);

  // The arrow keys step page to page from anywhere on the page, not only with the wheel focused
  // (owner's call). Up and down are inverted from the scroll (owner's call too): up and right go on -
  // about, work, its projects, contact - down and left go back.
  const latestStep = useRef(step);
  latestStep.current = step;
  useEffect(() => {
    if (!shown) return undefined;
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || openedRef.current) return;
      // Enter or Space opens the selected page (on a button they press the button instead)
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button, a')) { e.preventDefault(); open('key'); return; }
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault();
      latestStep.current(e.key === 'ArrowUp' || e.key === 'ArrowRight');
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [shown]);


  // The dial's geometry, computed once per size: radial ticks for every band; a long accented white
  // line across all the bands at each main page's post (about, work, contact); and for each project,
  // one of the outer band's own ticks, lit - the project stands on the dial's small ticks, and only
  // the main pages get the long lines (owner's call).
  const { R } = frame;
  const geometry = useMemo(() => {
    const lines = [];
    BANDS.forEach((b, k) => {
      const d = [];
      for (let i = 0; i < b.n; i++) {
        const a = (i / b.n) * Math.PI * 2;
        const s = Math.sin(a), c = -Math.cos(a);
        d.push(`M${(s * b.r0 * R).toFixed(1)} ${(c * b.r0 * R).toFixed(1)}L${(s * b.r1 * R).toFixed(1)} ${(c * b.r1 * R).toFixed(1)}`);
      }
      lines.push({ k, d: d.join('') });
    });
    const radial = (at, r0, r1) => {
      const a = (at * Math.PI) / 180;
      const s = Math.sin(a), c = -Math.cos(a);
      return `M${(s * r0 * R).toFixed(1)} ${(c * r0 * R).toFixed(1)}L${(s * r1 * R).toFixed(1)} ${(c * r1 * R).toFixed(1)}`;
    };
    const outer = BANDS[BANDS.length - 1];
    const major = POSTS.filter((p) => !small(p)).map((p) => radial(p.at, BANDS[0].r0, 1));
    const minor = POSTS.filter(small).map((p) => radial(p.at, outer.r0, outer.r1));
    return { lines, major: major.join(''), minor: minor.join('') };
  }, [R]);

  // the spokes - the ticks with a post on them - as data, for the walls to stand up (only they do,
  // owner's call 2026-11-01; the bands stay flat): angle on the dial, two ends as fractions of the radius
  const ticks = useMemo(() => {
    const outer = BANDS[BANDS.length - 1];
    return POSTS.map((p) => small(p)
      ? { phi: p.at, r0: outer.r0, r1: outer.r1 }
      : { phi: p.at, r0: BANDS[0].r0, r1: 1 });
  }, []);

  const type = tagType(innerWidth);

  // The preview's box: on the page's left edge under the nav and the counter, above and clear of the
  // post resting on the selector, after the owner's sketch; its bottom edge fixed, so a page of words,
  // shorter than a film, comes down to meet it.
  const box = (() => {
    const w = innerWidth, h = innerHeight, a = (SELECT * Math.PI) / 180, r = TAG_R * R;
    const x = frame.cx + r * Math.sin(a), y = frame.cy - ISO * r * Math.cos(a);
    const reach = (1 - RIGHT_FREE) * w;
    // on a phone held upright the arc climbs steeply, so the box goes higher, clear of the next names
    const clear = w < h ? 0.22 * h : type.stem + type.gap + type.size * 0.8 + 0.045 * h;
    const bottom = y - clear;
    // its width: just under half the screen (owner's call, 2026-11-01, from a half-screen window he liked
    // the look of: the card big, on the left, the dial off to the right), up to 420 on a narrow screen;
    // never past RIGHT_FREE, the site's rule that the right of the screen stays open, and never so tall
    // that it climbs into the counter
    const left = 16, room = (bottom - COUNTER_BOTTOM) / 0.62;
    const width = Math.min(w < 900 ? 420 : 0.48 * w, reach - left, room), height = width * 0.62;
    return { left, bottom, width, height };   // the height is the most it may be: words fit theirs
  })();

  // place the posts once laid out, and again whenever the frame changes size
  useEffect(() => { paint(); }, [frame]);

  // the main page on show, for the nav and the counter: work, for one of its projects - and that
  // project, for the counter to show the path down to it
  const post = POSTS[opened ? shownJ ?? chosen : chosen];
  const current = post.project ? 'work' : post.note ? 'notes' : post.name;

  return (
    <div className={`wheel${shown ? ' is-shown' : ''}`} aria-hidden={!shown}>
      <svg ref={svg} className="wheel-svg" width="100%" height="100%"
           onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onLostPointerCapture={onPointerUp}
           tabIndex={shown ? 0 : -1}
           role="slider" aria-label="Turn the wheel to choose a page" aria-valuemin={1} aria-valuemax={POSTS.length}
           aria-valuenow={chosen + 1} aria-valuetext={POSTS[chosen].name}>
        <g transform={`translate(${frame.cx} ${frame.cy}) scale(1 ${ISO}) rotate(${ISO_TURN})`}>
          <g className="wheel-spinner" ref={spinner}>
            {geometry.lines.map(({ k, d }) => (
              <path key={k} className="wheel-band" style={{ '--k': k }} d={d} />
            ))}
            <path className="wheel-major" d={geometry.major} />
            <path className="wheel-minor" d={geometry.minor} />
          </g>
          {/* the selector: fixed while the dial turns under it, where the first post starts */}
          <path className="wheel-selector" transform={`rotate(${SELECT - ISO_TURN})`} d={`M0 ${-0.56 * R}V${-1.0 * R}`} />
        </g>
        <Walls ticks={ticks} rot={rot} frame={live} select={SELECT} />
        {POSTS.map((p, j) => {
          const { name } = p;
          // a project or a note stands smaller than a page: shorter leg, smaller name
          const k = small(p) ? 0.72 : 1;
          return (
            <g key={j} data-j={j} className={`wheel-tag${small(p) ? ' is-project' : ''}${j === chosen ? ' is-chosen' : ''}`}
               ref={(el) => { tags.current[j] = el; }}>
              <line className="wheel-tag-stem" x1="0" y1="0" x2="0" y2={-type.stem * k} />
              <text className="wheel-tag-name" x={-type.size * 0.12 * k} y={-(type.stem + type.gap) * k}
                    textAnchor="end" style={{ fontSize: `${(type.size * k).toFixed(1)}px` }}>{name}</text>
            </g>
          );
        })}
      </svg>
      <Nav items={NAV} shown={shown} onGo={go} current={current} />
      <Counter index={NAV.indexOf(current) + 1} total={NAV.length} name={current} sub={small(post) ? post.name : null} shown={shown} />
      <Preview page={POSTS[chosen]} box={box} onOpen={() => open('preview')} />
      {opened && (() => {
        const j = shownJ ?? chosen, n = POSTS.length;
        return <PageDialog page={POSTS[j]} onClose={shut} onGo={go} onStep={step}
                           around={[POSTS[mod(j - 1, n)].name, POSTS[mod(j + 1, n)].name]} returnTo={svg} />;
      })()}
    </div>
  );
}
