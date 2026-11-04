/* ddanghnl-site: contact's form, asked one question at a time (owner's call, 2026-11-04, in place of a
   block of fields): each question in readable words, its answers as buttons where they can be - the
   services, roughly when - and a single field where they cannot - a name, a number, an email, a few
   words. Answers given so far sit above as short lines, each with a `change` that goes back to it. The
   last step opens an email to the studio with everything filled in. No server: the visitor's own mail
   app sends it. The address itself is not shown (owner's call, 2026-11-02).
   Rendered by page/PageDialog.jsx for a page with `email` and `asks`. */

import { useEffect, useRef, useState } from 'react';
import { track } from '../measure/measure.js';

// the most the few words may run to: enough for a paragraph, and well inside what a mailto link carries
const NOTE_MAX = 500;
// how long the copy and the start button take to fade out before the first question comes in
const FADE = 320;
// a phone number as people type them here: ten digits, with or without +1, spaces, dots, dashes, brackets
const PHONE = /^\+?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// roughly when, as the buttons offer it
const WHEN = ['as soon as you can', 'in the next month or two', 'later this year', 'just looking for now'];

// the questions, in order. `kind` says how each is answered: `many` - buttons, several may be on, then a
// button to move on; `one` - buttons, the first click answers; `text`/`tel`/`email` - one field; `note` -
// a few words; `send` - the last step, the button that opens the email
const STEPS = [
  { key: 'picked', kind: 'many', q: 'what are you after?' },
  { key: 'when', kind: 'one', q: 'roughly when?', options: WHEN },
  { key: 'name', kind: 'text', q: 'what should we call you?' },
  { key: 'phone', kind: 'tel', q: 'best number to reach you on?' },
  { key: 'email', kind: 'email', q: 'an email too?', skip: 'no, the phone is fine' },
  { key: 'note', kind: 'note', q: 'anything else worth knowing?', skip: 'nothing more' },
  { key: 'send', kind: 'send', q: 'that is everything.' },
];

// what each answer reads as in its line above, once given
function shown(step, v) {
  if (step.kind === 'many') return v.length ? v.join(', ') : 'not sure yet';
  if (step.kind === 'email') return v.trim() || 'no, the phone is fine';
  if (step.kind === 'note') return v.trim() || 'nothing more';
  return typeof v === 'string' ? v.trim() : v;
}

