/* Top bar: the studio mark and the section nav, ending in the "start a project" pill. */
import { trackEmail, trackStartProject } from '../../analytics/events';
import { cx } from '../../lib/cx';
import { ANCHORS, MAILTO, NAV, STUDIO } from '../../data/site';

export default function SiteHeader() {
  return (
    <header className="top wrap" id={ANCHORS.top}>
      <a className="mark" href={`#${ANCHORS.top}`} aria-label={`${STUDIO.name}, back to top`}>
        {STUDIO.mark}<span>{STUDIO.markSuffix}</span>
      </a>
      <nav className="nav" aria-label="sections">
        {NAV.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cx(item.wide && 'nav-wide')}
            onClick={item.href === MAILTO ? () => trackEmail('nav') : undefined}
          >
            {item.label}
          </a>
        ))}
        <a className="nav-start" href={`#${ANCHORS.start}`} onClick={() => trackStartProject('nav')}>
          <span className="dot" aria-hidden="true"></span>start a project
        </a>
      </nav>
    </header>
  );
}
