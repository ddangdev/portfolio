/* The lead form's state machine: values, field errors, the status line, the send error and the phase.
   phase: 'editing' -> 'sending' -> 'sent' | 'failed' ('failed' goes back to 'editing' on the next edit).
   Validation matches the prototype: on submit check name then email; a field showing an error is
   re-checked on every input and blur; fields never shown as bad are not checked while typing. */
import { useEffect, useRef, useState } from 'react';
import { trackLead, trackLeadError, trackServiceSelect, trackUnsure } from '../../analytics/events';
import { serviceChips, UNSURE } from '../../data/services';
import { buildLeadPayload } from './buildLeadPayload';
import { FORM_COPY } from './copy';
import { sendLead } from './sendLead';
import { CHECKED_FIELDS, invalidSummary, validateField } from './validation';

const EMPTY_VALUES = { name: '', contact: '', message: '' };
const NO_ERRORS = { name: '', contact: '' };
const MESSAGE_PREVIEW = 90;

function sendErrorMessage(result) {
  if (result.kind === 'network') return FORM_COPY.failNetwork;
  return result.error ? FORM_COPY.failServer(result.error) : FORM_COPY.failServerGeneric;
}

function snapshotOf(values, services) {
  const name = values.name.trim();
  const message = values.message.trim();
  return {
    firstName: name ? name.split(/\s+/)[0] : '',
    contact: values.contact.trim(),
    needs: services.length ? services.join(', ') : FORM_COPY.notPicked,
    message: message ? (message.length > MESSAGE_PREVIEW ? `${message.slice(0, MESSAGE_PREVIEW)}…` : message) : FORM_COPY.noMessage,
  };
}

export function useLeadForm({ turnstile }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [services, setServices] = useState([]);
  const [errors, setErrors] = useState(NO_ERRORS);
  const [status, setStatus] = useState('');
  const [phase, setPhase] = useState('editing');
  const [sendError, setSendError] = useState('');
  const [sent, setSent] = useState(null);

  const phaseRef = useRef('editing');
  const nameRef = useRef(null);
  const contactRef = useRef(null);
  const companyRef = useRef(null);   // honeypot: read from the DOM at send time, so a scripted fill counts
  const focusNameNext = useRef(false);

  const goTo = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  /* after "send another note" brings the form back, put the visitor in the first field */
  useEffect(() => {
    if (phase === 'editing' && focusNameNext.current) {
      focusNameNext.current = false;
      if (nameRef.current) nameRef.current.focus();
    }
  }, [phase]);

  const clearSendError = () => {
    if (sendError) setSendError('');
    if (phaseRef.current === 'failed') goTo('editing');
  };

  const recheck = (name, value) => {
    const message = validateField(name, value);
    const next = { ...errors, [name]: message };
    setErrors(next);
    if (!message) setStatus(invalidSummary(CHECKED_FIELDS.filter((n) => next[n])));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    clearSendError();
    if (errors[name]) recheck(name, value);
  };

  const onBlur = (e) => {
    const { name, value } = e.target;
    if (errors[name]) recheck(name, value);
  };

  const toggleService = (chip, checked) => {
    setServices((prev) => serviceChips
      .filter((c) => (c.name === chip.name ? checked : prev.includes(c.name)))
      .map((c) => c.name));
    clearSendError();
    if (!checked) return;
    if (chip.key === UNSURE.key) trackUnsure();
    else trackServiceSelect(chip.key);
  };

  const failSend = (message, reason) => {
    setSendError(message);
    trackLeadError(reason);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (phaseRef.current === 'sending') return;   // double-click: exactly one request
    setSendError('');

    const nextErrors = {
      name: validateField('name', values.name),
      contact: validateField('contact', values.contact),
    };
    const bad = CHECKED_FIELDS.filter((n) => nextErrors[n]);
    setErrors(nextErrors);
    if (bad.length) {
      setStatus(invalidSummary(bad));
      const first = bad[0] === 'name' ? nameRef.current : contactRef.current;
      if (first) first.focus();
      return;
    }
    setStatus('');

    const turnstileToken = turnstile.getToken();
    if (!turnstileToken) {
      const broken = turnstile.status === 'error';
      if (!broken) turnstile.load();
      if (phaseRef.current === 'failed') goTo('editing');
      failSend(broken ? FORM_COPY.spamError : FORM_COPY.spamPending, 'spam_check');
      return;
    }

    goTo('sending');
    const payload = buildLeadPayload(
      { ...values, services, company: companyRef.current ? companyRef.current.value : '' },
      { turnstileToken, page: window.location.href },
    );
    const result = await sendLead(payload);

    if (result.ok) {
      trackLead();
      setSent(snapshotOf(values, services));
      setStatus(FORM_COPY.sentStatus);
      goTo('sent');
      return;
    }
    turnstile.reset();
    goTo('failed');
    failSend(sendErrorMessage(result), result.kind);
  };

  const sendAnother = () => {
    setValues(EMPTY_VALUES);
    setServices([]);
    setErrors(NO_ERRORS);
    setStatus('');
    setSendError('');
    setSent(null);
    if (companyRef.current) companyRef.current.value = '';
    turnstile.reset();
    focusNameNext.current = true;
    goTo('editing');
  };

  return {
    values,
    services,
    errors,
    status,
    phase,
    sendError,
    sent,
    nameRef,
    contactRef,
    companyRef,
    onChange,
    onBlur,
    toggleService,
    onSubmit,
    sendAnother,
  };
}