export default function ContactForm({ email, asks, onAsk }) {
  // 'out' while the start button fades, 'on' once the questions have begun
  const [begun, setBegun] = useState(false);
  const [at, setAt] = useState(0);
  // the furthest question reached: after a `change`, answering again goes straight back there
  const [far, setFar] = useState(0);
  const [a, setA] = useState({ picked: [], when: '', name: '', phone: '', email: '', note: '' });
  const [draft, setDraft] = useState('');
  const [bad, setBad] = useState(false);
  const field = useRef(null);
  const step = STEPS[at];
  const put = (k, v) => setA((x) => ({ ...x, [k]: v }));
  const toggle = (s) => put('picked', a.picked.includes(s) ? a.picked.filter((x) => x !== s) : [...a.picked, s]);

  // on arriving at a step: its field takes focus, holding what was given before, and the question is in view
  useEffect(() => {
    setDraft(typeof a[step.key] === 'string' ? a[step.key] : '');
    setBad(false);
    const t = setTimeout(() => {
      // a field takes focus; a row of buttons does not (the ring on the first read as a choice made)
      if (field.current && field.current.tagName !== 'BUTTON') field.current.focus({ preventScroll: true });
      field.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [at, begun]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => { const to = Math.min(Math.max(at + 1, far), STEPS.length - 1); setAt(to); setFar(to); };
  // a typed answer: checked for the field it is, kept, and on to the next question
  const give = (skip) => {
    const v = skip ? '' : draft.trim();
    if (!skip) {
      if (step.kind === 'text' && v.length < 2) return setBad(true);
      if (step.kind === 'tel' && !PHONE.test(v)) return setBad(true);
      if (step.kind === 'email' && v && !EMAIL.test(v)) return setBad(true);
    }
    put(step.key, v);
    next();
  };

  const subject = `${a.picked.length ? a.picked.join(', ') : 'hello'} - ddanghnl studio`;
  const body = [
    `name: ${a.name.trim()}`, `phone: ${a.phone.trim()}`, a.email.trim() && `email: ${a.email.trim()}`,
    a.picked.length && `interested in: ${a.picked.join(', ')}`, a.when && `when: ${a.when}`,
    a.note.trim() && `\n${a.note.trim()}`,
  ].filter(Boolean).join('\n');
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const send = () => {
    // analytics: which services, roughly when, whether an email was given, how much was written (not what)
    track('contact_submit', { services: a.picked.length ? a.picked.join(', ') : 'none', when: a.when, has_email: Boolean(a.email.trim()), note_chars: a.note.trim().length });
    location.href = href;
  };

  const typed = step.kind === 'text' || step.kind === 'tel' || step.kind === 'email';

  // before anything is asked: one button (owner's call, 2026-11-04). On it, the button and the copy
  // above fade out together, and then the first question fades in
  if (begun !== 'on') {
    return (
      <div className="ask">
        <button type="button" className={`ask-go ask-start${begun === 'out' ? ' is-out' : ''}`} disabled={begun === 'out'}
                onClick={() => { setBegun('out'); onAsk?.('out'); track('contact_start'); setTimeout(() => { setBegun('on'); onAsk?.('gone'); }, FADE); }}>
          start<span className="ask-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  // the questions, one at a time: just the question and its answers on the screen, the answers at the
  // bottom (owner's call, 2026-11-04). The answers given are listed only on the last step, each with a
  // way back to it
  return (
    <div className="ask" aria-live="polite">
      <form key={step.key} className="ask-step is-on" onSubmit={(e) => { e.preventDefault(); if (step.kind === 'send') send(); else if (typed || step.kind === 'note') give(false); }}>
        <p className="ask-q" id={`ask-q-${step.key}`}>{step.q}</p>

        {step.kind === 'send' && STEPS.slice(0, at).map((s, i) => (
          <div key={s.key} className="ask-given">
            <span className="ask-given-q">{s.q}</span>
            <span className="ask-given-a">{shown(s, a[s.key])}</span>
            <button type="button" className="ask-change" onClick={() => setAt(i)}>change</button>
          </div>
        ))}

        {step.kind === 'many' && (
          <div className="ask-row" role="group" aria-labelledby={`ask-q-${step.key}`}>
            {asks.map((s, i) => (
              <button key={s} ref={i === 0 ? field : null} type="button" className={`ask-opt${a.picked.includes(s) ? ' is-on' : ''}`} aria-pressed={a.picked.includes(s)} onClick={() => toggle(s)}>
                <span className="ask-opt-mark" aria-hidden="true" />{s}
              </button>
            ))}
            <button type="button" className="ask-go" onClick={next}>{a.picked.length ? "that's the lot" : 'not sure yet'}<span className="ask-arrow" aria-hidden="true">→</span></button>
          </div>
        )}

        {step.kind === 'one' && (
          <div className="ask-row" role="group" aria-labelledby={`ask-q-${step.key}`}>
            {step.options.map((o, i) => (
              <button key={o} ref={i === 0 ? field : null} type="button" className={`ask-opt${a.when === o ? ' is-on' : ''}`} onClick={() => { put('when', o); next(); }}>{o}</button>
            ))}
          </div>
        )}

        {typed && (
          <div className="ask-row">
            <input ref={field} className={`ask-input${bad ? ' is-bad' : ''}`} type={step.kind} name={step.key} inputMode={step.kind === 'tel' ? 'tel' : undefined}
                   autoComplete={step.kind === 'text' ? 'name' : step.kind} aria-labelledby={`ask-q-${step.key}`} aria-invalid={bad || undefined}
                   value={draft} onChange={(e) => { setDraft(e.target.value); setBad(false); }} />
            <button type="submit" className="ask-go" aria-label="next">→</button>
            {step.skip && <button type="button" className="ask-opt" onClick={() => give(true)}>{step.skip}</button>}
          </div>
        )}
        {bad && <p className="ask-bad">{step.kind === 'text' ? 'a name, at least a couple of letters' : step.kind === 'tel' ? 'a ten-digit number, like 808 555 0100' : 'that email does not look right'}</p>}

        {step.kind === 'note' && (
          <div className="ask-row ask-row-note">
            <textarea ref={field} className="ask-note" rows={3} maxLength={NOTE_MAX} aria-labelledby={`ask-q-${step.key}`} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="what you're making, who it is for" />
            <span className={`ask-count${draft.length > NOTE_MAX * 0.8 ? ' is-on' : ''}`}>{NOTE_MAX - draft.length} left</span>
            <div className="ask-row">
              <button type="submit" className="ask-go">{draft.trim() ? "that's it" : step.skip}<span className="ask-arrow" aria-hidden="true">→</span></button>
            </div>
          </div>
        )}

        {step.kind === 'send' && (
          <div className="ask-row ask-row-note">
            <p className="ask-p">an email to the studio opens with your answers in it. send that, and you will hear back soon.</p>
            {/* where the captcha goes (owner's call, 2026-11-02): a placeholder the size of a Turnstile or
                reCAPTCHA box, until one is wired up with a form service */}
            <div className="ask-captcha" aria-hidden="true"><span className="ask-captcha-box" /><span>captcha goes here</span></div>
            <div className="ask-row">
              <button ref={field} type="submit" className="ask-go ask-send">write to the studio<span className="ask-arrow" aria-hidden="true">→</span></button>
            </div>
          </div>
        )}
      </form>
      {/* where you are: a dot a question, the one being asked filled (owner's call, 2026-11-04) */}
      <div className="ask-dots" aria-label={`question ${at + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => <span key={s.key} className={`ask-dot${i === at ? ' is-on' : i < at ? ' is-done' : ''}`} />)}
      </div>
    </div>
  );
}
