// Behind the counter illustration — restaurant order ticket + pencil.
// Pencil writes down the ticket; lines draw in sync with pencil position.
// Driven by a single `progress` prop (0→1) from the parent's react-spring.

const LINES = [
  { y: 62, len: 80, start: 0,    end: 0.14 },   // line 1 — careful
  { y: 80, len: 65, start: 0.16, end: 0.24 },   // line 2 — quicker
  { y: 98, len: 75, start: 0.26, end: 0.42 },   // line 3 — writes, corrects, finishes
  { y: 116,len: 40, start: 0.44, end: 0.49 },   // line 4 — short jot
  { y: 145,len: 80, start: 0.57, end: 0.72, coral: true }, // total — deliberate
];

// Pencil path: list of { pct, x, y } keyframes in ticket-space.
// Between keyframes, interpolate linearly.
const PENCIL_PATH = [
  { pct: 0,    x: 0,  y: 0 },
  { pct: 0.14, x: 75, y: 0 },
  { pct: 0.16, x: 0,  y: 18 },
  { pct: 0.24, x: 60, y: 18 },
  { pct: 0.26, x: 0,  y: 36 },
  { pct: 0.34, x: 70, y: 36 },
  { pct: 0.37, x: 42, y: 37 },   // goes back to correct
  { pct: 0.42, x: 72, y: 35 },
  { pct: 0.44, x: 0,  y: 54 },
  { pct: 0.49, x: 35, y: 54 },
  { pct: 0.55, x: 35, y: 54 },   // thinking pause
  { pct: 0.57, x: 0,  y: 83 },
  { pct: 0.62, x: 25, y: 85 },   // wobble on total
  { pct: 0.67, x: 50, y: 82 },
  { pct: 0.72, x: 75, y: 83 },
  { pct: 0.82, x: 75, y: 83 },   // hold at bottom
  { pct: 1,    x: 0,  y: 0 },    // reset
];

function lerp(a, b, t) { return a + (b - a) * t; }

function pencilAt(progress) {
  for (let i = 0; i < PENCIL_PATH.length - 1; i++) {
    const a = PENCIL_PATH[i], b = PENCIL_PATH[i + 1];
    if (progress >= a.pct && progress <= b.pct) {
      const t = (progress - a.pct) / (b.pct - a.pct);
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }
  }
  return { x: 0, y: 0 };
}

function lineDashoffset(lineLen, lineStart, lineEnd, progress) {
  if (progress < lineStart) return lineLen;       // fully hidden
  if (progress >= lineEnd) return 0;               // fully drawn
  const t = (progress - lineStart) / (lineEnd - lineStart);
  return lineLen * (1 - t);
}

import { useState, useEffect, useRef } from 'react';

const WRITE_DURATION = 5000;

export default function BehindTheCounterArt({ size = 200, progress: externalProgress, autoPlay = false }) {
  // Internal rAF loop when autoPlay is true; otherwise use externalProgress.
  const [internalProgress, setInternalProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      setInternalProgress(((ts - start) % WRITE_DURATION) / WRITE_DURATION);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [autoPlay]);

  const progress = autoPlay ? internalProgress : (externalProgress || 0);
  const pen = pencilAt(progress);

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="order ticket illustration"
    >
      {/* Hardcoded dark stroke — this illustration looks too bright in dark mode
           with the cream currentColor. Dark outlines + bright fills = better. */}
      <g fill="none" stroke="#4A3F38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* ticket background + perforation */}
        <rect x="45" y="25" width="110" height="150" rx="4" fill="#FBF5EE" />
        <path d="M50 42 h100" strokeDasharray="4 4" strokeWidth="1" />

        {/* content lines — dashoffset driven by progress */}
        {LINES.map((line, i) => (
          <line
            key={i}
            x1="60"
            y1={line.y}
            x2={60 + line.len}
            y2={line.y}
            stroke={line.coral ? '#D67452' : '#4A3F38'}
            strokeWidth={line.coral ? 2.5 : 2}
            strokeDasharray={line.len}
            strokeDashoffset={lineDashoffset(line.len, line.start, line.end, progress)}
          />
        ))}

        {/* pencil — position driven by progress */}
        <g transform={`translate(${62 + pen.x} ${58 + pen.y})`}>
          <g transform="rotate(-55)">
            <rect x="-4" y="-70" width="8" height="70" rx="1" fill="#FFE5A0" />
            <polygon points="-4,0 0,10 4,0" fill="#D67452" />
            <rect x="-4" y="-70" width="8" height="8" rx="1" fill="#F4A27D" />
          </g>
        </g>
      </g>
    </svg>
  );
}
