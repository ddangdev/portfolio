/* Top bar: the studio mark and the "start a project" pill. Sticky below 900px (base.css section 4).
   #top sits on the sentinel, not the header: an anchor pointing at a sticky element does not reliably
   scroll, so "back to top" and the mark aim at the page's real top instead. */
import { useRef } from 'react';
import { trackStartProject } from '../../analytics/events';
import { cx } from '../../lib/cx';
import { ANCHORS, STUDIO } from '../../data/site';
import { useScrolledPast } from '../../motion/useScrolledPast';
import { useHeaderOffset } from './useHeaderOffset';

export default function SiteHeader() {
  const sentinelRef = useRef(null);
  const headerRef = useRef(null);
  const isScrolled = useScrolledPast(sentinelRef);
  useHeaderOffset(headerRef);

  return (
    <>
      <div ref={sentinelRef} className="top-sentinel" id={ANCHORS.top}></div>
      <header ref={headerRef} className={cx('top wrap', isScrolled && 'is-scrolled')}>
        <a className="mark" href={`#${ANCHORS.top}`} aria-label={`${STUDIO.name}, back to top`}>
          {STUDIO.mark}<span>{STUDIO.markSuffix}</span>
        </a>
        <a className="top-start" href={`#${ANCHORS.start}`} onClick={() => trackStartProject('nav')}>
          <span className="dot" aria-hidden="true"></span>start a project
        </a>
      </header>
    </>
  );
}
