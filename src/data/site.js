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

/* element ids other parts of the page point at (skip link, nav, dock observers) */
export const ANCHORS = {
  top: 'top',
  work: 'work',
  services: 'services',
  start: 'start',
  heroCta: 'hero-cta',
};

/* header nav; SiteHeader renders the "start a project" pill after these */
export const NAV = [
  { label: 'work', href: `#${ANCHORS.work}` },
  { label: 'services', href: `#${ANCHORS.services}`, wide: true },
  { label: 'email', href: MAILTO, wide: true },
];

/* Cloudflare Turnstile PUBLIC site key (the same one the live site uses). Never a secret. */
export const TURNSTILE_SITE_KEY = '0x4AAAAAADwv0OfinxrncT6S';
