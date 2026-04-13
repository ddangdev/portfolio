// Styled components + tuning constants for CafeDock.
// Keeps the main component file focused on interaction logic + JSX.

import styled from 'styled-components';
import { animated } from '@react-spring/web';

// ── Dock tuning (also imported by CafeDock.jsx) ──────────────────
export const BASE_SIZE = 44;        // default icon size in px
export const MAX_SCALE = 2.2;       // peak magnification on cursor-over
export const FALLOFF = 130;         // px from icon center where scaling ends
export const ICON_GAP = 14;         // spacing between icons
export const DOCK_PADDING_X = 24;   // horizontal padding inside the dock
export const CELL_WIDTH = BASE_SIZE + ICON_GAP;

// SVG paints at peak magnified size so scaling stays vector-crisp.
const RENDER_SIZE = Math.round(BASE_SIZE * MAX_SCALE);

// ── Styled components ───────────────────────────────────────────

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 440px; /* match the Stage min-height so dock centers vertically */
  padding: 24px 8px;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    min-height: 400px;
  }
`;

export const Tooltip = styled(animated.div)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  letter-spacing: 0.04em;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.cardBg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  margin-bottom: 16px;
  min-height: 26px;
  pointer-events: none;
`;

export const DockShell = styled.div`
  position: relative; /* anchor for the floating popup */
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: ${ICON_GAP}px;
  padding: 18px ${DOCK_PADDING_X}px 14px;
  background: rgba(255, 251, 244, 0.7);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  min-height: 80px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    gap: 8px;
    padding: 12px 14px 10px;
    min-height: 64px;
  }
`;

// Small step-through arrows flanking the icon row — rotate the
// visible order of icons, with the popup following if open.
export const DockArrow = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid ${({ theme }) => theme.colors.accentLavender};
  background: rgba(255, 251, 244, 0.9);
  color: ${({ theme }) => theme.colors.accentLavender};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  font-family: inherit;
  flex-shrink: 0;
  align-self: center;
  transition: background 0.15s, color 0.15s, transform 0.12s;

  &:hover {
    background: ${({ theme }) => theme.colors.accentLavender};
    color: ${({ theme }) => theme.colors.white};
  }

  &:active {
    transform: scale(0.92);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 26px;
    height: 26px;
    font-size: 0.75rem;
  }
`;

// Track holds all icons as absolute-positioned children with individual springs.
// overflow:visible lets the magnified icon grow past the top, but we clip
// horizontally via the inline style (width prop) so extra icons stay hidden.
export const IconTrack = styled.div`
  position: relative;
  height: ${BASE_SIZE}px;
  flex-shrink: 0;
  overflow-x: clip;
  overflow-y: visible;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 36px;
  }
`;

export const IconCell = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: ${BASE_SIZE}px;
  height: ${BASE_SIZE}px;
  overflow: visible;
  will-change: transform;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 36px;
    height: 36px;
  }
`;

export const IconBody = styled(animated.div)`
  /* Painted at RENDER_SIZE, scale DOWN by default so magnifying stays ≤ 1
     (crisp vector). Absolute so overflow doesn't affect flex-end alignment. */
  position: absolute;
  left: 50%;
  bottom: 0;
  margin-left: -${RENDER_SIZE / 2}px;
  width: ${RENDER_SIZE}px;
  height: ${RENDER_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  transform-origin: 50% 100%;
  cursor: pointer;

  svg {
    width: 100%;
    height: 100%;
    shape-rendering: geometricPrecision;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

// ── Mobile grid (shown below tablet breakpoint) ─────────────────
// Replaces the horizontal dock with a 3-col grid of tappable icons.
// Magnification + arrows are desktop-only (cursor behavior + fits in one row).
export const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 16px;
  background: rgba(255, 251, 244, 0.7);
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  width: 100%;
  max-width: 320px;
`;

export const MobileTile = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.cardBg};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-family: inherit;
  padding: 10px;
  transition: transform 0.12s, border-color 0.15s, box-shadow 0.15s;

  svg {
    width: 70%;
    height: 70%;
    shape-rendering: geometricPrecision;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentLavender};
    box-shadow: ${({ theme }) => theme.shadows.subtle};
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  ${({ $selected, theme }) => $selected && `
    border-color: ${theme.colors.accentLavender};
    background: ${theme.colors.accentLavender}1A;
  `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:active { transform: none; }
  }
`;

export const Caption = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin-top: 20px;
  text-align: center;
  max-width: 420px;
`;
