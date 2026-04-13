import { useState, useEffect } from 'react';
import styled from 'styled-components';

// Thin bar pinned to the top of the viewport that fills as the user scrolls.
// Sits ABOVE the nav's z-index so the nav doesn't cover it.

const Bar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.accentLavender} 50%,
    ${({ theme }) => theme.colors.accentPink} 100%
  );
  z-index: 101;
  transition: width 0.05s linear;
  pointer-events: none;
`;

function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(100, (scrolled / max) * 100) : 0;
      setPct(p);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return <Bar style={{ width: `${pct}%` }} aria-hidden="true" />;
}

export default ScrollProgress;
