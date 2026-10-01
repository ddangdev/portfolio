/* Phone dock visibility: on once the hero buttons have scrolled away, off again while the form is on
   screen. Two observers on the anchors from data/site.js. No observer: the dock stays off. */
import { useEffect, useState } from 'react';
import { ANCHORS } from '../data/site';
import { hasIntersectionObserver } from './useMediaQuery';

export function useDock() {
  const [afterVisible, setAfterVisible] = useState(true);
  const [untilVisible, setUntilVisible] = useState(false);
  const canObserve = hasIntersectionObserver();

  useEffect(() => {
    if (!canObserve) return undefined;
    const after = document.getElementById(ANCHORS.heroCta);
    const until = document.getElementById(ANCHORS.start);
    if (!after) return undefined;

    const afterIO = new IntersectionObserver((entries) => setAfterVisible(entries[entries.length - 1].isIntersecting));
    afterIO.observe(after);
    let untilIO = null;
    if (until) {
      untilIO = new IntersectionObserver(
        (entries) => setUntilVisible(entries[entries.length - 1].isIntersecting),
        { rootMargin: '0px 0px -20% 0px' },
      );
      untilIO.observe(until);
    }
    return () => {
      afterIO.disconnect();
      if (untilIO) untilIO.disconnect();
    };
  }, [canObserve]);

  return { isOn: canObserve && !afterVisible && !untilVisible };
}
