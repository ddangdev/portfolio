import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSpring, animated, config } from '@react-spring/web';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import useScrollDirection from '../../hooks/useScrollDirection';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// Classic sun/moon morph:
// - A central circle is the "celestial body"
// - A mask with a secondary circle slides in from the top-right to cut a
//   crescent (moon) or slides away (sun)
// - 8 rays fade in (sun) / out (moon) with a subtle rotation
// The whole thing is one SVG, so every change is interpolated per-frame.

const Button = styled(animated.button)`
  position: fixed;
  top: calc(${({ theme }) => theme.layout.navHeight} + 16px);
  right: 20px;
  z-index: 90;

  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.divider};
  background: ${({ theme }) => theme.colors.toggleBg};
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.shadows.subtle};

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.toggleBgHover};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    top: calc(56px + 12px);
    right: 14px;
    width: 40px;
    height: 40px;
  }
`;

const rays = [
  { x1: 12, y1: 2,  x2: 12, y2: 4 },
  { x1: 12, y1: 20, x2: 12, y2: 22 },
  { x1: 2,  y1: 12, x2: 4,  y2: 12 },
  { x1: 20, y1: 12, x2: 22, y2: 12 },
  { x1: 4.9,  y1: 4.9,  x2: 6.3,  y2: 6.3  },
  { x1: 17.7, y1: 17.7, x2: 19.1, y2: 19.1 },
  { x1: 4.9,  y1: 19.1, x2: 6.3,  y2: 17.7 },
  { x1: 17.7, y1: 6.3,  x2: 19.1, y2: 4.9  },
];

function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  const isMoon = mode === 'dark';
  const reducedMotion = usePrefersReducedMotion();
  const { scrollDir, atTop } = useScrollDirection();

  // Slide up with nav on scroll-down. Matches Nav's spring config for sync.
  const hideSpring = useSpring({
    transform: scrollDir === 'down' && !atTop ? 'translateY(-150%)' : 'translateY(0%)',
    config: { tension: 280, friction: 26 },
  });

  const spring = useSpring({
    maskCx: isMoon ? 17 : 26,          // moon: mask overlaps body; sun: mask off-canvas
    maskCy: isMoon ? 7 : -2,
    bodyR: isMoon ? 9 : 5,             // moon body larger, sun smaller (rays give it size)
    rayOpacity: isMoon ? 0 : 1,
    rotation: isMoon ? 40 : 0,
    immediate: reducedMotion,
    config: config.gentle,
  });

  const label = isMoon ? 'switch to light mode' : 'switch to dark mode';

  return (
    <Button
      type="button"
      aria-label={label}
      aria-pressed={isMoon}
      onClick={toggle}
      style={hideSpring}
    >
      <animated.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: spring.rotation.to((r) => `rotate(${r}deg)`) }}
      >
        <defs>
          <mask id="theme-toggle-mask">
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <animated.circle
              cx={spring.maskCx}
              cy={spring.maskCy}
              r="9"
              fill="black"
            />
          </mask>
        </defs>

        {/* Celestial body */}
        <animated.circle
          cx="12"
          cy="12"
          r={spring.bodyR}
          fill="currentColor"
          stroke="none"
          mask="url(#theme-toggle-mask)"
        />

        {/* Rays */}
        <animated.g style={{ opacity: spring.rayOpacity }}>
          {rays.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
        </animated.g>
      </animated.svg>
    </Button>
  );
}

export default ThemeToggle;
