/* hanging-book: the cup scene's colours. One palette is the scene's; the others stay to compare, each a
   link away with ?palette=<name>. The panel's proposals (2026-10-31) are here alongside the original.
   index.html reads the paper, stop and stopDot colours from here too, as CSS custom properties. */

// A three-colour palette: A the ground, B the body, C the light. The letters and milk are C, so they read on
// everything they touch - the ground (A), the coffee (A, a hole in the cup), the cup (B) and the tabletop.
// The tabletop is the ground's own colour, shown by its B edge and stem; the pitcher is B with a C lip and an
// A inside; "say stop" is C; the shadows are B, faint.
function tri(A, B, C) {
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');
  return {
    paper: A, cup: B, coffee: A, pitcher: B, pitcherLip: C, pitcherInside: A,
    letters: C, shadowRGB: rgb(B), stop: C, stopDot: C,
    podTop: A, podLeft: B, podRight: B,
  };
}

export const PALETTES = {
  // the colours before the panel: cream paper, white letters (which barely read on it)
  original: {
    paper: '#f2ece3', cup: '#5a3520', coffee: '#3c2213', pitcher: '#9b968f',
    letters: '#ffffff', shadowRGB: '60, 38, 20', stop: '#2a170c', stopDot: '#b8442c',
    podTop: '#e6dccd', podLeft: '#d1c4b1', podRight: '#bdae99',
  },
  // the art director's: claret, burnt rose, champagne gold - velvet, wine and gilt
  oxblood: {
    paper: '#3b1220', cup: '#8a3a34', coffee: '#1c0c0a', pitcher: '#c9b48a',
    letters: '#f7ecd6', shadowRGB: '14, 3, 8', stop: '#e9c46f', stopDot: '#ff5b3a',
    podTop: '#5a2131', podLeft: '#481827', podRight: '#35101c',
  },
  // the colour theorist's: split-complement - muted petrol teal against the orange-browns of the coffee
  petrol: {
    paper: '#3f7a86', cup: '#3a1f12', coffee: '#1c0e07', pitcher: '#d9d3c7',
    letters: '#fffaf2', shadowRGB: '10, 36, 44', stop: '#1a0d06', stopDot: '#f4794a',
    podTop: '#4f8f9b', podLeft: '#356c77', podRight: '#295963',
  },
  // the contrarian's: white kinetic type on cobalt, after the reference the owner liked, with a dark espresso cup
  cobalt: {
    paper: '#4163f5', cup: '#3b1d0e', coffee: '#0e0603', pitcher: '#d6dbe6',
    letters: '#ffffff', shadowRGB: '6, 12, 70', stop: '#fff4e0', stopDot: '#ffc23d',
    podTop: '#5a79f7', podLeft: '#3656d8', podRight: '#2845bd',
  },
  // second panel, 2026-10-31 - refining Oxblood: deeper paper, the table lifted a step, a brighter cup
  lamplight: {
    paper: '#240912', cup: '#cf5a45', coffee: '#1c0c0a', pitcher: '#d9bf86',
    letters: '#f7ecd6', shadowRGB: '10, 2, 6', stop: '#e9c46f', stopDot: '#ff5b3a',
    podTop: '#6e2a3f', podLeft: '#4a1a2a', podRight: '#16050d',
  },
  // second panel - a warm, lit cafe: a near-black room, a lit walnut table, the cup the brightest warm hue
  walnut: {
    paper: '#150a0c', cup: '#e86f46', coffee: '#120605', pitcher: '#d8b27a',
    letters: '#f7ecd6', shadowRGB: '8, 2, 4', stop: '#f2c76a', stopDot: '#ff5b3a',
    podTop: '#684027', podLeft: '#4a2c1a', podRight: '#3a2012',
  },
  // second panel - the contrarian's: bottle green and brass, a copper cup
  racing: {
    paper: '#0e3a2d', cup: '#bd5d37', coffee: '#150a06', pitcher: '#d6bd88',
    letters: '#f7ecd6', shadowRGB: '3, 14, 10', stop: '#e9c46f', stopDot: '#ff5b3a',
    podTop: '#1b5642', podLeft: '#144a39', podRight: '#0a2a20',
  },
  // third panel, 2026-10-31 - a light editorial ground: oat paper, an espresso cup, persimmon letters
  persimmon: {
    paper: '#e7d9c3', cup: '#2f1a12', coffee: '#1c0f0a', pitcher: '#bf8420',
    letters: '#d1401c', shadowRGB: '74, 42, 24', stop: '#2f1a12', stopDot: '#d1401c',
    podTop: '#faf4e8', podLeft: '#cdb99a', podRight: '#c9b595',
  },
  // third panel - a cool night: midnight navy, a dusk-indigo table, copper and caramel
  nightcap: {
    paper: '#0b1230', cup: '#a9532c', coffee: '#2b1710', pitcher: '#e0a868',
    letters: '#fff0d4', shadowRGB: '4, 7, 22', stop: '#f4c27f', stopDot: '#f4c27f',
    podTop: '#3b49a0', podLeft: '#2a3470', podRight: '#1c2455',
  },
  // third panel - patisserie: dusty rose, a pistachio cup, gilt, a cocoa table
  macaron: {
    paper: '#a05a6a', cup: '#6b8b63', coffee: '#2b150f', pitcher: '#d2ad62',
    letters: '#fff4e2', shadowRGB: '52, 22, 34', stop: '#f6dc9a', stopDot: '#f6dc9a',
    podTop: '#341c15', podLeft: '#4a2b22', podRight: '#26130d',
  },
  // Three colours only (owner's call, 2026-10-31: too many colours): a ground, a body and a light, each
  // used for several things - see tri() below
  espresso: tri('#efe6d8', '#2a1810', '#c9452c'),   // cream ground, espresso, a red light
  terracotta: tri('#1b100e', '#b4553a', '#f3e5cc'), // near-black ground, terracotta, cream
  harbour: tri('#10283f', '#b0612f', '#fbf1df'),    // deep navy ground, copper, cream
  // from a photo of a cafe the owner sent (2026-10-31): warm white walls, a white marble counter on pale
  // wood, mustard-yellow curtains, a green espresso machine, crimson anthurium leaves, a walnut floor
  cafe: {
    // from a photo of a cafe the owner sent (2026-10-31): warm white walls, a white marble counter on pale
    // wood, mustard-yellow curtains, a green espresso machine, crimson anthurium leaves, a walnut floor.
    // The milk in the pitcher and the letters poured from it are white (owner's calls)
    paper: '#ebe6de', cup: '#e0b03a', coffee: '#241510', pitcher: '#2f7d56',
    letters: '#ffffff', shadowRGB: '90, 60, 40', stop: '#2f7d56', stopDot: '#b8263e',
    podTop: '#faf8f4', podLeft: '#5a3a2a', podRight: '#d6c2a0',
  },
};

export const DEFAULT = 'oxblood';   // the owner's pick, 2026-10-31: the art director's Oxblood Gilt
const pick = new URLSearchParams(location.search).get('palette');
export const PALETTE_NAME = PALETTES[pick] ? pick : DEFAULT;
export const PALETTE = PALETTES[PALETTE_NAME];

// the page's own colours, for the CSS
const root = document.documentElement.style;
root.setProperty('--paper', PALETTE.paper);
root.setProperty('--stop', PALETTE.stop);
root.setProperty('--stop-dot', PALETTE.stopDot);
if (PALETTE.grain !== undefined) root.setProperty('--grain', PALETTE.grain);
