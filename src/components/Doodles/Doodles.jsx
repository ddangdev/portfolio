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
    display: none;
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
function Doodle({ svg, color, size, rotate, opacity, delay, style, draw }) {
  const floatDuration = useRef(5 + (delay % 7) * 0.6);
  const floatDelay = useRef((delay % 5) * 0.4);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!draw || animated.current || !ref.current) return;
    animated.current = true;

    const paths = ref.current.querySelectorAll('svg path, svg circle, svg rect, svg line');

    const DRAW_IN = 3000;       // draw-on duration
    const HOLD = 6000;          // stay visible
    const FADE_OUT = 2000;      // fade away
    const PAUSE = 2000;         // pause before next cycle

    // Measure and store path lengths
    // circle/rect/line don't support getTotalLength — compute perimeter manually
    function getStrokeLength(el) {
      const tag = el.tagName.toLowerCase();
      if (tag === 'circle') {
        const r = parseFloat(el.getAttribute('r') || el.getAttribute('R') || 0);
        return 2 * Math.PI * r;
      }
      if (tag === 'ellipse') {
        const rx = parseFloat(el.getAttribute('rx') || 0);
        const ry = parseFloat(el.getAttribute('ry') || 0);
        // Ramanujan approximation
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
      // path, polyline, polygon — all support getTotalLength
      try {
        return el.getTotalLength();
      } catch {
        return 500;
      }
    }

    const pathLengths = [];
    paths.forEach((path) => {
      pathLengths.push(getStrokeLength(path));
    });

    // Set up dasharray once — Web Animations API handles dashoffset from here
    paths.forEach((path, i) => {
      path.style.strokeDasharray = `${pathLengths[i]}`;
      path.style.strokeDashoffset = `${pathLengths[i]}`;
    });

    const wrapper = ref.current;
    wrapper.style.opacity = String(opacity);

    let cancelled = false;
    const timers = [];
    // Track active Web Animations so we can cancel on cleanup
    const activeAnimations = [];

    function schedule(fn, ms) {
      const id = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timers.push(id);
      return id;
    }

    function runCycle() {
      if (cancelled) return;
      // Clear previous animation references
      activeAnimations.length = 0;
      let t = 0;

      // Phase 1: Draw in each path with stagger using Web Animations API
      // Each animate() call creates a fresh animation from explicit keyframes —
      // no reflow hacks needed, works reliably on every cycle
      schedule(() => {
        if (cancelled) return;
        paths.forEach((path, i) => {
          const anim = path.animate(
            [
              { strokeDashoffset: `${pathLengths[i]}` },
              { strokeDashoffset: '0' },
            ],
            {
              duration: DRAW_IN,
              easing: 'ease-in-out',
              delay: i * 200,
              fill: 'forwards',
            }
          );
          activeAnimations.push(anim);
        });
      }, t);

      // Phase 2: Hold (wait for draw + stagger to finish)
      const staggerTotal = (paths.length - 1) * 200;
      t += DRAW_IN + staggerTotal + HOLD;

      // Phase 3: Fade out wrapper
      schedule(() => {
        if (cancelled) return;
        const fadeAnim = wrapper.animate(
          [
            { opacity: String(opacity) },
            { opacity: '0' },
          ],
          { duration: FADE_OUT, easing: 'ease-out', fill: 'forwards' }
        );
        activeAnimations.push(fadeAnim);
      }, t);
      t += FADE_OUT;

      // Phase 4: While invisible, cancel all animations to reset state
      schedule(() => {
        if (cancelled) return;
        // Cancel all Web Animations — elements snap back to their stylesheet values
        // (dashoffset = full length from the inline style, wrapper opacity from inline style)
        activeAnimations.forEach((a) => a.cancel());
        activeAnimations.length = 0;
      }, t);
      t += PAUSE;

      // Phase 5: Start next draw cycle
      schedule(() => runCycle(), t);
    }

    // Start with random offset so doodles aren't synchronized
    const initialDelay = delay + Math.random() * 2000;
    schedule(() => runCycle(), initialDelay);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      activeAnimations.forEach((a) => a.cancel());
      // Reset the guard so StrictMode's second effect invocation (or any
      // legitimate re-run via dep change) can start a fresh cycle.
      animated.current = false;
    };
  }, [draw, delay, opacity]);

  const coloredSvg = svg.replaceAll('currentColor', color);

  return (
    <DoodleWrapper
      ref={ref}
      $size={size}
      $rotate={rotate}
      $opacity={opacity}
      $floatDuration={floatDuration.current}
      $floatDelay={floatDelay.current}
      style={style}
      dangerouslySetInnerHTML={{ __html: coloredSvg }}
    />
  );
}

function SectionDoodles({ prefix }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Observe the parent section element (the nearest element with an id),
    // not the absolutely-positioned doodle wrapper. Absolute + inset:0 can
    // produce inconsistent IntersectionObserver behavior across browsers.
    const wrapper = ref.current;
    if (!wrapper) return;
    const section = wrapper.closest('section, [id]') || wrapper;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(section);
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
          draw={inView}
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
