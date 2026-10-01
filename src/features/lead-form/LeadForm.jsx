/* The form: name + email, service chips, message, honeypot, the Turnstile slot, send, and any send error.
   Kept mounted (hidden) while the thank-you shows, so the Turnstile widget survives "send another note". */
import MagneticButton from '../../components/MagneticButton';
import { FORM_COPY } from './copy';
import Field from './Field';
import SendError from './SendError';
import ServiceChips from './ServiceChips';
import TurnstileSlot from './TurnstileSlot';

const LINE_MAX = 200;      // the endpoint's single-line limit
const BLOCK_MAX = 2000;    // the endpoint's message limit

export default function LeadForm({ form, slotRef, hidden }) {
  const { values, errors, services, phase, sendError, nameRef, contactRef, companyRef, onChange, onBlur, toggleService, onSubmit } = form;
  const sending = phase === 'sending';

  return (
    <form className="form" aria-labelledby="form-h" noValidate onSubmit={onSubmit} hidden={hidden}>
      <div className="form-head">
        <h3 className="label" id="form-h">{FORM_COPY.formTitle}</h3>
        <p className="label">{FORM_COPY.formCount}</p>
      </div>

      <div className="pair">
        <Field
          id="f-name" name="name" label={FORM_COPY.nameLabel} tag={FORM_COPY.required}
          errorId="e-name" error={errors.name}
          value={values.name} onChange={onChange} onBlur={onBlur} inputRef={nameRef}
          inputProps={{ autoComplete: 'name', autoCapitalize: 'words', required: true, maxLength: LINE_MAX }}
        />
        <Field
          id="f-contact" name="contact" label={FORM_COPY.contactLabel} tag={FORM_COPY.required}
          hint={FORM_COPY.contactHint} hintId="h-contact" errorId="e-contact" error={errors.contact}
          value={values.contact} onChange={onChange} onBlur={onBlur} inputRef={contactRef}
          inputProps={{
            inputMode: 'email', autoComplete: 'email', autoCapitalize: 'off', spellCheck: false,
            required: true, maxLength: LINE_MAX,
          }}
        />
      </div>

      <ServiceChips selected={services} onToggle={toggleService} />

      <Field
        id="f-message" name="message" label={FORM_COPY.messageLabel} tag={FORM_COPY.optional} tagKind="opt"
        hint={FORM_COPY.messageHint} hintId="h-message" multiline
        value={values.message} onChange={onChange}
        inputProps={{ rows: 3, maxLength: BLOCK_MAX }}
      />

      {/* honeypot: hidden from people, bots fill it. must stay empty. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company">{FORM_COPY.honeypotLabel}</label>
        <input id="f-company" name="company" type="text" tabIndex={-1} autoComplete="off" ref={companyRef} defaultValue="" />
      </div>

      <div className="form-end">
        <TurnstileSlot slotRef={slotRef} />
        <div className="form-foot">
          <MagneticButton type="submit" className="btn-ink btn-lg" ariaDisabled={sending}>
            {sending ? FORM_COPY.sending : <>{FORM_COPY.send} <span className="arr arr-right" aria-hidden="true">→</span></>}
          </MagneticButton>
        </div>
        {sendError ? <SendError message={sendError} /> : null}
      </div>
    </form>
  );
}
