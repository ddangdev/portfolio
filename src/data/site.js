/* Studio identity, contact and anchors: used in more than one place, so defined once here. */

export const STUDIO = {
  name: 'ddanghnl studio',
  mark: 'ddanghnl',
  markSuffix: 'studio',
  legalName: 'DDANGHNL STUDIO LLC',
  city: 'Honolulu',
  email: 'ddanghnlstudio@gmail.com',
};

export const MAILTO = `mailto:${STUDIO.email}`;

/* element ids other parts of the page point at (skip link, header mark and pill, hero button, back to top) */
export const ANCHORS = {
  top: 'top',
  work: 'work',
  start: 'start',
};

/* Cloudflare Turnstile PUBLIC site key (the same one the live site uses). Never a secret. */
export const TURNSTILE_SITE_KEY = '0x4AAAAAADwv0OfinxrncT6S';
