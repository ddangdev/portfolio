// Design tokens — light + dark ("twilight") palettes.
// Structure shared between both; only the colors object and shadows swap.
// Approved in Sprint 22, Phase 1.

const shared = {
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
    code: "'JetBrains Mono', monospace",
    blog: "'Fraunces', 'Spectral', Georgia, serif",
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
  fontWeights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { h1: 1.1, h2: 1.2, h3: 1.3, body: 1.7 },
  spacing: {
    unit: 8,
    sectionPadding: '120px',
    contentPadding: 'clamp(24px, 5vw, 80px)',
    componentGap: '24px',
    stackGapSmall: '16px',
    stackGapLarge: '24px',
  },
  layout: {
    maxWidth: '1120px',
    navHeight: '64px',
    heroHeight: 'min(100vh, 900px)',
    cardWidth: '240px',
    cardHeight: '360px',
  },
  breakpoints: { mobile: '480px', tablet: '768px', desktop: '1024px' },
  radii: { sm: '8px', md: '16px', lg: '9999px', full: '50%' },
};

// Spring-driven surface colors: theme refers to CSS vars updated per frame
// by useThemeSpring. Raw hex values live in ./palettes.js.
const springVar = (name) => `var(--color-${name})`;

export const lightTheme = {
  ...shared,
  mode: 'light',
  colors: {
    bg: springVar('bg'),
    text: springVar('text'),
    textMuted: springVar('textMuted'),
    primary: springVar('primary'),
    primaryHover: '#E88A60',
    accentLavenderHover: '#8879C9',
    secondary: '#FFE5A0',
    accentPink: '#D98BA8',
    accentSeafoam: '#4A9088',
    accentLavender: '#9B8AD9',
    cardBg: springVar('cardBg'),
    cardBorder: 'rgba(150, 140, 230, 0.2)',
    white: '#FFFFFF',
    divider: 'rgba(45, 52, 54, 0.08)',
    // Section bg + transitions (sunset palette flow) — spring-driven
    heroBg: springVar('heroBg'),
    aboutBg: springVar('aboutBg'),
    projectsBg: springVar('projectsBg'),
    contactBg: springVar('contactBg'),
    // Frosted-glass overlays for floating surfaces
    navBg: 'rgba(251, 245, 238, 0.72)',
    footerBg: 'rgba(251, 245, 238, 0.4)',
    toggleBg: 'rgba(251, 245, 238, 0.85)',
    toggleBgHover: 'rgba(251, 245, 238, 1)',
    modalBackdrop: 'rgba(45, 52, 54, 0.12)',
    // Translucent card tints used inside demos (warm cream on light)
    softCard: 'rgba(255, 251, 244, 0.7)',
    softCardStrong: 'rgba(255, 251, 244, 0.9)',
    stripBg: 'rgba(255, 255, 255, 0.45)',
    // Blog-specific (Sprint 23)
    blogRule: '#E8DDC9',
    blogIlloStroke: '#4A2E1F',
  },
  sectionTints: {
    hero: 'rgba(255, 229, 160, 0.04)',
    about: 'rgba(184, 232, 224, 0.04)',
    projects: 'rgba(195, 191, 255, 0.04)',
    contact: 'rgba(253, 204, 229, 0.04)',
  },
  shadows: {
    subtle: '0 2px 8px rgba(45, 52, 54, 0.06)',
    md: '0 8px 24px rgba(45, 52, 54, 0.1)',
    lg: '0 16px 48px rgba(45, 52, 54, 0.14)',
    nav: '0 1px 0 rgba(45, 52, 54, 0.06)',
  },
};

export const darkTheme = {
  ...shared,
  mode: 'dark',
  colors: {
    bg: springVar('bg'),
    text: springVar('text'),
    textMuted: springVar('textMuted'),
    primary: springVar('primary'),
    primaryHover: '#D4724A',
    accentLavenderHover: '#9B8AD9',
    secondary: '#5C4A3A',    // muted amber
    accentPink: '#E8A0BC',   // softer rose, reads on dark
    accentSeafoam: '#6BAFA4',// brighter teal
    accentLavender: '#B29FE8',// brighter lavender
    cardBg: springVar('cardBg'),
    cardBorder: 'rgba(178, 159, 232, 0.25)',
    white: '#FFFFFF',
    divider: 'rgba(245, 237, 226, 0.08)',
    // Twilight section progression — spring-driven
    heroBg: springVar('heroBg'),
    aboutBg: springVar('aboutBg'),
    projectsBg: springVar('projectsBg'),
    contactBg: springVar('contactBg'),
    navBg: 'rgba(31, 26, 23, 0.8)',
    footerBg: 'rgba(31, 26, 23, 0.6)',
    toggleBg: 'rgba(42, 35, 32, 0.85)',
    toggleBgHover: 'rgba(42, 35, 32, 1)',
    modalBackdrop: 'rgba(0, 0, 0, 0.45)',
    // Warm dark tints so demo inner surfaces stay warm, not pharmaceutical
    softCard: 'rgba(58, 48, 42, 0.65)',
    softCardStrong: 'rgba(58, 48, 42, 0.85)',
    stripBg: 'rgba(58, 48, 42, 0.45)',
    // Blog-specific (Sprint 23)
    blogRule: '#3A332E',
    blogIlloStroke: '#E8DDC9',
  },
  sectionTints: {
    hero: 'rgba(255, 229, 160, 0.035)',
    about: 'rgba(107, 175, 164, 0.05)',
    projects: 'rgba(178, 159, 232, 0.05)',
    contact: 'rgba(232, 160, 188, 0.05)',
  },
  shadows: {
    subtle: '0 2px 8px rgba(0, 0, 0, 0.35)',
    md: '0 8px 24px rgba(0, 0, 0, 0.45)',
    lg: '0 16px 48px rgba(0, 0, 0, 0.55)',
    nav: '0 1px 0 rgba(245, 237, 226, 0.06)',
  },
};

// Default export keeps existing imports working (points to light).
// App.jsx swaps to darkTheme via ThemeContext.
export default lightTheme;
