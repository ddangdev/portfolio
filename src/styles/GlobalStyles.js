import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* CSS var defaults so first paint has correct colors before the spring
     hook runs. The spring then takes over per-frame. */
  :root {
    --color-bg: #FBF5EE;
    --color-text: #2D3436;
    --color-textMuted: #8B8480;
    --color-heroBg: #FFF3E0;
    --color-aboutBg: #E8F5EC;
    --color-projectsBg: #EDE7F6;
    --color-contactBg: #FCE4EC;
    --color-cardBg: #FFFBF4;
    --color-primary: #F4A27D;
  }
  :root[data-theme="dark"] {
    --color-bg: #1F1A17;
    --color-text: #F5EDE2;
    --color-textMuted: #9A8F85;
    --color-heroBg: #241E1A;
    --color-aboutBg: #1E2423;
    --color-projectsBg: #231F28;
    --color-contactBg: #281F26;
    --color-cardBg: #2A2320;
    --color-primary: #E88A60;
  }

  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    overflow-x: clip;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.fontSizes.body};
    line-height: ${({ theme }) => theme.lineHeights.body};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: clip;
  }

  /* Short CSS transition catches only non-spring-driven tokens (rgba overlays
     like nav bg, modal backdrop, soft cards). Spring-driven CSS vars update
     every frame and don't need a CSS transition on top. */
  *, *::before, *::after {
    transition-property: background-color, border-color, fill, stroke, box-shadow;
    transition-duration: 0.12s;
    transition-timing-function: ease-out;
  }

  /* Soft vignette — darkens edges to draw eye inward */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9998;
    background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 50%, rgba(45, 52, 54, 0.06) 100%);
  }

  /* Film grain overlay */
  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.07;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 256px 256px;
  }

  /* Focus styles for keyboard navigation */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
    border-radius: 4px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    html { scroll-behavior: auto; }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  img {
    max-width: 100%;
    display: block;
  }

  /* Skip to content link for screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
`;

export default GlobalStyles;
