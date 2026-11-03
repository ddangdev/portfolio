/* hanging-book: the statement under the cup (owner's call, 2026-11-01). Every 1.6 seconds it changes to
   the next of eight lines about the pour - four in English, three in traditional Japanese, one in
   simplified - each in two parts: English a word above a word, Japanese in the owner's two columns, the
   right one dropped half a character. The change is a snappy pop: the old line shrinks out in a blink, the
   new one pops in a touch past its size and snaps back, its second part a beat after its first. With reduced motion it stays on the first. */

const LINES = [
  { lang: 'en', parts: ['say', 'when'] },
  { lang: 'ja', parts: ['こし', '盛ぼ'] },   // the owner's four
  { lang: 'en', parts: ['say', 'stop'] },
  { lang: 'ja', parts: ['珈', '琲'] },       // coffee
  { lang: 'en', parts: ['too', 'much'] },
  { lang: 'ja', parts: ['滿', '杯'] },       // full to the brim, in its traditional form...
  { lang: 'ja', parts: ['満', '杯'] },       // ...and the same in its simplified one
  { lang: 'en', parts: ['one', 'more?'] },
];
const HOLD = 1600;      // ms on each line
const OUT_MS = 200;     // long enough for the old line to have left

const st = document.querySelector('.statement');

function show(line, animate) {
  const el = document.createElement('div');
  el.className = animate ? 'line in' : 'line';
  el.lang = line.lang;
  el.setAttribute('aria-hidden', 'true');
  line.parts.forEach((p, k) => {
    const s = document.createElement('span');
    s.className = `part ${'ab'[k]}`;
    s.textContent = p;
    el.append(s);
  });
  st.append(el);
  return el;
}

// Digital changes to compare (owner's ask, 2026-11-01), ?fx=scramble|glitch|flip|scan; the pop by default.
//   scramble  the new line decodes out of random characters, left to right
//   glitch    it jitters in through red and cyan split slices, then holds still
//   flip      each part flips down into place, like a departures board
//   scan      it is revealed top to bottom in hard steps, like a slow screen
const FX = ['scramble', 'glitch', 'flip', 'scan'].includes(new URLSearchParams(location.search).get('fx'))
  ? new URLSearchParams(location.search).get('fx') : null;
if (FX) st.dataset.fx = FX;
// scramble draws only on characters the lines already use, so every frame stays in the loaded face
const POOL = {
  en: [...new Set(LINES.filter((l) => l.lang === 'en').flatMap((l) => [...l.parts.join('')]))],
  ja: [...new Set(LINES.filter((l) => l.lang === 'ja').flatMap((l) => [...l.parts.join('')]))],
};
function scramble(el, lang) {
  const parts = [...el.querySelectorAll('.part')], finals = parts.map((p) => [...p.textContent]);
  const pool = POOL[lang], t0 = performance.now(), DUR = 420, STEP = 45;
  let last = 0;
  const tick = (now) => {
    const t = now - t0;
    if (t - last >= STEP || t >= DUR) {
      last = t;
      parts.forEach((p, k) => {
        const f = finals[k], done = Math.floor((t / DUR) * (f.length + 1) - k * 0.5);
        p.textContent = f.map((ch, i) => (i < done ? ch : pool[Math.floor(Math.random() * pool.length)])).join('');
      });
    }
    if (t < DUR) requestAnimationFrame(tick);
    else parts.forEach((p, k) => { p.textContent = finals[k].join(''); });
  };
  requestAnimationFrame(tick);
}

let at = 0, current = show(LINES[0], false);
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    if (document.hidden) return;   // no piling up of lines in a background tab
    const old = current;
    old.classList.remove('in'); old.classList.add('out');
    setTimeout(() => old.remove(), FX === 'scramble' ? 0 : OUT_MS);
    at = (at + 1) % LINES.length;
    current = show(LINES[at], true);
    if (FX === 'scramble') scramble(current, LINES[at].lang);
  }, HOLD);
}
