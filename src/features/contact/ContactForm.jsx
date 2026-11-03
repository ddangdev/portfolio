/* ddanghnl-site: contact's form (owner's call, 2026-11-02, in place of a list of services each opening an
   email): first, the services as boxes to tick - whichever they are interested in - then their name and
   phone (both needed), an email if they like, a few words, and a button that opens an email to the
   studio with the ticked services as its subject and the rest as its body. No server: the visitor's own
   mail app sends it. The address itself is not shown (owner's call, 2026-11-02).
   Rendered by page/PageDialog.jsx for a page with `email` and `asks`. */

import { useState } from 'react';
import { track } from '../analytics/analytics.js';

// the most the few words may run to: enough for a paragraph, and well inside what a mailto link carries
const NOTE_MAX = 500;
// a phone number as people type them here: ten digits, with or without +1, spaces, dots, dashes, brackets
// (the browser compiles it with the strict v flag, so the dash in a class is escaped)
const PHONE = String.raw`^\+?1?[\s.\-]?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}$`;

export default function ContactForm({ email, asks }) {
  const [picked, setPicked] = useState([]);
  const [who, setWho] = useState({ name: '', phone: '', email: '', note: '' });
  const set = (k) => (e) => setWho((w) => ({ ...w, [k]: e.target.value }));
  const toggle = (s) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const subject = `${picked.length ? picked.join(', ') : 'hello'} - ddanghnl studio`;
  const body = [
    `name: ${who.name.trim()}`, `phone: ${who.phone.trim()}`, who.email.trim() && `email: ${who.email.trim()}`,
    picked.length && `interested in: ${picked.join(', ')}`, who.note.trim() && `\n${who.note.trim()}`,
  ].filter(Boolean).join('\n');
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <form className="ask" onSubmit={(e) => {
      e.preventDefault();
      // analytics: which services were ticked, whether an email was given, how much was written (not what)
      track('contact_submit', { services: picked.length ? picked.join(', ') : 'none', has_email: Boolean(who.email.trim()), note_chars: who.note.trim().length });
      location.href = href;
    }}>
      <fieldset className="ask-set">
        <legend className="ask-label">interested in</legend>
        <div className="ask-boxes">
          {asks.map((s) => (
            <label key={s} className={`ask-box${picked.includes(s) ? ' is-on' : ''}`}>
              <input type="checkbox" checked={picked.includes(s)} onChange={() => toggle(s)} />
              <span className="ask-box-mark" aria-hidden="true" />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="ask-who">
        <label className="ask-field">
          <span className="ask-label">name</span>
          <input className="ask-input" type="text" name="name" autoComplete="name" required minLength={2} value={who.name} onChange={set('name')} />
        </label>
        <label className="ask-field">
          <span className="ask-label">phone</span>
          <input className="ask-input" type="tel" name="phone" autoComplete="tel" required pattern={PHONE} title="a ten-digit number, like 808 555 0100" inputMode="tel" value={who.phone} onChange={set('phone')} />
        </label>
        <label className="ask-field">
          <span className="ask-label">email <em>optional</em></span>
          <input className="ask-input" type="email" name="email" autoComplete="email" value={who.email} onChange={set('email')} />
        </label>
      </div>
      <label className="ask-field">
        <span className="ask-label">a few words</span>
        <textarea className="ask-note" rows={3} maxLength={NOTE_MAX} value={who.note} onChange={set('note')} placeholder="what you're making, roughly when" />
        {/* how much room is left, once it starts to matter */}
        <span className={`ask-count${who.note.length > NOTE_MAX * 0.8 ? ' is-on' : ''}`} aria-live="polite">{NOTE_MAX - who.note.length} left</span>
      </label>
      {/* where the captcha goes (owner's call, 2026-11-02): a placeholder the size of a Turnstile or
          reCAPTCHA box, until one is wired up with a form service */}
      <div className="ask-captcha" aria-hidden="true">
        <span className="ask-captcha-box" />
        <span className="ask-captcha-text">captcha goes here</span>
      </div>
      {/* the browser asks for a name and a real-looking phone number (and a well-formed email, if one is given) before the mail app opens */}
      <button type="submit" className="ask-send">write to the studio<span className="ask-send-arrow" aria-hidden="true">→</span></button>
    </form>
  );
}
