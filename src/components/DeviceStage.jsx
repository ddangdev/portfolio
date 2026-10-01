/* The linked stage: a browser and a phone on a recessed panel, opening the live site in a new tab.
   Mouse: ViewPillCursor follows the pointer. Touch: the in-stage pill settles on at mid-screen. */
import { useRef } from 'react';
import { cx } from '../lib/cx';
import { useViewPill } from '../motion/useViewPill';
import BrowserFrame from './BrowserFrame';
import PhoneFrame from './PhoneFrame';

const PILL_LABEL = 'view site';

export default function DeviceStage({ url, domain, desktop, phone, eager, onVisit }) {
  const ref = useRef(null);
  const { isFocus } = useViewPill(ref, PILL_LABEL);
  return (
    <a
      ref={ref}
      className={cx('stage', isFocus && 'is-focus')}
      href={url}
      target="_blank"
      rel="noopener"
      data-view-pill={PILL_LABEL}
      aria-label={`open ${domain} in a new tab`}
      onClick={onVisit}
    >
      <BrowserFrame domain={domain} image={desktop} eager={eager} />
      <PhoneFrame image={phone} eager={eager} />
      <span className="pill" aria-hidden="true"><span className="pdot"></span>{PILL_LABEL} <span className="arr">↗</span></span>
    </a>
  );
}
