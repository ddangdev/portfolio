import { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useSpring, useSprings, animated } from '@react-spring/web';
import { cafeIconList } from './cafeIcons';
import CafeItemPopup from './CafeItemPopup';

// ── Dock tuning ────────────────────────────────────────────────
const BASE_SIZE = 44;        // default icon size in px
const MAX_SCALE = 2.2;       // peak magnification when cursor is over the icon
const FALLOFF = 130;         // px from icon center where scaling ends
const ICON_GAP = 14;         // spacing between icons
const DOCK_PADDING_X = 24;   // horizontal padding inside the dock
const CELL_WIDTH = BASE_SIZE + ICON_GAP;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 8px;
`;

const Tooltip = styled(animated.div)`
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

const DockShell = styled.div`
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

// Small step-through arrows inside the dock, flanking the icon row.
// Let users walk through items one at a time; when a popup is open the
// popup moves with the selection.
const DockArrow = styled.button`
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

// Render the SVG at the peak magnified size so scaling stays vector-crisp.
const RENDER_SIZE = Math.round(BASE_SIZE * MAX_SCALE); // painted dimension

// Track holds all icons as absolute-positioned children. Each icon has its own
// spring-driven x. Width = count of icons × CELL_WIDTH minus the trailing gap.
const IconTrack = styled.div`
  position: relative;
  height: ${BASE_SIZE}px;
  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 36px;
  }
`;

const IconCell = styled(animated.div)`
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

const IconBody = styled(animated.div)`
  /* Painted dimension is RENDER_SIZE; we scale DOWN by default so magnification
     stays ≤ 1 (crisp vector territory). Absolutely positioned so the visible
     overflow doesn't affect the dock's flex-end alignment. */
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

const Caption = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin-top: 20px;
  text-align: center;
  max-width: 420px;
`;

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

  // Total track width accommodates all icons laid out at their spring x.
  const trackWidth = count * CELL_WIDTH - ICON_GAP;

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
