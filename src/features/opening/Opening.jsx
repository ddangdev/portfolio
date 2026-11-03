/* ddanghnl-site: the opening line, after the CLOU Architects intro. A white 3D box - a rectangular
   prism - on black, the words on its sides in black: "i make websites" facing us. It rotates a
   quarter turn to bring the next side round to the front, "brands", resizing as it goes, then again
   to "things u like" (owner's call, 2026-10-30: a solid box that rotates, not a card that flips).
   Each turn is a hop: the box crouches, jumps, rotates and resizes in the air, and lands on a spring
   - a squash and a small rebound - before it settles (owner's call: a little realism).
   Then box and words fade out together and the page is told it is done, so the wheel can fade in. About four and a half seconds; with
   reduced motion, the last words, still, for a few seconds, then gone.
   Ported from the first version on mockups.ddanghnl.com/portfolio-brand/. */

import { useEffect, useRef, useState } from 'react';

const WORDS = ['i make websites', 'brands', 'things u like'];   // no full stops (owner's call)

// [ms from start, step]. The phases: the box wipes in with its words ('label'), holds ('text'), two
// quarter turns, box and words fade out as one ('fade'), and go ('gone').
const BEATS = [[200, 'label'], [620, 'text'], [1550, 1], [2700, 2], [3950, 'fade'], [4700, 'gone']];
const PAD_EM = 0.24;   // white either side of the words

export default function Opening({ onDone }) {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const last = WORDS.length - 1;
  // Quarter turns so far: side `turn` faces us. Each side carries one set of words, in order.
  const [turn, setTurn] = useState(reduce ? last : 0);
  const [phase, setPhase] = useState(reduce ? 'text' : 'start');
  const [width, setWidth] = useState(null);
  const line = useRef(null);
  const probe = useRef(null);

  // The box's width for some words: the words in the line's own type, and the white either side.
  const fit = (words) => {
    probe.current.textContent = words;
    const em = parseFloat(getComputedStyle(line.current).fontSize);
    return probe.current.getBoundingClientRect().width + 2 * PAD_EM * em;
  };
  useEffect(() => {
    const refit = () => setWidth(fit(reduce ? WORDS[last] : WORDS[turn]));
    refit();
    addEventListener('resize', refit);
    return () => removeEventListener('resize', refit);
  }, [turn]);

  // The sequence starts once the font is in (widths depend on it), never more than a second late.
  useEffect(() => {
    if (reduce) {
      const t = setTimeout(() => setPhase('gone'), 2500);
      return () => clearTimeout(t);
    }
    const timers = [];
    let cancelled = false;
    Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => {
      if (cancelled) return;
      setWidth(fit(WORDS[0]));
      for (const [ms, step] of BEATS) {
        timers.push(setTimeout(() => {
          if (typeof step === 'string') { setPhase(step); return; }
          setTurn(step);   // rotate the next side round to the front
        }, ms));
      }
    });
    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [reduce]);

  useEffect(() => { if (phase === 'gone') onDone?.(); }, [phase]);

  return (
    <h1 className="opening" data-phase={phase} ref={line}>
      <span className="sr-only">i make websites, brands and things you like</span>
      <span className="opening-card-box" style={width ? { width } : undefined} aria-hidden="true">
        {/* the box: four sides round a horizontal axis, side i turned i quarter turns back from the
            front; rotating the box i quarter turns forward brings side i round to face us */}
        {/* the hop: restarted on every turn by swapping between two identical animations */}
        <span className={`opening-hop${turn > 0 ? (turn % 2 ? ' hop-a' : ' hop-b') : ''}`}>
        <span className="opening-card" style={{ '--turn-n': turn }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`opening-face${i === turn ? ' is-front' : ''}`} style={{ '--i': i }}>
              <span className="opening-words">{WORDS[i] ?? ''}</span>
            </span>
          ))}
        </span>
        </span>
      </span>
      <span ref={probe} className="opening-probe" aria-hidden="true" />
    </h1>
  );
}
