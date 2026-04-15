import { useEffect, useRef, useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';

import PalmTree from '../../assets/illustrations/palm-tree.svg?raw';
import Wave from '../../assets/illustrations/wave.svg?raw';
import ShaveIce from '../../assets/illustrations/shave-ice.svg?raw';
import Musubi from '../../assets/illustrations/musubi.svg?raw';
import Plumeria from '../../assets/illustrations/plumeria.svg?raw';
import Sun from '../../assets/illustrations/sun.svg?raw';
import Surfboard from '../../assets/illustrations/surfboard.svg?raw';
import Hibiscus from '../../assets/illustrations/hibiscus.svg?raw';
import Turtle from '../../assets/illustrations/turtle.svg?raw';
import Ukulele from '../../assets/illustrations/ukulele.svg?raw';

const float = keyframes`
  0% { transform: var(--base-rotate) translateY(0px); }
  50% { transform: var(--base-rotate) translateY(-8px) rotate(2deg); }
  100% { transform: var(--base-rotate) translateY(0px); }
`;

const DoodleWrapper = styled.div`
  position: absolute;
  pointer-events: none;
  opacity: ${({ $opacity }) => $opacity || 0.3};
  --base-rotate: rotate(${({ $rotate }) => $rotate || 0}deg);
  transform: var(--base-rotate);
  width: ${({ $size }) => $size || 100}px;
  z-index: 0;
  color: ${({ theme }) => theme.colors.text};
  animation: ${float} ${({ $floatDuration }) => $floatDuration || 6}s ease-in-out infinite;
  animation-delay: ${({ $floatDelay }) => $floatDelay || 0}s;

  svg {
    width: 100%;
    height: auto;
  }

  svg path, svg circle, svg rect, svg line {
    transition: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    --base-rotate: rotate(${({ $rotate }) => $rotate || 0}deg) scale(0.7);
    opacity: ${({ $opacity }) => ($opacity || 0.3) * 0.7};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    --base-rotate: rotate(${({ $rotate }) => $rotate || 0}deg) scale(0.5);
    opacity: ${({ $opacity }) => ($opacity || 0.3) * 0.55};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const doodleConfigs = [
  // Hero section
  { svg: PalmTree, x: 'right: 12%', y: 'top: 50%', color: '#2D3436', size: 130, rotate: 10, opacity: 0.18, delay: 200, id: 'hero-palm' },
  { svg: Sun, x: 'right: 25%', y: 'top: 5%', color: '#2D3436', size: 90, opacity: 0.15, delay: 0, id: 'hero-sun' },
  { svg: Wave, x: 'left: 10%', y: 'top: 75%', color: '#2D3436', size: 180, rotate: -3, opacity: 0.12, delay: 400, id: 'hero-wave' },
  { svg: Surfboard, x: 'left: 20%', y: 'top: 55%', color: '#2D3436', size: 50, rotate: 25, opacity: 0.14, delay: 600, id: 'hero-surfboard' },

  // About section
  { svg: Plumeria, x: 'right: 15%', y: 'top: 15%', color: '#2D3436', size: 90, rotate: 15, opacity: 0.18, delay: 0, id: 'about-plumeria' },
  { svg: Turtle, x: 'left: 12%', y: 'top: 25%', color: '#2D3436', size: 120, rotate: -5, opacity: 0.15, delay: 300, id: 'about-turtle' },
  { svg: Hibiscus, x: 'right: 20%', y: 'top: 60%', color: '#2D3436', size: 80, rotate: -10, opacity: 0.12, delay: 500, id: 'about-hibiscus' },
  { svg: Wave, x: 'left: 18%', y: 'top: 70%', color: '#2D3436', size: 150, rotate: 3, opacity: 0.12, delay: 200, id: 'about-wave' },

  // Projects section
  { svg: ShaveIce, x: 'left: 12%', y: 'top: 10%', color: '#2D3436', size: 90, rotate: -8, opacity: 0.18, delay: 0, id: 'projects-shaveice' },
  { svg: Musubi, x: 'right: 12%', y: 'top: 45%', color: '#2D3436', size: 100, rotate: 12, opacity: 0.16, delay: 300, id: 'projects-musubi' },
  { svg: Ukulele, x: 'left: 18%', y: 'top: 50%', color: '#2D3436', size: 60, rotate: -20, opacity: 0.14, delay: 500, id: 'projects-ukulele' },
  { svg: Plumeria, x: 'right: 22%', y: 'top: 80%', color: '#2D3436', size: 70, rotate: 30, opacity: 0.12, delay: 700, id: 'projects-plumeria' },

  // Contact section
  { svg: PalmTree, x: 'left: 10%', y: 'top: 5%', color: '#2D3436', size: 120, rotate: -15, opacity: 0.18, delay: 0, id: 'contact-palm' },
  { svg: Sun, x: 'right: 15%', y: 'top: 10%', color: '#2D3436', size: 80, opacity: 0.15, delay: 200, id: 'contact-sun' },
  { svg: Wave, x: 'right: 10%', y: 'top: 60%', color: '#2D3436', size: 170, rotate: 5, opacity: 0.12, delay: 400, id: 'contact-wave' },
  { svg: Surfboard, x: 'left: 22%', y: 'top: 55%', color: '#2D3436', size: 55, rotate: -30, opacity: 0.14, delay: 600, id: 'contact-surfboard' },
];

// Individual doodle that draws itself on when triggered
// Stable random per doodle — seeded from delay so it's consistent across renders
function Doodle({ svg, color, size, rotate, opacity, delay, style, draw, replayKey }) {
  const floatDuration = useRef(5 + (delay % 7) * 0.6);
  const floatDelay = useRef((delay % 5) * 0.4);
  const ref = useRef(null);

  useEffect(() => {
    if (!draw || !ref.current) return;

    const wrapper = ref.current;
    const paths = wrapper.querySelectorAll(
      'svg path, svg circle, svg rect, svg line, svg ellipse, svg polyline, svg polygon'
    );
    if (paths.length === 0) return;

    // Measure path lengths (circle/rect/line/ellipse don't support getTotalLength)
    function getStrokeLength(el) {
      const tag = el.tagName.toLowerCase();
      if (tag === 'circle') {
        const r = parseFloat(el.getAttribute('r') || 0);
        return 2 * Math.PI * r;
      }
      if (tag === 'ellipse') {
        const rx = parseFloat(el.getAttribute('rx') || 0);
        const ry = parseFloat(el.getAttribute('ry') || 0);
        return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
      }
      if (tag === 'rect') {
        const w = parseFloat(el.getAttribute('width') || 0);
        const h = parseFloat(el.getAttribute('height') || 0);
        return 2 * (w + h);
      }
      if (tag === 'line') {
        const x1 = parseFloat(el.getAttribute('x1') || 0);
        const y1 = parseFloat(el.getAttribute('y1') || 0);
        const x2 = parseFloat(el.getAttribute('x2') || 0);
        const y2 = parseFloat(el.getAttribute('y2') || 0);
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      }
      try { return el.getTotalLength(); } catch { return 500; }
    }
    const pathLengths = Array.from(paths).map(getStrokeLength);

    // Initialize: set dasharray, start paths hidden, wrapper visible at target.
    paths.forEach((path, i) => {
      path.style.strokeDasharray = String(pathLengths[i]);
      path.style.strokeDashoffset = String(pathLengths[i]);
    });
    wrapper.style.opacity = String(opacity);

    // ── Timing constants ────────────────────────────────────
    const DRAW_IN = 3000;
    const STAGGER = 200;
    const HOLD = 6000;
    const FADE_OUT = 2000;
    const PAUSE = 2000;
    const staggerTotal = (paths.length - 1) * STAGGER;
    const drawEnd = DRAW_IN + staggerTotal;         // everyone finished drawing
    const holdEnd = drawEnd + HOLD;
    const fadeEnd = holdEnd + FADE_OUT;
    const CYCLE = fadeEnd + PAUSE;

    // Random start offset so doodles aren't synchronized
    const startTime = performance.now() + delay + Math.random() * 2000;

    // ── Single rAF loop drives every frame ──────────────────
    // The phase within the cycle is a pure function of elapsed time.
    // No setTimeout chains to drift, no Web Animations to cancel/race.
    // When the tab is backgrounded rAF pauses; when it resumes, `now`
    // jumps forward and we pick up cleanly at the new phase.
    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    let rafId = 0;
    let cancelled = false;

    function tick(now) {
      if (cancelled) return;
      const elapsed = now - startTime;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const phase = elapsed % CYCLE;

      // Per-path draw-in with stagger
      for (let i = 0; i < paths.length; i++) {
        const pathStart = i * STAGGER;
        const pathEnd = pathStart + DRAW_IN;
        let dashoffset;
        if (phase < pathStart) {
          dashoffset = pathLengths[i];                              // hidden (not started)
        } else if (phase < pathEnd) {
          const t = (phase - pathStart) / DRAW_IN;
          dashoffset = pathLengths[i] * (1 - easeInOut(t));         // drawing
        } else if (phase < fadeEnd) {
          dashoffset = 0;                                            // fully drawn (held or fading)
        } else {
          dashoffset = pathLengths[i];                              // hidden during PAUSE
        }
        paths[i].style.strokeDashoffset = String(dashoffset);
      }

      // Wrapper opacity: visible during draw+hold, fade during FADE_OUT, hidden during PAUSE
      let op;
      if (phase < holdEnd) {
        op = opacity;
      } else if (phase < fadeEnd) {
        const t = (phase - holdEnd) / FADE_OUT;
        op = opacity * (1 - t);
      } else {
        op = 0;
      }
      wrapper.style.opacity = String(op);

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [draw, delay, opacity, replayKey]);

  // Let SVG inherit currentColor from the wrapper (which follows theme.text).
  // Dropping the replaceAll means doodles re-tint with the spring-driven theme.
  return (
    <DoodleWrapper
      ref={ref}
      $size={size}
      $rotate={rotate}
      $opacity={opacity}
      $floatDuration={floatDuration.current}
      $floatDelay={floatDelay.current}
      style={style}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function SectionDoodles({ prefix }) {
  const ref = useRef(null);
  // replayKey bumps on every viewport entry. Doodle's effect depends on it,
  // so re-entry restarts the draw-in from scratch instead of showing whatever
  // phase the infinite cycle happens to be in.
  const [replayKey, setReplayKey] = useState(0);
  const wasInView = useRef(false);

  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;
    const section = wrapper.closest('section, [id]') || wrapper;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasInView.current) {
          wasInView.current = true;
          setReplayKey((k) => k + 1);
        } else if (!entry.isIntersecting && wasInView.current) {
          wasInView.current = false;
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const items = doodleConfigs.filter(d => d.id.startsWith(prefix));

  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {items.map(d => (
        <Doodle
          key={d.id}
          svg={d.svg}
          color={d.color}
          size={d.size}
          rotate={d.rotate}
          opacity={d.opacity}
          delay={d.delay}
          draw={replayKey > 0}
          replayKey={replayKey}
          style={{
            [d.x.split(':')[0].trim()]: d.x.split(':')[1].trim(),
            [d.y.split(':')[0].trim()]: d.y.split(':')[1].trim(),
          }}
        />
      ))}
    </div>
  );
}

export function HeroDoodles() { return <SectionDoodles prefix="hero" />; }
export function AboutDoodles() { return <SectionDoodles prefix="about" />; }
export function ProjectsDoodles() { return <SectionDoodles prefix="projects" />; }
export function ContactDoodles() { return <SectionDoodles prefix="contact" />; }
