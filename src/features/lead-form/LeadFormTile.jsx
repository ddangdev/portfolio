/* 4. the form tile, the main call to action: intro, the form (or the thank-you), and the status line.
   Reveals on scroll; `is-sent` hides the intro while the thank-you shows. Posts to functions/api/lead.js. */
import { useRef } from 'react';
import { cx } from '../../lib/cx';
import { ANCHORS } from '../../data/site';
import { useScrollReveal } from '../../motion/useScrollReveal';
import { FORM_COPY } from './copy';
import LeadForm from './LeadForm';
import LeadSent from './LeadSent';
import { useLeadForm } from './useLeadForm';
import { useTurnstile } from './useTurnstile';

export default function LeadFormTile() {
  const tileRef = useRef(null);
  const slotRef = useRef(null);
  const { isIn, index } = useScrollReveal(tileRef);
  const turnstile = useTurnstile({ slotRef, watchRef: tileRef });
  const form = useLeadForm({ turnstile });
  const isSent = form.phase === 'sent' && form.sent;

  return (
    <section
      ref={tileRef}
      className={cx('start b-form', isIn && 'is-in', isSent && 'is-sent')}
      id={ANCHORS.start}
      aria-labelledby="contact-h"
      data-reveal=""
      style={{ '--i': index }}
    >
      <div className="form-intro">
        <p className="label card-k">{FORM_COPY.introKicker}</p>
        <h2 className="title" id="contact-h">{FORM_COPY.introTitle}</h2>
        <p className="lede">{FORM_COPY.introLede}</p>
      </div>

      <LeadForm form={form} slotRef={slotRef} hidden={Boolean(isSent)} />
      {isSent ? <LeadSent sent={form.sent} onSendAnother={form.sendAnother} scrollTargetRef={tileRef} /> : null}

      <p className="form-status" role="status" aria-live="polite">{form.status}</p>
    </section>
  );
}
