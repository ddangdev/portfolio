import { useState, useEffect, useRef, useCallback } from 'react';
import { useTransition } from '@react-spring/web';
import {
  Backdrop, Card, CloseButton, Heading, Subhead,
  FieldGroup, Label, Input, Textarea, ErrorText,
  SubmitButton, HoneypotField, ErrorBanner, Spinner,
  SuccessWrapper, CheckCircle, SuccessHeading, SuccessBody,
} from './contactFormStyles';
import { trackEvent } from '../../utils/analytics';

// ── Validation regex ────────────────────────────────────────────
// Email: HTML5-aligned RFC 5322 subset. Requires local@domain.tld,
// rejects spaces, consecutive dots, trailing dots, empty labels.
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Name: letters (incl. accented), spaces, apostrophes, hyphens, periods.
// 2–60 chars. Allows unicode letters for international names.
const NAME_RE = /^[\p{L}][\p{L}\s'\-.]{1,59}$/u;

// Phone: optional field. When filled, accept common formats globally.
// Digits, spaces, hyphens, parens, optional leading + for country code.
// Requires at least 7 digits to be valid.
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;
const countDigits = (s) => (s.match(/\d/g) || []).length;

// Message: length bounds only (regex would be overkill for free-form text)
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mrerzdzr';

function ContactFormPopup({ open, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState(''); // must stay empty — if filled, assume bot
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const cardRef = useRef(null);
  const firstFieldRef = useRef(null);

  // Reset form when closing
  useEffect(() => {
    if (!open) {
      // delay reset so the exit animation sees the final state
      const id = setTimeout(() => {
        setName(''); setEmail(''); setPhone(''); setMessage('');
        setHoneypot('');
        setErrors({}); setSubmitted(false);
        setSubmitting(false); setSubmitError(null);
      }, 300);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Focus the first field on open
  useEffect(() => {
    if (open && !submitted) {
      const id = setTimeout(() => firstFieldRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [open, submitted]);

  // ESC key dismiss
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Auto-dismiss success after 3.5s
  useEffect(() => {
    if (!submitted) return;
    const id = setTimeout(onClose, 3500);
    return () => clearTimeout(id);
  }, [submitted, onClose]);

  const validate = useCallback(() => {
    const e = {};
    const nameT = name.trim();
    const emailT = email.trim();
    const phoneT = phone.trim();
    const messageT = message.trim();

    if (!nameT) {
      e.name = 'please add your name';
    } else if (!NAME_RE.test(nameT)) {
      e.name = 'names can use letters, spaces, apostrophes, and hyphens';
    }

    if (!emailT) {
      e.email = 'please add your email';
    } else if (!EMAIL_RE.test(emailT)) {
      e.email = 'that email looks off';
    }

    if (phoneT) {
      if (!PHONE_RE.test(phoneT)) {
        e.phone = 'digits, spaces, dashes, parens, optional leading +';
      } else if (countDigits(phoneT) < 7) {
        e.phone = 'needs at least 7 digits';
      }
    }

    if (!messageT) {
      e.message = 'write a quick note';
    } else if (messageT.length < MESSAGE_MIN) {
      e.message = `a few more words please (at least ${MESSAGE_MIN} characters)`;
    } else if (messageT.length > MESSAGE_MAX) {
      e.message = `that's a lot — keep it under ${MESSAGE_MAX} characters`;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, email, phone, message]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot: if the hidden field has ANY value, a bot filled it.
    // Silently "succeed" so the bot thinks it worked, but don't POST anything.
    if (honeypot.trim() !== '') {
      setSubmitted(true);
      return;
    }

    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      if (response.ok) {
        trackEvent('contact_submit', { has_phone: phone.trim().length > 0 });
        setSubmitted(true);
      } else {
        let msg = 'something went wrong sending your message. try again?';
        try {
          const data = await response.json();
          if (data?.errors?.[0]?.message) {
            msg = data.errors[0].message.toLowerCase();
          }
        } catch { /* ignore parse errors */ }
        setSubmitError(msg);
      }
    } catch (err) {
      setSubmitError("couldn't reach the server. check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Click-outside dismiss
  const onBackdropClick = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) onClose();
  };

  const transition = useTransition(open, {
    from: { opacity: 0, scale: 0.94, translateY: 16 },
    enter: { opacity: 1, scale: 1, translateY: 0 },
    leave: { opacity: 0, scale: 0.94, translateY: 16 },
    config: { tension: 300, friction: 26 },
  });

  return transition((style, isOpen) =>
    isOpen ? (
      <Backdrop
        style={{ opacity: style.opacity }}
        onMouseDown={onBackdropClick}
        role="presentation"
      >
        <Card
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-form-heading"
          style={{
            transform: style.scale.to(
              (s, ty) => `scale(${s}) translateY(${ty}px)`,
              style.translateY
            ),
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose} aria-label="close">×</CloseButton>

          {submitted ? (
            <SuccessWrapper>
              <CheckCircle>✓</CheckCircle>
              <SuccessHeading>thanks!</SuccessHeading>
              <SuccessBody>
                got your note. i'll get back to you within a day or two.
              </SuccessBody>
            </SuccessWrapper>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Heading id="contact-form-heading">get in touch</Heading>
              <Subhead>drop a note — i'll get back to you soon.</Subhead>

              {/* Honeypot field — visually hidden from real users, but bots
                  that fill every input will fill this one too. If it's
                  non-empty on submit, we silently discard the submission. */}
              <HoneypotField aria-hidden="true">
                <label htmlFor="cf-website">website (leave blank)</label>
                <input
                  id="cf-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </HoneypotField>

              <FieldGroup>
                <Label htmlFor="cf-name">name</Label>
                <Input
                  id="cf-name"
                  ref={firstFieldRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'cf-name-err' : undefined}
                />
                {errors.name && <ErrorText id="cf-name-err">{errors.name}</ErrorText>}
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="cf-email">email</Label>
                <Input
                  id="cf-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'cf-email-err' : undefined}
                />
                {errors.email && <ErrorText id="cf-email-err">{errors.email}</ErrorText>}
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="cf-phone">phone (optional)</Label>
                <Input
                  id="cf-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=""
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'cf-phone-err' : undefined}
                />
                {errors.phone && <ErrorText id="cf-phone-err">{errors.phone}</ErrorText>}
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="cf-message">message</Label>
                <Textarea
                  id="cf-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="what's on your mind?"
                  rows={4}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'cf-message-err' : undefined}
                />
                {errors.message && <ErrorText id="cf-message-err">{errors.message}</ErrorText>}
              </FieldGroup>

              {submitError && (
                <ErrorBanner role="alert">{submitError}</ErrorBanner>
              )}

              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? <><Spinner />sending...</> : 'send message'}
              </SubmitButton>
            </form>
          )}
        </Card>
      </Backdrop>
    ) : null
  );
}

export default ContactFormPopup;
