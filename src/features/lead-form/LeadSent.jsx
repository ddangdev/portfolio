/* The thank-you: the pill settles on, the heading rises, then what was sent. Takes focus when it appears
   and brings the tile into view. */
import { useEffect, useRef, useState } from 'react';
import Facts from '../../components/Facts';
import { cx } from '../../lib/cx';
import { useReducedMotion } from '../../motion/useMediaQuery';
import { FORM_COPY } from './copy';

export default function LeadSent({ sent, onSendAnother, scrollTargetRef }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [isIn, setIsIn] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setIsIn(true));
    });
    if (ref.current) ref.current.focus({ preventScroll: true });
    const target = scrollTargetRef && scrollTargetRef.current;
    if (target) target.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // runs once, when the thank-you appears
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = [
    { term: FORM_COPY.factReplyTo, detail: sent.contact },
    { term: FORM_COPY.factNeeds, detail: sent.needs },
    { term: FORM_COPY.factMessage, detail: sent.message },
  ];

  return (
    <div ref={ref} className={cx('sent', isIn && 'is-in')} tabIndex={-1} role="group" aria-labelledby="sent-h">
      <p className="sent-pill"><span className="pdot" aria-hidden="true"></span>{FORM_COPY.sentPill}</p>
      <h3 className="sent-h" id="sent-h">
        <span className="rise"><span>{FORM_COPY.sentThanks}{sent.firstName ? `, ${sent.firstName}` : ''}.</span></span>
      </h3>
      <p className="sent-p">{FORM_COPY.sentBody}</p>
      <Facts rows={rows} />
      <div className="sent-row">
        <button className="btn btn-line" type="button" onClick={onSendAnother}>{FORM_COPY.sendAnother}</button>
      </div>
    </div>
  );
}
