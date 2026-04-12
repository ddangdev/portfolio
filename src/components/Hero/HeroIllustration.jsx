import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import HeroCharacter from '../../assets/illustrations/hero-character.svg?raw';

const Wrapper = styled.div`
  width: 360px;
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.82;

  svg {
    width: 100%;
    height: 100%;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    max-width: 280px;
    height: 340px;
    margin-top: 32px;
  }

  @media (prefers-reduced-motion: reduce) {
    svg path, svg circle, svg rect, svg line, svg ellipse, svg polyline, svg polygon {
      stroke-dashoffset: 0 !important;
    }
  }
`;

// Compute stroke length for any SVG shape — same helper used by Doodles
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
  try {
    return el.getTotalLength();
  } catch {
    return 500;
  }
}

function HeroIllustration() {
  const wrapperRef = useRef(null);

  // Draw-on animation disabled while iterating on the illustration.
  // Re-enable once the final SVG is in place.

  return (
    <Wrapper ref={wrapperRef} dangerouslySetInnerHTML={{ __html: HeroCharacter }} />
  );
}

export default HeroIllustration;
