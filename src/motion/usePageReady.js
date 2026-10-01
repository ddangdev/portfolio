/* Page ready: adds `motion` to <html>, then `is-ready` once Geist has loaded (or after 900 ms, whichever
   comes first), two frames later so the first paint is the hidden state. The load reveals and the headline
   words key off `is-ready`. <html> is not rendered by React, so classList is the right tool here.
   The head snippet in index.html adds `js` and a 1600 ms `is-ready` failsafe. */
import { useEffect } from 'react';

const FONT_WAIT_MS = 900;

export function usePageReady() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js', 'motion');

    let done = false;
    let raf1 = 0;
    let raf2 = 0;
    const ready = () => {
      if (done) return;
      done = true;
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => root.classList.add('is-ready'));
      });
    };

    const timer = setTimeout(ready, FONT_WAIT_MS);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready, ready);
    else ready();

    return () => {
      done = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);
}
