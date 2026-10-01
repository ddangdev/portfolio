/* PURE: the lead form's field rules (no React, no browser globals; the Node contract test imports this).
   Same rules as the approved prototype. They are stricter than functions/api/lead.js, so every value the
   browser accepts, the server accepts too. */

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isPhone = (v) => {
  const digits = v.replace(/\D/g, '');
  return /^[\d\s+().-]+$/.test(v) && digits.length >= 7 && digits.length <= 15;
};

/* drops control characters the way functions/api/lead.js stripCtrl does (keeps tab and newline), so a value
   that is only control characters fails here instead of at the server */
const stripCtrl = (s) => Array.from(s).filter((ch) => {
  const x = ch.codePointAt(0);
  return x >= 32 || x === 9 || x === 10;
}).join('');

/** Returns '' when the value is fine, else the message to show under the field. */
export function validateField(name, raw) {
  const v = stripCtrl(String(raw == null ? '' : raw)).trim();
  if (!v) return name === 'name' ? "add your name so i know who i'm talking to." : 'add an email so i can get back to you.';
  if (name === 'contact') {
    if (EMAIL.test(v) || isPhone(v)) return '';
    return v.includes('@')
      ? 'that email looks incomplete. check it, or use a phone number.'
      : "that doesn't look like an email or a phone number yet.";
  }
  return '';
}

/* the checked fields, in the order they are checked and focused */
export const CHECKED_FIELDS = ['name', 'contact'];

export const FIELD_LABELS = { name: 'name', contact: 'email' };

/** '2 things need a look: name, email.' ('' when nothing is bad) */
export function invalidSummary(badNames) {
  if (!badNames.length) return '';
  return (badNames.length === 1 ? '1 thing needs' : `${badNames.length} things need`)
    + ' a look: '
    + badNames.map((n) => FIELD_LABELS[n]).join(', ')
    + '.';
}
