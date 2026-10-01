/* Phone-only quick links: appear once the hero buttons scroll away, hide while the form is on screen.
   Hidden from assistive tech and out of the tab order while off. */
import { trackEmail, trackStartProject } from '../../analytics/events';
import { cx } from '../../lib/cx';
import { ANCHORS, MAILTO } from '../../data/site';
import { useDock } from '../../motion/useDock';

export default function Dock() {
  const { isOn } = useDock();
  const tabIndex = isOn ? 0 : -1;
  return (
    <div className={cx('dock', isOn && 'is-on')} aria-hidden={isOn ? 'false' : 'true'}>
      <a href={`#${ANCHORS.start}`} tabIndex={tabIndex} onClick={() => trackStartProject('dock')}>start a project</a>
      <a href={MAILTO} tabIndex={tabIndex} onClick={() => trackEmail('dock')}>email</a>
    </div>
  );
}
