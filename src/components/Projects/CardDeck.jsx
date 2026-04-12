import { useState, useCallback, useRef, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';
import styled from 'styled-components';
import menuItems from './menuItems';

const DeckContainer = styled.div`
  position: relative;
  width: ${({ theme }) => theme.layout.cardWidth};
  height: ${({ theme }) => theme.layout.cardHeight};
  margin: 0 auto 24px;
  overflow: visible;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 200px;
    height: 300px;
  }
`;

const CardEl = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ theme }) => theme.layout.cardWidth};
  height: ${({ theme }) => theme.layout.cardHeight};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.cardBg};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  touch-action: none;
  will-change: transform;
  user-select: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 200px;
    height: 300px;
    padding: 24px;
  }
`;

const DishIconWrapper = styled.div`
  position: relative;
  margin-bottom: 24px;
  pointer-events: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-bottom: 20px;
  }
`;

const DishIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(195, 191, 255, 0.15);
  border-radius: ${({ theme }) => theme.radii.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 64px; height: 64px; font-size: 1.5rem;
  }
`;

const PriceBadge = styled.div`
  position: absolute;
  bottom: -4px;
  right: -8px;
  background: ${({ theme }) => theme.colors.accentLavender};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.625rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.subtle};
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 0.5625rem;
    padding: 2px 6px;
  }
`;

const DishName = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: lowercase;
  margin-bottom: 8px;
  pointer-events: none;
`;

const DishDesc = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  text-align: center;
  pointer-events: none;
`;


const DISMISS_THRESHOLD = 120;
const FLY_DISTANCE = 1500;

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Individual card with its own spring — completely self-contained
function DeckCard({ item, stackIndex, totalCards, isTopRef, myIndex, onGone, dealDelay }) {
  const cardRef = useRef(null);
  const goneRef = useRef(false);
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);

  // Deal-in: start above with opacity 0, spring into place after staggered delay
  const [spring, api] = useSpring(() => ({
    from: { x: 0, y: -60, rot: 0, scale: 0.85, opacity: 0 },
    to: { x: 0, y: 0, rot: 0, scale: 1, opacity: 1 },
    delay: dealDelay,
    config: { tension: 180, friction: 18 },
  }), []);  // empty deps — never re-create

  const onDown = useCallback((e) => {
    if (goneRef.current || isTopRef.current !== myIndex) return;
    draggingRef.current = true;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [isTopRef, myIndex]);

  const onMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const mx = e.clientX - startRef.current.x;
    const my = e.clientY - startRef.current.y;
    api.start({ x: mx, y: my, rot: mx / 12, scale: 1.04, immediate: true });
  }, [api]);

  const onUp = useCallback((e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const mx = e.clientX - startRef.current.x;
    const my = e.clientY - startRef.current.y;
    const dist = Math.sqrt(mx * mx + my * my);

    if (dist > DISMISS_THRESHOLD) {
      goneRef.current = true;
      const angle = Math.atan2(my, mx);
      api.start({
        x: Math.cos(angle) * FLY_DISTANCE,
        y: Math.sin(angle) * FLY_DISTANCE,
        rot: mx / 6,
        scale: 0.4,
        immediate: false,
        config: { tension: 80, friction: 16 },
        onRest: () => setHidden(true),
      });
      onGone(myIndex);
    } else {
      api.start({
        x: 0, y: 0, rot: 0, scale: 1,
        immediate: false,
        config: { tension: 200, friction: 22 },
      });
    }
  }, [api, myIndex, onGone]);

  if (hidden) return null;

  const zBase = stackIndex + 1;

  return (
    <CardEl
      ref={cardRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{
        x: spring.x,
        y: spring.y,
        opacity: spring.opacity,
        rotateZ: spring.rot.to((r) => `${r}deg`),
        scale: spring.scale,
        zIndex: goneRef.current ? totalCards + 5 : zBase,
        cursor: goneRef.current ? 'default' : 'grab',
        boxShadow: spring.scale.to(
          (s) => `0 ${Math.round(6 * s)}px ${Math.round(20 * s)}px rgba(45,52,54,${(0.06 + (s - 1) * 0.3).toFixed(2)})`
        ),
      }}
    >
      <DishIconWrapper>
        <DishIcon>{item.emoji}</DishIcon>
        <PriceBadge>${item.price}</PriceBadge>
      </DishIconWrapper>
      <DishName>{item.name}</DishName>
      <DishDesc>{item.desc}</DishDesc>
    </CardEl>
  );
}

export default function useCardDeck() {
  const [deckId, setDeckId] = useState(0);
  const [deck, setDeck] = useState(() => shuffleArray(menuItems));
  const [empty, setEmpty] = useState(false);

  // Track top card index via ref only — no re-renders during interaction
  const isTopRef = useRef(deck.length - 1);
  const goneCount = useRef(0);

  const onGone = useCallback((index) => {
    isTopRef.current--;
    goneCount.current++;

    if (goneCount.current >= menuItems.length) {
      // Wait for the last card's fly-out to finish before showing "deal again"
      setTimeout(() => {
        setEmpty(true);
      }, 800);
    }
  }, []);

  const dealAgain = useCallback(() => {
    isTopRef.current = menuItems.length - 1;
    goneCount.current = 0;
    setEmpty(false);
    setDeck(shuffleArray(menuItems));
    setDeckId((d) => d + 1);
  }, []);

  // Don't render cards at all when deck is empty — prevents re-render from resetting springs
  // Deal-in stagger: bottom card (i=0) first, 80ms apart
  const cards = empty ? [] : deck.map((item, i) => (
    <DeckCard
      key={`${deckId}-${i}`}
      item={item}
      stackIndex={i}
      totalCards={deck.length}
      isTopRef={isTopRef}
      myIndex={i}
      onGone={onGone}
      dealDelay={i * 80}
    />
  ));

  return { cards, deckEmpty: empty, dealAgain, DeckContainer };
}
