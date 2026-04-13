// Styled components for ContactFormPopup.
// Kept in a separate file so the main component reads as logic + JSX only.

import styled from 'styled-components';
import { animated } from '@react-spring/web';

export const Backdrop = styled(animated.div)`
  position: fixed;
  inset: 0;
  background: rgba(45, 52, 54, 0.24);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
`;

export const Card = styled(animated.div)`
  width: 100%;
  max-width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  background: #FFF5F7;
  border: 1px solid rgba(217, 139, 168, 0.6);
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 32px 28px 28px;
  text-align: left;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font-size: 1.25rem;
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

export const Heading = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.375rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin: 0 0 6px 0;
`;

export const Subhead = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin: 0 0 20px 0;
`;

export const FieldGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

const fieldBaseStyles = `
  width: 100%;
  padding: 10px 14px;
  border: 2px solid rgba(217, 139, 168, 0.3);
  border-radius: 10px;
  background: #FFFBF4;
  font-family: inherit;
  font-size: 0.9375rem;
  color: #2D3436;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: rgba(45, 52, 54, 0.35);
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: #D98BA8;
    box-shadow: 0 0 0 3px rgba(217, 139, 168, 0.15);
  }

  &[aria-invalid='true'] {
    border-color: #C44D7A;
  }
`;

export const Input = styled.input`${fieldBaseStyles}`;

export const Textarea = styled.textarea`
  ${fieldBaseStyles}
  resize: vertical;
  min-height: 92px;
  line-height: 1.5;
  font-family: inherit;
`;

export const ErrorText = styled.p`
  font-size: 0.75rem;
  color: #C44D7A;
  margin: 4px 0 0 0;
  text-transform: lowercase;
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 12px 18px;
  border: none;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.accentPink};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: 0.9375rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.18s, transform 0.12s;

  &:hover {
    background: #C44D7A;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Visually hidden honeypot — bots auto-fill any input they see.
// Real humans never interact with it. Server-side, a filled value = bot.
export const HoneypotField = styled.div`
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
`;

// Error banner shown above the submit button on network/server failure
export const ErrorBanner = styled.div`
  background: rgba(196, 77, 122, 0.1);
  border: 1px solid rgba(196, 77, 122, 0.3);
  color: #C44D7A;
  font-size: 0.8125rem;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 12px;
  text-transform: lowercase;
  line-height: 1.4;
`;

// Small inline spinner for the loading state
export const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  vertical-align: -2px;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── Success state ───────────────────────────────────────────────

export const SuccessWrapper = styled.div`
  padding: 32px 8px 16px;
  text-align: center;
`;

export const CheckCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentPink};
  color: ${({ theme }) => theme.colors.white};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.875rem;
  margin: 0 auto 18px;
  line-height: 1;
`;

export const SuccessHeading = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin: 0 0 8px 0;
`;

export const SuccessBody = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  line-height: 1.5;
  margin: 0;
`;
