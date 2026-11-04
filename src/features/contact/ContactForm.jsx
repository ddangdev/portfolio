/* ddanghnl-site: contact's form, asked one question at a time (owner's call, 2026-11-04, in place of a
   block of fields): each question in readable words, its answers as buttons where they can be - the
   services, roughly when - and a single field where they cannot - a name, a number, an email, a few
   words. Answers given so far sit above as short lines, each with a `change` that goes back to it. The
   last step sends it to the studio (owner's call, 2026-11-04: it posts to /api/lead, the Pages function
   in the deploy repo that checks a Turnstile token and emails the owner through Resend; before this it
   only opened the visitor's mail app). If the post fails, a mail link is offered instead. The address
   itself is not shown (owner's call, 2026-11-02).
   Rendered by page/PageDialog.jsx for a page with `email` and `asks`. */

import { useEffect, useRef, useState } from 'react';
import { track } from '../measure/measure.js';

// the most the few words may run to: enough for a paragraph, and well inside what a mailto link carries
const NOTE_MAX = 500;
// how long the copy and the start button take to fade out before the first question comes in
const FADE = 320;
// Turnstile: the public site key for ddanghnl.com; in development Cloudflare's always-passes test key,
// since the real one refuses localhost (and the endpoint is not there in development anyway)
const SITE_KEY = import.meta.env.DEV ? '1x00000000000000000000AA' : '0x4AAAAAADwv0OfinxrncT6S';
const MAIL_FALLBACK = 'you can write to the studio by email instead:';
const TURNSTILE_JS = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
// the script, loaded once, however many times the form is opened
let turnstileReady = null;
const loadTurnstile = () => turnstileReady ||= new Promise((ok, no) => {
  if (window.turnstile) return ok(window.turnstile);
  const sc = document.createElement('script');
  sc.src = TURNSTILE_JS; sc.async = true;
  sc.onload = () => ok(window.turnstile); sc.onerror = () => { turnstileReady = null; no(new Error('turnstile')); };
  document.head.appendChild(sc);
});
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
  // the send: a token from the anti-spam check, then 'sending', 'sent', or the error to show
  const [token, setToken] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState('');
  const field = useRef(null);
  const captcha = useRef(null);
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

  // the anti-spam check: drawn into its box when the last step is reached, and again after a `change`
  useEffect(() => {
    if (step.kind !== 'send' || sent) return undefined;
    let id = null, gone = false;
    setToken('');
    loadTurnstile().then((ts) => {
      if (gone || !captcha.current) return;
      captcha.current.innerHTML = '';
      id = ts.render(captcha.current, {
        sitekey: SITE_KEY, theme: 'light', size: 'flexible',
        callback: (t) => setToken(t), 'expired-callback': () => setToken(''), 'error-callback': () => setToken(''),
      });
    }).catch(() => setFail('the anti-spam check did not load. ' + MAIL_FALLBACK));
    return () => { gone = true; if (id && window.turnstile) window.turnstile.remove(id); };
  }, [step.kind, sent]); // eslint-disable-line react-hooks/exhaustive-deps

  // the mail link, for when the post cannot go: the same answers, in the visitor's own mail app
  const subject = `${a.picked.length ? a.picked.join(', ') : 'hello'} - ddanghnl studio`;
  const body = [
    `name: ${a.name.trim()}`, `phone: ${a.phone.trim()}`, a.email.trim() && `email: ${a.email.trim()}`,
    a.picked.length && `interested in: ${a.picked.join(', ')}`, a.when && `when: ${a.when}`,
    a.note.trim() && `\n${a.note.trim()}`,
  ].filter(Boolean).join('\n');
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // the send: the answers posted to the studio's endpoint, with the anti-spam token
  const send = async () => {
    if (sending || sent) return;
    if (!token) { setFail('tick the anti-spam box first.'); return; }
    setSending(true); setFail('');
    // analytics: which services, roughly when, whether an email was given, how much was written (not what)
    track('contact_submit', { services: a.picked.length ? a.picked.join(', ') : 'none', when: a.when, has_email: Boolean(a.email.trim()), note_chars: a.note.trim().length });
    const em = a.email.trim();
    const situation = [{ q: 'roughly when', a: a.when }, em ? { q: 'phone', a: a.phone.trim() } : null].filter(Boolean);
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 12000);
      const res = await fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
        // contact: the email when there is one (the studio can reply to it), else the phone
        body: JSON.stringify({ name: a.name.trim(), contact: em || a.phone.trim(), services: a.picked, situation, message: a.note.trim(), turnstileToken: token, page: location.href, company: '' }),
      });
      clearTimeout(timer);
      const out = res.ok ? await res.json() : { ok: false, error: `the studio's inbox did not answer (${res.status}).` };
      if (out.ok) { setSent(true); track('contact_sent'); }
      else { setFail((out.error || 'it did not go through.') + ' ' + MAIL_FALLBACK); window.turnstile?.reset(); setToken(''); }
    } catch {
      setFail('it did not go through. ' + MAIL_FALLBACK);
    } finally {
      setSending(false);
    }
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
        <p className="ask-q" id={`ask-q-${step.key}`}>{sent ? 'sent. thank you.' : step.q}</p>
        {sent && <p className="ask-p">the studio has it, and you will hear back soon.</p>}

        {step.kind === 'send' && !sent && STEPS.slice(0, at).map((s, i) => (
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

        {step.kind === 'send' && !sent && (
          <div className="ask-row ask-row-note">
            {/* the anti-spam check (Cloudflare Turnstile), drawn in here */}
            <div ref={captcha} className="ask-captcha" />
            {fail && <p className="ask-bad">{fail} {fail.endsWith(':') && <a className="ask-mail" href={href}>open an email</a>}</p>}
            <div className="ask-row">
              <button ref={field} type="submit" className="ask-go ask-send" disabled={sending}>{sending ? 'sending' : 'send to the studio'}<span className="ask-arrow" aria-hidden="true">→</span></button>
            </div>
          </div>
        )}
      </form>
      {/* where you are: a dot a question, the one being asked filled (owner's call, 2026-11-04) */}
      {!sent && <div className="ask-dots" aria-label={`question ${at + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => <span key={s.key} className={`ask-dot${i === at ? ' is-on' : i < at ? ' is-done' : ''}`} />)}
      </div>}
    </div>
  );
}
