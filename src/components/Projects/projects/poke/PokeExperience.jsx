import { useState, useCallback, useEffect, useRef, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useTransition, useSpring, animated } from '@react-spring/web';
import { trackEvent } from '../../../../utils/analytics';

// Matches a viewport media query reactively.
function useMedia(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia?.(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [query]);
  return matches;
}

// Matches the OS-level "reduce motion" pref — used to skip spring animations.
function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}
import { pokeMenu } from './PokeIcons';
import {
  Layout, GridPanel, ScrollArea, FadeOverlay, TileGrid, CategoryHeader,
  Tile, TileIcon, TileName, TilePrice,
  ReceiptPanel, ReceiptHeader, Divider, Lines, Line, LineName,
  LinePrice, RemoveBtn, Empty, TotalRow, TotalValue,
  CheckoutBtn, ClearBtn,
  SuccessWrap, CheckCircle, SuccessHeading, SuccessBody,
  IdleWrap, IdleHeading, IdleBody, StartBtn,
  LoyaltyField, LoyaltyLabel, LoyaltyInput, LoyaltyHint,
  LoyaltyRow, VerifyBtn, MobileToggle,
} from './pokeStyles';

// Animated ghost icon that flies from a source rect to a target rect.
// Renders via portal so it can float above all layout, then self-destructs onRest.
function FlyingIcon({ Icon, src, dst, onDone, immediate }) {
  const style = useSpring({
    from: { x: src.x, y: src.y, opacity: 1, scale: 1 },
    to: { x: dst.x, y: dst.y, opacity: 0, scale: 0.3 },
    config: { tension: 220, friction: 22 },
    immediate,
    onRest: onDone,
  });
  return createPortal(
    <animated.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 40,
        height: 40,
        pointerEvents: 'none',
        color: '#9B8AD9',
        zIndex: 9999,
        transform: style.x.to((x) =>
          `translate(${x}px, ${style.y.get()}px) scale(${style.scale.get()})`
        ),
        opacity: style.opacity,
      }}
    >
      <Icon />
    </animated.div>,
    document.body,
  );
}

// Promo code: exactly 6 alphanumeric chars (case-insensitive). Grants 10% off.
const PROMO_REGEX = /^[a-z0-9]{6}$/i;
const PROMO_DISCOUNT = 0.10;

const CATEGORY_LABELS = {
  base: 'base',
  protein: 'protein',
  topping: 'toppings',
  sauce: 'sauces',
};

// Group items by their category in their original order so headers
// can break the grid into labeled sections.
function groupByCategory(items) {
  const groups = [];
  let currentCat = null;
  for (const item of items) {
    if (item.category !== currentCat) {
      groups.push({ category: item.category, items: [item] });
      currentCat = item.category;
    } else {
      groups[groups.length - 1].items.push(item);
    }
  }
  return groups;
}

