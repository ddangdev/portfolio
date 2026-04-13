// Styled components for the poke bar feature.

import styled from 'styled-components';
import { animated } from '@react-spring/web';

// ── Layout shell ────────────────────────────────────────────────
export const Layout = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: stretch;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

// ── Grid panel (left side) ──────────────────────────────────────
// Wrapper has a relative position so the fade-out gradient overlay can
// absolute-position itself at the bottom edge.
export const GridPanel = styled.div`
  position: relative;
`;

// The actual scrollable grid of tiles.
export const ScrollArea = styled.div`
  max-height: 460px;
  overflow-y: auto;
  padding-right: 8px;
  padding-bottom: 32px;

  /* Subtle scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(155, 138, 217, 0.3);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(155, 138, 217, 0.5);
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(155, 138, 217, 0.3) transparent;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    max-height: 380px;
  }
`;

// Bottom fade-out overlay so the last row of tiles softly disappears.
export const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 8px;
  height: 60px;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(237, 231, 246, 0) 0%,
    rgba(237, 231, 246, 0.85) 70%,
    rgba(237, 231, 246, 1) 100%
  );
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

export const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

// Header for category groups within the grid (base / protein / etc.)
export const CategoryHeader = styled.h4`
  grid-column: 1 / -1;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.12em;
  margin: 8px 0 0 0;

  &:first-child {
    margin-top: 0;
  }
`;

// ── Tile ────────────────────────────────────────────────────────
export const Tile = styled.button`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 14px;
  padding: 14px 10px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.accentLavender};
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover { transform: none; }
    &:active { transform: none; }
  }

  ${({ $selected, theme }) => $selected && `
    background: ${theme.colors.accentLavender}1A;
    border-color: ${theme.colors.accentLavender};
    box-shadow: 0 0 0 2px ${theme.colors.accentLavender}40;
  `}
`;

export const TileIcon = styled.div`
  color: ${({ theme }) => theme.colors.accentLavender};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
  }
`;

export const TileName = styled.span`
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  line-height: 1.2;
`;

export const TilePrice = styled.span`
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.accentLavender};
  font-variant-numeric: tabular-nums;
`;

// ── Receipt panel (right side) ──────────────────────────────────
export const ReceiptPanel = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 24px 22px;
  display: flex;
  flex-direction: column;
  min-height: 460px;
  box-shadow: ${({ theme }) => theme.shadows.subtle};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    min-height: auto;
    ${({ $expanded }) => !$expanded && `
      & > div[role="list"] { display: none; }
    `}
  }
`;

export const ReceiptHeader = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  text-align: center;
  margin: 0 0 16px;
`;

// Mobile-only toggle inside the receipt header — collapses line items to save space.
export const MobileToggle = styled.button`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
    margin-top: 6px;
    padding: 6px 12px;
    border: 1px solid ${({ theme }) => theme.colors.divider};
    background: transparent;
    border-radius: 9999px;
    font-family: ${({ theme }) => theme.fonts.code};
    font-size: 0.6875rem;
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: lowercase;
    letter-spacing: 0.08em;
    cursor: pointer;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.divider};
  margin: 8px 0;
`;

export const Lines = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 12px 0;
  min-height: 80px;
`;

// On mobile the ReceiptPanel defaults to collapsed (summary only);
// when $expanded is true, lines become visible again.
export const ReceiptPanelMobileStyles = '';

export const Line = styled(animated.div)`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
`;

export const LineName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const LinePrice = styled.span`
  font-family: ${({ theme }) => theme.fonts.code};
  font-variant-numeric: tabular-nums;
  font-size: 0.75rem;
`;

export const RemoveBtn = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPink};
    color: ${({ theme }) => theme.colors.white};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const Empty = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8125rem;
  text-transform: lowercase;
  font-style: italic;
  padding: 24px 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: lowercase;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9375rem;
  margin-top: 4px;
`;

export const TotalValue = styled.span`
  font-family: ${({ theme }) => theme.fonts.code};
  font-variant-numeric: tabular-nums;
`;

export const CheckoutBtn = styled.button`
  margin-top: 12px;
  padding: 12px;
  border: none;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: 0.9375rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;

  &:hover { background: #8879C9; }
  &:active { transform: scale(0.98); }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }
`;

export const ClearBtn = styled.button`
  margin-top: 8px;
  padding: 8px;
  border: 1.5px solid ${({ theme }) => theme.colors.divider};
  border-radius: 9999px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.75rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentLavender};
    color: ${({ theme }) => theme.colors.text};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ── Idle state ──────────────────────────────────────────────────
export const IdleWrap = styled(animated.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 8px;
  gap: 10px;
`;

export const IdleHeading = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.375rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin: 0;
`;

export const IdleBody = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  line-height: 1.5;
  margin: 0 0 8px;
  max-width: 220px;
`;

export const StartBtn = styled.button`
  padding: 10px 28px;
  border: none;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: 0.875rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;

  &:hover { background: #8879C9; }
  &:active { transform: scale(0.98); }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }
`;

export const LoyaltyField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 18px;
  width: 100%;
  max-width: 220px;
`;

export const LoyaltyLabel = styled.label`
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.12em;
  text-align: left;
`;

export const LoyaltyRow = styled.div`
  display: flex;
  gap: 6px;
`;

export const LoyaltyInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.divider};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.cardBg};
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  transition: border-color 0.15s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
    text-transform: lowercase;
    letter-spacing: normal;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accentLavender};
  }

  &[aria-invalid='true'] {
    border-color: ${({ theme }) => theme.colors.accentPink};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const VerifyBtn = styled.button`
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.accentLavender};
  border-radius: 8px;
  background: transparent;
  color: ${({ theme }) => theme.colors.accentLavender};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: lowercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentLavender};
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const LoyaltyHint = styled.span`
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: 0.6875rem;
  text-align: left;
  margin-top: 2px;
  color: ${({ theme, $valid }) =>
    $valid ? theme.colors.accentSeafoam || theme.colors.accentLavender : theme.colors.accentPink};
  text-transform: lowercase;
`;

// ── Success state ───────────────────────────────────────────────
export const SuccessWrap = styled(animated.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 0;
`;

export const CheckCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.875rem;
  margin-bottom: 16px;
  line-height: 1;
`;

export const SuccessHeading = styled.h4`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin: 0 0 6px;
`;

export const SuccessBody = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  line-height: 1.5;
  margin: 0;
  max-width: 220px;
`;
