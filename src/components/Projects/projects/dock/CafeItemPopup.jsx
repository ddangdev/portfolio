import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSpring, animated } from '@react-spring/web';

// Floating popup tethered above the clicked icon.
// `leftX` is the x-offset (relative to the dock) of the clicked icon's center.

const Wrapper = styled(animated.div)`
  position: absolute;
  bottom: calc(100% + 16px);
  width: 280px;
  transform-origin: bottom center;
  will-change: transform, opacity;
  z-index: 20;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 240px;
  }

  ${({ $modal }) => $modal && `
    position: fixed;
    bottom: auto;
    top: 50%;
    left: 50% !important;
    margin-left: -140px !important;
    transform-origin: center;
    width: 280px;
    margin-top: -140px;
  `}
`;

const Backdrop = styled(animated.div)`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.modalBackdrop};
  z-index: 15;
`;

const Card = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 20px 22px 22px;
  text-align: left;
`;

// Small downward-pointing triangle under the card,
// tethering it visually to the clicked icon.
const Arrow = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid ${({ theme }) => theme.colors.cardBg};
  filter: drop-shadow(0 2px 2px rgba(45, 52, 54, 0.08));
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
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

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-right: 28px; /* space for close button */
`;

const Name = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin: 0;
`;

const PriceBadge = styled.span`
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.code};
  font-variant-numeric: tabular-nums;
  font-size: 0.8125rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

const Section = styled.div`
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Ingredients = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const IngredientPill = styled.span`
  background: rgba(155, 138, 217, 0.12);
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.75rem;
  text-transform: lowercase;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.lg};
  line-height: 1.4;
`;

const PrepText = styled.p`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
  margin: 0;
  text-transform: lowercase;
`;

function CafeItemPopup({ item, leftX, onClose, modal = false }) {
  const cardRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Entrance animation: fade + rise + slight scale
  const spring = useSpring({
    from: { opacity: 0, transform: 'translateY(8px) scale(0.96)' },
    to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
    config: { tension: 300, friction: 24 },
  });

  // ESC key dismissal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Click-outside dismissal
  useEffect(() => {
    const onClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Defer to next tick so the click that opened it doesn't immediately close
    const id = setTimeout(() => {
      document.addEventListener('mousedown', onClick);
    }, 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  // Focus the close button on open (so ESC / space works immediately)
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  return (
    <>
      {modal && <Backdrop onClick={onClose} style={{ opacity: spring.opacity }} />}
      <Wrapper
        role="dialog"
        aria-labelledby="cafe-item-name"
        aria-describedby="cafe-item-prep"
        $modal={modal}
        style={{
          left: modal ? undefined : `${leftX}px`,
          marginLeft: modal ? undefined : '-140px',
          ...spring,
        }}
      >
        <Card ref={cardRef}>
          <CloseButton
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="close details"
          >
            ×
          </CloseButton>
          <Header>
            <Name id="cafe-item-name">{item.name}</Name>
            <PriceBadge>${item.price.toFixed(2)}</PriceBadge>
          </Header>
          <Section>
            <Label>ingredients</Label>
            <Ingredients>
              {item.ingredients.map((ing) => (
                <IngredientPill key={ing}>{ing}</IngredientPill>
              ))}
            </Ingredients>
          </Section>
          <Section>
            <Label>preparation</Label>
            <PrepText id="cafe-item-prep">{item.preparation}</PrepText>
          </Section>
          {!modal && <Arrow />}
        </Card>
      </Wrapper>
    </>
  );
}

export default CafeItemPopup;
