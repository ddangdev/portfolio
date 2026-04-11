import { useState, useEffect } from 'react';

export default function useScrollDirection() {
  const [scrollDir, setScrollDir] = useState('up');
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setAtTop(currentY < 10);
          if (Math.abs(currentY - lastY) > 5) {
            setScrollDir(currentY > lastY ? 'down' : 'up');
            lastY = currentY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { scrollDir, atTop };
}
