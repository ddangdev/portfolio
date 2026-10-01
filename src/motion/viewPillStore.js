/* A tiny event store between the stages (useViewPill) and the single mouse pill (ViewPillCursor).
   Stages report pointer enter / move / leave; the cursor listens and animates itself. */

const listeners = new Set();

function emit(event) {
  listeners.forEach((listener) => listener(event));
}

export function subscribeViewPill(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const pillEnter = (label, x, y) => emit({ type: 'enter', label, x, y });
export const pillMove = (x, y) => emit({ type: 'move', x, y });
export const pillLeave = () => emit({ type: 'leave' });
