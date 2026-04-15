// Raw hex palettes for the main surfaces driven by the theme spring.
// Everything here is a solid hex string so the spring can interpolate
// per-channel between light and dark.
// rgba tokens (navBg, modalBackdrop, soft cards) stay in theme.js and
// rely on the global CSS transition — not worth spring-animating.

export const SPRING_COLORS = [
  'bg',
  'text',
  'textMuted',
  'heroBg',
  'aboutBg',
  'projectsBg',
  'contactBg',
  'cardBg',
  'primary',
];

export const lightPalette = {
  bg:          '#FBF5EE',
  text:        '#2D3436',
  textMuted:   '#8B8480',
  heroBg:      '#FFF3E0',
  aboutBg:     '#E8F5EC',
  projectsBg:  '#EDE7F6',
  contactBg:   '#FCE4EC',
  cardBg:      '#FFFBF4',
  primary:     '#F4A27D',
};

export const darkPalette = {
  bg:          '#1F1A17',
  text:        '#F5EDE2',
  textMuted:   '#9A8F85',
  heroBg:      '#241E1A',
  aboutBg:     '#1E2423',
  projectsBg:  '#231F28',
  contactBg:   '#281F26',
  cardBg:      '#2A2320',
  primary:     '#E88A60',
};

function parseHex(h) {
  const s = h.replace('#', '');
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

function toHex(rgb) {
  return '#' + rgb.map((v) => {
    const n = Math.max(0, Math.min(255, Math.round(v)));
    return n.toString(16).padStart(2, '0');
  }).join('');
}

export function lerpHex(a, b, t) {
  const ra = parseHex(a);
  const rb = parseHex(b);
  return toHex(ra.map((v, i) => v + (rb[i] - v) * t));
}

export function paletteAt(t) {
  const out = {};
  for (const key of SPRING_COLORS) {
    out[key] = lerpHex(lightPalette[key], darkPalette[key], t);
  }
  return out;
}
