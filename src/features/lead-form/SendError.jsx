/* A form-level failure (send failed, spam check not ready): announced via role=alert, always followed by
   the email fallback so a lead is never lost. One inner span keeps the text a single flex item. */
import { trackEmail } from '../../analytics/events';
import { MAILTO, STUDIO } from '../../data/site';
import { FORM_COPY } from './copy';

export default function SendError({ message }) {
  return (
    <p className="err is-shown send-err" role="alert">
      <span>
        {message}{FORM_COPY.emailFallbackBefore}
        <a href={MAILTO} onClick={() => trackEmail('send_error')}>{STUDIO.email}</a>{FORM_COPY.emailFallbackAfter}
      </span>
    </p>
  );
}
