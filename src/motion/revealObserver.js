/* One shared IntersectionObserver for every scroll reveal on the page.
   Elements that enter in the same callback batch get stagger indices 0, 1, 2... in batch order, then are
   unobserved (a reveal happens once). Created lazily on first use, never at import time. */

const ROOT_MARGIN = '0px 0px -12% 0px';

let observer = null;
const handlers = new Map();

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        let n = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const onEnter = handlers.get(entry.target);
          observer.unobserve(entry.target);
          handlers.delete(entry.target);
          if (onEnter) onEnter(n++);
        });
      },
      { rootMargin: ROOT_MARGIN },
    );
  }
  return observer;
}

/** Watch `el`; `onEnter(index)` runs once when it scrolls into view. Returns the cleanup. */
export function observeReveal(el, onEnter) {
  handlers.set(el, onEnter);
  getObserver().observe(el);
  return () => {
    handlers.delete(el);
    if (observer) observer.unobserve(el);
  };
}
