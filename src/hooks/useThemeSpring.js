import { useEffect, useRef } from 'react';
import { useSpring } from '@react-spring/web';
import { SPRING_COLORS, lightPalette, darkPalette } from '../styles/palettes';

// Drives CSS custom properties --color-{token} on :root by spring-interpolating
// between the light and dark palettes on every mode change. Tune tension /
// friction here to taste — this is the feel of the whole theme transition.
export function useThemeSpring(mode) {
  const target = mode === 'dark' ? 1 : 0;
  const mountedRef = useRef(false);

  // Pre-parse hex to RGB triples once; avoid per-frame string parsing.
  const parsedRef = useRef(null);
  if (!parsedRef.current) {
    const parse = (hex) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    parsedRef.current = SPRING_COLORS.map((k) => ({
      key: k,
      l: parse(lightPalette[k]),
      d: parse(darkPalette[k]),
    }));
  }

  useSpring({
    t: target,
    immediate: !mountedRef.current,
    config: { tension: 160, friction: 28 },
    onChange: ({ value }) => {
      const t = value.t;
      const root = document.documentElement;
      for (const { key, l, d } of parsedRef.current) {
        const r = Math.round(l[0] + (d[0] - l[0]) * t);
        const g = Math.round(l[1] + (d[1] - l[1]) * t);
        const b = Math.round(l[2] + (d[2] - l[2]) * t);
        root.style.setProperty(
          `--color-${key}`,
          '#' +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0')
        );
      }
    },
  });

  useEffect(() => {
    mountedRef.current = true;
  }, []);
}
