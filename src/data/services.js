/* The three services, exactly as approved. `key` is the GA4 `service_select` value (kept from the old site
   so reports stay continuous); `name` is what the page shows and what the lead form sends. */
export const services = [
  { key: 'website', name: 'website + hosting', description: 'fast, custom-built, made for phones first, and hosted for you.' },
  { key: 'gbp', name: 'google business profile', description: 'set up so locals & tourists actually find you.' },
  { key: 'analytics', name: 'analytics', description: 'monthly traffic reports, in plain english.' },
];

export const UNSURE = { key: 'unsure', name: 'not sure yet' };

/* the form's chips, in this order */
export const serviceChips = [...services, UNSURE];
