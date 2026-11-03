/* ddanghnl-site: the page pop-up. Opening what the wheel has selected (owner's call, 2026-10-30) brings
   up this dialog over the wheel: the page's name, a close button, and a body. For now it is the
   framework: a project that can run live (its `embed`) runs here to be played with; otherwise the
   body shows the project's preview large, and is empty for the rest - each page's real content goes
   in here. Closes with the button, Escape, or a click outside it; focus moves into
   it on opening, stays inside while it is open, and on closing goes to `returnTo` - the wheel - rather
   than back to whatever opened it: handed back to the preview, its focus ring stayed on as a red
   square (owner's report).
   Going from one page to another (a link in it - `onGo`) keeps the card: its words fade out, the
   empty card grows or shrinks to the new page's size, then the new words fade in (owner's call,
   2026-11-01). Each link followed leaves a trail, and a back arrow by the close button goes back along
   it a page at a time (owner's call, 2026-11-02); stepping with the arrows at the sides starts afresh. On a phone, a swipe across the
   card steps too (owner's call, 2026-11-02): left to right goes to the page before, right to left to
   the one after - not a swipe that began on the services' orbit or the work's dots, which have their
   own uses for a finger, and not one that is more up-and-down (that is the card scrolling). */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ServiceField from '../services/ServiceField.jsx';
import ContactForm from '../contact/ContactForm.jsx';
import WorkField from '../work/WorkField.jsx';
import Faq from '../faq/Faq.jsx';
import Note, { NoteList } from '../notes/Note.jsx';
import { track } from '../analytics/analytics.js';

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const OUT_MS = 200;   // the closing fade, before it unmounts
// going to another page: the words' fade out (CSS, .is-swapping), then the card's resize; the fade back
// in is CSS too
const SWAP_OUT_MS = 130;
const RESIZE_MS = 280;
const RESIZE_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';   // on-screen movement: ease in and out
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// a swipe: a finger (not a mouse) across the card this far, in this long, and more across than down
const SWIPE_PX = 56;
const SWIPE_MS = 700;

// a paragraph's words, its links to other pages among them (a link turns the wheel there - `onGo`)
const words = (p, onGo) => (!Array.isArray(p) ? p : p.map((part, i) => (typeof part === 'string' ? part : (
  <a key={i} className="page-go" href={`#${part.go}`} onClick={(e) => { e.preventDefault(); onGo(part.go); }}>{part.text}</a>
))));

