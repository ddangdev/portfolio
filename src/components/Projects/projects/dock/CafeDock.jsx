import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpring, useSprings } from '@react-spring/web';
import { useTheme } from 'styled-components';
import { cafeIconList } from './CafeIcons';
import CafeItemPopup from './CafeItemPopup';
import {
  BASE_SIZE, MAX_SCALE, FALLOFF, ICON_GAP, DOCK_PADDING_X, CELL_WIDTH,
  Wrapper, Tooltip, DockShell, DockArrow,
  IconTrack, IconCell, IconBody, Caption,
  MobileGrid, MobileTile,
} from './cafeDockStyles';

// Live match against the tablet breakpoint — mobile layout swaps below it.
function useIsMobile(breakpoint) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia?.(`(max-width: ${breakpoint})`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint})`);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [breakpoint]);
  return isMobile;
}

// ── Single icon with its own spring, driven by distance ────────

function DockIcon({ Icon, name, distance, onHover, onClick, cellStyle }) {
  // Element is painted at RENDER_SIZE; default scale brings it down to BASE_SIZE,
  // peak scale is 1.0 (crisp vector).
  const MIN_SCALE = 1 / MAX_SCALE;
  const t = Math.max(0, 1 - distance / FALLOFF);
  const scale = MIN_SCALE + t * (1 - MIN_SCALE);

  const spring = useSpring({
    scale,
    config: { tension: 300, friction: 22 },
  });

  const onEnter = useCallback(() => onHover(name), [name, onHover]);
  const onLeave = useCallback(() => onHover(null), [onHover]);
  const onFocus = useCallback(() => onHover(name), [name, onHover]);
  const onBlur = useCallback(() => onHover(null), [onHover]);
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }, [onClick]);

  return (
    <IconCell style={cellStyle}>
      <IconBody
        tabIndex={0}
        role="button"
        aria-label={`${name} details`}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={onClick}
        onKeyDown={onKeyDown}
        style={{ transform: spring.scale.to((s) => `scale(${s})`) }}
      >
        <Icon />
      </IconBody>
    </IconCell>
  );
}

// ── Main dock ──────────────────────────────────────────────────

function CafeDock() {
  const theme = useTheme();
  const isMobile = useIsMobile(theme.breakpoints.tablet);
  const [mouseX, setMouseX] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const [openItemIndex, setOpenItemIndex] = useState(null); // ORIGINAL index in cafeIconList
  const [offset, setOffset] = useState(0); // rotation offset — which item sits at visible slot 0
  const shellRef = useRef(null);

  const count = cafeIconList.length;

  const onMouseMove = useCallback((e) => {
    if (!shellRef.current) return;
    const rect = shellRef.current.getBoundingClientRect();
    // Offset past the left arrow button so mouseX=0 lines up with the first icon.
    setMouseX(e.clientX - rect.left - DOCK_PADDING_X - 32 - ICON_GAP);
  }, []);

  const onMouseLeave = useCallback(() => {
    setMouseX(null);
    setHoveredName(null);
  }, []);

  const onIconClick = useCallback((index) => {
    setOpenItemIndex((current) => (current === index ? null : index));
  }, []);

  const onPopupClose = useCallback(() => setOpenItemIndex(null), []);

  // Dock arrows shift the visible order — conveyor-belt rotation.
  // Useful if more items are added than fit on screen at once.
  const shift = useCallback((delta) => {
    setOffset((o) => (o + delta + count) % count);
  }, [count]);

  const tooltipSpring = useSpring({
    opacity: hoveredName ? 1 : 0,
    transform: hoveredName ? 'translateY(0px)' : 'translateY(6px)',
    config: { tension: 280, friction: 22 },
  });

  // Previous offset — used to detect when an item wraps so we can skip
  // animation for that one item (it teleports from far end to far end).
  const prevOffsetRef = useRef(offset);
  useEffect(() => {
    prevOffsetRef.current = offset;
  }, [offset]);

  // Each icon gets its own spring-driven x position. On offset change,
  // each item animates to its new visible slot — except the wrapping item,
  // which jumps instantly to avoid sliding across the whole dock.
  const iconSprings = useSprings(
    count,
    cafeIconList.map((_, origIdx) => {
      const visibleIdx = (origIdx - offset + count) % count;
      const prevVisibleIdx =
        (origIdx - prevOffsetRef.current + count) % count;
      const jumped = Math.abs(visibleIdx - prevVisibleIdx) > 1;
      return {
        x: visibleIdx * CELL_WIDTH,
        immediate: jumped,
        config: { tension: 260, friction: 28 },
      };
    })
  );

  // Popup tethers to the visible slot of the open item.
  const LEFT_ARROW_OFFSET = 32 + ICON_GAP;
  let popupLeftX = null;
  let openItem = null;
  if (openItemIndex !== null) {
    const visibleIdx = (openItemIndex - offset + count) % count;
    popupLeftX =
      DOCK_PADDING_X +
      LEFT_ARROW_OFFSET +
      visibleIdx * CELL_WIDTH +
      BASE_SIZE / 2;
    openItem = cafeIconList[openItemIndex];
  }

  // Only this many icons are visible at once on desktop — the rest rotate in
  // via the left/right arrows. Keeps the dock from overflowing the carousel.
  const VISIBLE_COUNT = Math.min(count, 6);
  const trackWidth = VISIBLE_COUNT * CELL_WIDTH - ICON_GAP;

  // ── Mobile layout: 3-col grid, tap opens centered modal popup ──
  if (isMobile) {
    const openItem = openItemIndex !== null ? cafeIconList[openItemIndex] : null;
    return (
      <Wrapper>
        <MobileGrid role="list" aria-label="cafe menu">
          {cafeIconList.map((item, idx) => {
            const Icon = item.Icon;
            return (
              <MobileTile
                key={item.id}
                role="listitem"
                onClick={() => onIconClick(idx)}
                aria-label={`${item.name} details`}
                $selected={openItemIndex === idx}
              >
                <Icon />
              </MobileTile>
            );
          })}
        </MobileGrid>
        {openItem && (
          <CafeItemPopup
            item={openItem}
            leftX={0}
            onClose={onPopupClose}
            modal
          />
        )}
        <Caption>tap any icon for details.</Caption>
      </Wrapper>
    );
  }

  // ── Desktop layout: magnifying horizontal dock ──
  return (
    <Wrapper>
      <Tooltip style={tooltipSpring}>{hoveredName || '\u00A0'}</Tooltip>

      <DockShell
        ref={shellRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <DockArrow
          onClick={() => shift(-1)}
          aria-label="shift items left"
        >
          ←
        </DockArrow>

        <IconTrack style={{ width: `${trackWidth}px` }}>
          {cafeIconList.map((item, origIdx) => {
            const visibleIdx = (origIdx - offset + count) % count;
            const iconCenter = visibleIdx * CELL_WIDTH + BASE_SIZE / 2;
            const distance =
              mouseX === null ? Infinity : Math.abs(mouseX - iconCenter);
            return (
              <DockIcon
                key={item.id}
                Icon={item.Icon}
                name={item.name}
                distance={distance}
                onHover={setHoveredName}
                onClick={() => onIconClick(origIdx)}
                cellStyle={{
                  transform: iconSprings[origIdx].x.to((x) => `translateX(${x}px)`),
                }}
              />
            );
          })}
        </IconTrack>

        <DockArrow
          onClick={() => shift(1)}
          aria-label="shift items right"
        >
          →
        </DockArrow>

        {openItem && (
          <CafeItemPopup
            item={openItem}
            leftX={popupLeftX}
            onClose={onPopupClose}
          />
        )}
      </DockShell>

      <Caption>
        hover across the dock — icons magnify based on distance to the cursor.
        click any icon for details.
      </Caption>
    </Wrapper>
  );
}

export default CafeDock;
