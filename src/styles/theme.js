// Design tokens — approved in Sprint 2, Phase 2
// Source of truth: Notion Design page

const theme = {
  // ── Colors ────────────────────────────────────
  colors: {
    bg: '#FBF5EE',
    text: '#2D3436',
    textMuted: '#8B8480',
    primary: '#F4A27D',          // deeper coral (Option A)
    primaryHover: '#E88A60',     // darker coral for hover
    secondary: '#FFE5A0',        // kept for hero illustration placeholder
    accentPink: '#D98BA8',       // deeper rose (contact section)
    accentSeafoam: '#4A9088',    // deeper teal (about section)
    accentLavender: '#9B8AD9',   // richer lavender (projects section)
    cardBg: '#FFFBF4',           // warm cream cards
    cardBorder: 'rgba(150, 140, 230, 0.2)', // lavender-tinted
    white: '#FFFFFF',
    divider: 'rgba(45, 52, 54, 0.08)',
  },

  // Section background tints (4% opacity over bg)
  sectionTints: {
    hero: 'rgba(255, 229, 160, 0.04)',
    about: 'rgba(184, 232, 224, 0.04)',
    projects: 'rgba(195, 191, 255, 0.04)',
    contact: 'rgba(253, 204, 229, 0.04)',
  },

  // ── Typography ────────────────────────────────
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
    code: "'JetBrains Mono', monospace",
  },

  fontSizes: {
    h1: 'clamp(2.75rem, 5vw + 1rem, 4.5rem)',
    h2: 'clamp(1.75rem, 3vw + 0.5rem, 2.5rem)',
    h3: 'clamp(1.25rem, 2vw + 0.25rem, 1.5rem)',
    body: '1rem',
    small: '0.8125rem',
    nav: '0.875rem',
    button: '0.875rem',
    code: '0.875rem',
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    h1: 1.1,
    h2: 1.2,
    h3: 1.3,
    body: 1.7,
  },

  // ── Spacing (8px grid) ────────────────────────
  spacing: {
    unit: 8,
    sectionPadding: '120px',
    contentPadding: 'clamp(24px, 5vw, 80px)',
    componentGap: '24px',
    stackGapSmall: '16px',
    stackGapLarge: '24px',
  },

  // ── Layout ────────────────────────────────────
  layout: {
    maxWidth: '1120px',
    navHeight: '64px',
    heroHeight: 'min(100vh, 900px)',
    cardWidth: '240px',
    cardHeight: '360px',
  },

  // ── Breakpoints ───────────────────────────────
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },

  // ── Border Radius ─────────────────────────────
  radii: {
    sm: '8px',
    md: '16px',
    lg: '9999px', // pill
    full: '50%',
  },

  // ── Shadows ───────────────────────────────────
  shadows: {
    subtle: '0 2px 8px rgba(45, 52, 54, 0.06)',
    md: '0 8px 24px rgba(45, 52, 54, 0.1)',
    lg: '0 16px 48px rgba(45, 52, 54, 0.14)',
    nav: '0 1px 0 rgba(45, 52, 54, 0.06)',
  },
};

export default theme;