// an arrow: a chevron pointing left or right
const Chevron = ({ left }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={left ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></svg>
);

export default function PageDialog({ page, onClose, onGo, onStep, around, returnTo }) {
  const backdrop = useRef(null);
  const dialog = useRef(null);
  const closer = useRef(null);
  // the step to the page before or after (the arrows, and the left and right keys), the latest one
  const stepRef = useRef(null);
  const [closing, setClosing] = useState(false);
  // the page on show: it trails `page` while the card changes over to it
  const [shown, setShown] = useState(page);
  const [swapping, setSwapping] = useState(false);
  const fromHeight = useRef(0);   // the card's height before the new page went in, while it resizes
  // the pages left by a link, in order: the back arrow returns to the last
  const [trail, setTrail] = useState([]);
  // (each sent to analytics, with the page it was done from: `how` is a link in the words, or a work dot)
  const go = (to, how = 'text') => { track('page_link', { from: page.name, to, how }); setTrail((t) => [...t, page.name]); onGo(to); };
  const back = () => { if (!trail.length) return; const to = trail[trail.length - 1]; track('page_back', { from: page.name, to }); setTrail(trail.slice(0, -1)); onGo(to); };
  const step = (fwd, how = 'arrow') => { track('page_step', { from: page.name, dir: fwd ? 'next' : 'prev', how }); setTrail([]); onStep(fwd); };
  // a swipe across the card, on a phone: where the finger went down, to measure the way it went
  const swipe = useRef(null);
  const swipeDown = (e) => {
    swipe.current = null;
    if (e.pointerType === 'mouse' || e.target.closest('.svc-field, .wrk-field, input, textarea, video, iframe')) return;
    swipe.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const swipeUp = (e) => {
    const sw = swipe.current;
    swipe.current = null;
    if (!sw || performance.now() - sw.t > SWIPE_MS) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 2) return;
    step(dx < 0, 'swipe');   // left to right: the page before; right to left: the one after
  };
  stepRef.current = step;
  const { name, preview, project, note, article, embed, body, light } = shown;

  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, reduced() ? 0 : OUT_MS);
  };

  // a new page: fade the words out, then put the new page in, noting the card's height first
  useEffect(() => {
    if (page.name === shown.name) return undefined;
    if (reduced()) { setShown(page); return undefined; }
    setSwapping(true);
    const t = setTimeout(() => { fromHeight.current = dialog.current.getBoundingClientRect().height; setShown(page); }, SWAP_OUT_MS);
    return () => clearTimeout(t);
  }, [page.name]);

  // the new page is in, still unseen: resize the card from its old height to its new one, then let the
  // words fade in. If focus was on a link that has gone, it goes back to the card.
  useLayoutEffect(() => {
    const el = dialog.current;
    const from = fromHeight.current;
    const regain = () => { if (!backdrop.current.contains(document.activeElement)) el.focus({ preventScroll: true }); };
    if (!from) { regain(); return undefined; }
    fromHeight.current = 0;
    el.scrollTop = 0;
    regain();
    const to = el.getBoundingClientRect().height;
    if (Math.abs(to - from) < 1) { setSwapping(false); return undefined; }
    el.style.overflow = 'hidden';
    const grow = el.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: RESIZE_MS, easing: RESIZE_EASE });
    const done = () => { el.style.overflow = ''; setSwapping(false); };
    grow.onfinish = done;
    return () => { grow.onfinish = null; grow.cancel(); el.style.overflow = ''; };
  }, [shown]);

  useEffect(() => {
    const before = document.activeElement;
    // focus starts on the card itself, not its close button: a key pressed with the button focused
    // lit its ring (the left and right keys, stepping page to page)
    dialog.current.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault(); stepRef.current(e.key === 'ArrowRight', 'key'); return;
      }
      if (e.key !== 'Tab') return;
      // keep Tab inside the dialog and its arrows
      const stops = backdrop.current.querySelectorAll('button, a[href], video[controls], [tabindex]:not([tabindex="-1"])');
      const first = stops[0], last = stops[stops.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    addEventListener('keydown', onKey);
    return () => { removeEventListener('keydown', onKey); (returnTo?.current ?? before)?.focus?.({ preventScroll: true }); };
  }, []);

  return (
    <div ref={backdrop} className={`page-backdrop${closing ? ' is-closing' : ''}`} onClick={close}>
      {/* the card, and the page before and after on its white, an arrow at either side (owner's call,
          2026-11-01: inside the card, the card wider) */}
      <div className={`page-frame${light ? ' is-light' : ''}`}>
      <button type="button" className="page-step is-prev" aria-label={`Previous: ${around[0]}`} title={around[0]}
              onClick={(e) => { e.stopPropagation(); step(false); }}><Chevron left /></button>
      <button type="button" className="page-step is-next" aria-label={`Next: ${around[1]}`} title={around[1]}
              onClick={(e) => { e.stopPropagation(); step(true); }}><Chevron /></button>
      <section ref={dialog} className={`page-dialog${light ? ' is-light' : ''}${body?.some((b) => b.lead) ? ' has-lead' : ''}${swapping ? ' is-swapping' : ''}`} role="dialog" aria-modal="true" aria-labelledby="page-title" tabIndex={-1}
               onClick={(e) => e.stopPropagation()}
               onPointerDown={swipeDown} onPointerUp={swipeUp} onPointerCancel={() => { swipe.current = null; }}>
        <header className="page-head">
          <div className="page-head-text">
            {(project || note) && <p className="page-kind">{project ? 'work' : 'notes'}</p>}
            <h2 id="page-title" className="page-title">{name}</h2>
          </div>
          <div className="page-head-btns">
            {/* back along the trail of links, when there is one: an undo arrow, curling back (owner's call,
                2026-11-02), nothing like the chevrons that step page to page */}
            {trail.length > 0 && (
              <button type="button" className="page-close page-back" aria-label={`Back to ${trail[trail.length - 1]}`} title={trail[trail.length - 1]} onClick={back}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg>
              </button>
            )}
            <button ref={closer} type="button" className="page-close" aria-label={`Close ${name}`} onClick={close}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </header>
        <div className="page-body">
          {body && (
            <div className="page-copy">
              {body.filter((b) => !b.service && !b.email && !b.links && !b.faq && !b.notes).map((b, i) => (b.lead
                ? <p key={i} className="page-lead">{b.lead}</p>
                : <p key={i} className="page-p">{words(b.p, go)}</p>))}
            </div>
          )}
          {body?.filter((b) => b.notes || b.faq).map((b, i) => (b.faq
            // the questions that come up most, folded, each opening to its answer (notes; see faq/Faq.jsx)
            ? <Faq key={`faq${i}`} items={b.faq} words={words} onGo={go} title={body.some((x) => x.notes) ? 'questions' : null} />
            // the notes, listed, each opening its page, and a row on to the rest (see notes/Note.jsx)
            : <NoteList key={`notes${i}`} items={b.notes} title={b.title} more={b.more} onGo={(to) => go(to, 'note')} />))}
          {body?.some((b) => b.service) && (
            // the services, as an orbit of discs (see services/ServiceField.jsx)
            <ServiceField services={body.filter((b) => b.service)} />
          )}
          {body?.filter((b) => b.links).map((b, i) => (
            // work: every project as a dot floating in its kind's column, each opening it (see work/WorkField.jsx)
            <WorkField key={i} projects={b.links} kinds={b.kinds} onGo={(to) => go(to, 'dot')} />
          ))}
          {body?.filter((b) => b.email).map((b) => (
            // contact: the form - the services to tick, a few words, a button that opens the email
            <ContactForm key={b.email} email={b.email} asks={b.asks} />
          ))}
          {article && (
            // a note, read here (see notes/Note.jsx)
            <Note article={article} words={words} onGo={go} />
          )}
          {embed && (
            // the live project, loaded only while the pop-up is open
            <iframe className="page-embed" src={asset(embed)} title={`${name}, running live`} />
          )}
          {!embed && preview?.video && (
            <video className="page-media" src={asset(preview.video)} poster={asset(preview.poster)}
                   autoPlay muted loop playsInline aria-hidden="true" />
          )}
          {!embed && preview?.image && <img className="page-media" src={asset(preview.image)} alt="" />}
        </div>
      </section>
      </div>
    </div>
  );
}