function IdleScreen({
  loyalty, setLoyalty, loyaltyApplied, loyaltyError,
  setLoyaltyApplied, setLoyaltyError, verifyLoyalty, onStart,
}) {
  const reducedMotion = useReducedMotion();
  // Spring lives in this component so it runs exactly once per mount —
  // avoids re-triggering on every keystroke while typing the loyalty code.
  const spring = useSpring({
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: { tension: 220, friction: 24 },
    immediate: reducedMotion,
  });

  return (
    <IdleWrap style={spring}>
      <IdleHeading>new order?</IdleHeading>
      <IdleBody>tap an ingredient to start building your bowl.</IdleBody>
      <StartBtn onClick={onStart}>start order</StartBtn>
      <LoyaltyField>
        <LoyaltyLabel htmlFor="poke-loyalty">loyalty code</LoyaltyLabel>
        <LoyaltyRow>
          <LoyaltyInput
            id="poke-loyalty"
            type="text"
            value={loyalty}
            onChange={(e) => {
              setLoyalty(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
              setLoyaltyApplied(false);
              setLoyaltyError(false);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') verifyLoyalty(); }}
            placeholder="6 characters"
            autoComplete="off"
            maxLength={6}
            aria-invalid={loyaltyError}
            disabled={loyaltyApplied}
          />
          <VerifyBtn
            type="button"
            onClick={verifyLoyalty}
            disabled={loyalty.length === 0 || loyaltyApplied}
          >
            {loyaltyApplied ? '✓' : 'verify'}
          </VerifyBtn>
        </LoyaltyRow>
        {(loyaltyApplied || loyaltyError) && (
          <LoyaltyHint $valid={loyaltyApplied}>
            {loyaltyApplied ? '10% off applied' : 'code must be 6 characters'}
          </LoyaltyHint>
        )}
      </LoyaltyField>
    </IdleWrap>
  );
}

function PokeExperience() {
  // Each entry is a full menu item — same items can appear multiple times
  // (we aggregate to display lines with a quantity multiplier in the receipt)
  const [order, setOrder] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [started, setStarted] = useState(false);
  const [loyalty, setLoyalty] = useState('');
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);
  const [loyaltyError, setLoyaltyError] = useState(false);
  const [flying, setFlying] = useState([]);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const receiptRef = useRef(null);
  const tileRefs = useRef([]);
  const reducedMotion = useReducedMotion();
  const isMobile = useMedia('(max-width: 768px)');

  const verifyLoyalty = useCallback(() => {
    if (PROMO_REGEX.test(loyalty)) {
      setLoyaltyApplied(true);
      setLoyaltyError(false);
    } else {
      setLoyaltyApplied(false);
      setLoyaltyError(true);
    }
  }, [loyalty]);

  const toggleItem = useCallback((item, sourceEl) => {
    if (submitted) return;
    setStarted(true);
    let adding = false;
    setOrder((prev) => {
      const alreadyIn = prev.some((it) => it.id === item.id);
      if (alreadyIn) return prev.filter((it) => it.id !== item.id);
      adding = true;
      if (item.category === 'base') {
        return [...prev.filter((it) => it.category !== 'base'), item];
      }
      return [...prev, item];
    });
    // Fire a flying ghost icon from the tile to the receipt when adding
    if (adding && sourceEl && receiptRef.current) {
      const sr = sourceEl.getBoundingClientRect();
      const dr = receiptRef.current.getBoundingClientRect();
      const src = { x: sr.left + sr.width / 2 - 20, y: sr.top + sr.height / 2 - 20 };
      const dst = { x: dr.left + dr.width / 2 - 20, y: dr.top + 40 };
      const key = `${item.id}-${Date.now()}-${Math.random()}`;
      setFlying((prev) => [...prev, { key, Icon: item.Icon, src, dst }]);
    }
  }, [submitted]);

  const removeFlying = useCallback((key) => {
    setFlying((prev) => prev.filter((f) => f.key !== key));
  }, []);

  const removeOne = useCallback((id) => {
    setOrder((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }, []);

  const clearOrder = useCallback(() => setOrder([]), []);

  const checkout = useCallback(() => {
    if (order.length === 0 || submitted) return;
    trackEvent('poke_checkout', { items: order.length, loyalty_applied: loyaltyApplied });
    setSubmitted(true);
    // Auto-reset after a moment so the UI is ready for a new order
    setTimeout(() => {
      setOrder([]);
      setSubmitted(false);
      setStarted(false);
      setLoyalty('');
      setLoyaltyApplied(false);
      setLoyaltyError(false);
    }, 3500);
  }, [order.length, submitted, loyaltyApplied]);

  // Aggregate identical items into single lines with a quantity counter
  const lines = Object.values(
    order.reduce((acc, item) => {
      if (acc[item.id]) {
        acc[item.id].qty += 1;
      } else {
        acc[item.id] = { ...item, qty: 1 };
      }
      return acc;
    }, {})
  );

  const subtotal = order.reduce((sum, item) => sum + item.price, 0);
  const discount = loyaltyApplied ? subtotal * PROMO_DISCOUNT : 0;
  const total = subtotal - discount;

  // Animated entrance/exit for receipt lines
  const lineTransitions = useTransition(lines, {
    keys: (line) => line.id,
    from: { opacity: 0, transform: 'translateX(20px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    leave: { opacity: 0, transform: 'translateX(-20px)' },
    config: { tension: 280, friction: 24 },
    immediate: reducedMotion,
  });

  // Crossfade between receipt and success states
  const successSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.96)' },
    to: { opacity: 1, transform: 'scale(1)' },
    reset: submitted,
    config: { tension: 260, friction: 22 },
    immediate: reducedMotion,
  });


  const groups = groupByCategory(pokeMenu);
  const flatItems = pokeMenu; // flat index matches tileRefs order

  // Arrow-key navigation across the tile grid (roving tabindex pattern).
  // Grid is 3 cols desktop, 2 cols mobile — we use 3 here for keyboard nav
  // (small mobile viewports typically use touch, not arrow keys).
  const COLS = 3;
  const onGridKeyDown = (e) => {
    const n = flatItems.length;
    let next = focusedIdx;
    if (e.key === 'ArrowRight') next = Math.min(n - 1, focusedIdx + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(0, focusedIdx - 1);
    else if (e.key === 'ArrowDown') next = Math.min(n - 1, focusedIdx + COLS);
    else if (e.key === 'ArrowUp') next = Math.max(0, focusedIdx - COLS);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setFocusedIdx(next);
    tileRefs.current[next]?.focus();
  };

  return (
    <Layout>
      {/* ─── Left: scrollable item grid with bottom fade ─── */}
      {/* On mobile, hide the menu until the user taps "start order" */}
      {(!isMobile || started) && <GridPanel>
        <ScrollArea aria-label="poke bar menu">
          <TileGrid role="grid" onKeyDown={onGridKeyDown}>
            {(() => {
              let flat = -1;
              return groups.map((g) => (
              <Fragment key={g.category}>
                <CategoryHeader>
                  {CATEGORY_LABELS[g.category]}
                </CategoryHeader>
                {g.items.map((item) => {
                  flat += 1;
                  const idx = flat;
                  const Icon = item.Icon;
                  const selected = order.some((it) => it.id === item.id);
                  return (
                    <Tile
                      key={item.id}
                      ref={(el) => { tileRefs.current[idx] = el; }}
                      role="gridcell"
                      tabIndex={idx === focusedIdx ? 0 : -1}
                      onClick={(e) => toggleItem(item, e.currentTarget)}
                      onFocus={() => setFocusedIdx(idx)}
                      aria-label={`${selected ? 'remove' : 'add'} ${item.name}`}
                      aria-pressed={selected}
                      $selected={selected}
                      disabled={submitted}
                    >
                      <TileIcon><Icon /></TileIcon>
                      <TileName>{item.name}</TileName>
                      <TilePrice>${item.price.toFixed(2)}</TilePrice>
                    </Tile>
                  );
                })}
              </Fragment>
              ));
            })()}
          </TileGrid>
        </ScrollArea>
        <FadeOverlay aria-hidden="true" />
      </GridPanel>}

      {/* ─── Right: receipt panel ─── */}
      <ReceiptPanel ref={receiptRef} aria-label="your order" $expanded={mobileExpanded}>
        {submitted ? (
          <SuccessWrap style={successSpring}>
            <CheckCircle>✓</CheckCircle>
            <SuccessHeading>order placed</SuccessHeading>
            <SuccessBody>
              thanks! we'll start on your bowl right away.
            </SuccessBody>
          </SuccessWrap>
        ) : !started ? (
          <IdleScreen
            loyalty={loyalty}
            setLoyalty={setLoyalty}
            loyaltyApplied={loyaltyApplied}
            loyaltyError={loyaltyError}
            setLoyaltyApplied={setLoyaltyApplied}
            setLoyaltyError={setLoyaltyError}
            verifyLoyalty={verifyLoyalty}
            onStart={() => setStarted(true)}
          />
        ) : (
          <>
            <ReceiptHeader>
              your order
              <MobileToggle
                type="button"
                onClick={() => setMobileExpanded((v) => !v)}
                aria-expanded={mobileExpanded}
                aria-label={mobileExpanded ? 'collapse order' : 'expand order'}
              >
                {mobileExpanded ? '▾' : '▸'} {lines.length} item{lines.length === 1 ? '' : 's'} · ${total.toFixed(2)}
              </MobileToggle>
            </ReceiptHeader>
            <Divider />

            <Lines role="list" aria-label="order items">
              {lines.length === 0 ? (
                <Empty>tap items to start your bowl</Empty>
              ) : (
                lineTransitions((style, line) => (
                  <Line role="listitem" style={style}>
                    <LineName>
                      {line.qty > 1 ? `${line.qty}× ` : ''}{line.name}
                    </LineName>
                    <LinePrice>${(line.price * line.qty).toFixed(2)}</LinePrice>
                    <RemoveBtn
                      onClick={() => removeOne(line.id)}
                      aria-label={`remove one ${line.name}`}
                    >
                      ×
                    </RemoveBtn>
                  </Line>
                ))
              )}
            </Lines>

            <Divider />
            {loyaltyApplied && (
              <TotalRow style={{ fontSize: '0.8125rem', opacity: 0.8 }}>
                <span>loyalty (10% off)</span>
                <TotalValue>−${discount.toFixed(2)}</TotalValue>
              </TotalRow>
            )}
            <TotalRow>
              <span>total</span>
              <TotalValue aria-live="polite">${total.toFixed(2)}</TotalValue>
            </TotalRow>

            <CheckoutBtn
              onClick={checkout}
              disabled={order.length === 0}
            >
              checkout
            </CheckoutBtn>
            <ClearBtn
              onClick={clearOrder}
              disabled={order.length === 0}
            >
              clear order
            </ClearBtn>
          </>
        )}
      </ReceiptPanel>

      {flying.map((f) => (
        <FlyingIcon
          key={f.key}
          Icon={f.Icon}
          src={f.src}
          dst={f.dst}
          immediate={reducedMotion}
          onDone={() => removeFlying(f.key)}
        />
      ))}
    </Layout>
  );
}

export default PokeExperience;
