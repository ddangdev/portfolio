import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useSpring, useTransition, animated } from '@react-spring/web';

const Backdrop = styled(animated.div)`
  position: fixed;
  inset: 0;
  background: rgba(45, 52, 54, 0.24);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 24px;
`;

const Card = styled(animated.div)`
  width: 100%;
  max-width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  background: #FFF5F7;
  border: 1px solid rgba(217, 139, 168, 0.6);
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: 32px 28px 28px;
  text-align: left;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0;
  font-family: inherit;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.accentPink};
    color: ${({ theme }) => theme.colors.white};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const Heading = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.375rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin: 0 0 6px 0;
`;

const Subhead = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  margin: 0 0 20px 0;
`;

const FieldGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.6875rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`;

const fieldBaseStyles = `
  width: 100%;
  padding: 10px 14px;
  border: 2px solid rgba(217, 139, 168, 0.3);
  border-radius: 10px;
  background: #FFFBF4;
  font-family: inherit;
  font-size: 0.9375rem;
  color: #2D3436;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: rgba(45, 52, 54, 0.35);
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: #D98BA8;
    box-shadow: 0 0 0 3px rgba(217, 139, 168, 0.15);
  }

  &[aria-invalid='true'] {
    border-color: #C44D7A;
  }
`;

const Input = styled.input`${fieldBaseStyles}`;
const Textarea = styled.textarea`
  ${fieldBaseStyles}
  resize: vertical;
  min-height: 92px;
  line-height: 1.5;
  font-family: inherit;
`;

const ErrorText = styled.p`
  font-size: 0.75rem;
  color: #C44D7A;
  margin: 4px 0 0 0;
  text-transform: lowercase;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px 18px;
  border: none;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.accentPink};
  color: ${({ theme }) => theme.colors.white};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: 0.9375rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  cursor: pointer;
  margin-top: 8px;
  transition: background 0.18s, transform 0.12s;

  &:hover {
    background: #C44D7A;
  }

  &:active {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Visually hidden honeypot — bots auto-fill any input they see.
// Real humans never interact with it. Server-side, a filled value = bot.
const HoneypotField = styled.div`
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
`;

// Error banner shown above the submit button on network/server failure
const ErrorBanner = styled.div`
  background: rgba(196, 77, 122, 0.1);
  border: 1px solid rgba(196, 77, 122, 0.3);
  color: #C44D7A;
  font-size: 0.8125rem;
  padding: 10px 14px;
  border-radius: 10px;
  margin-bottom: 12px;
  text-transform: lowercase;
  line-height: 1.4;
`;

// Small inline spinner for the loading state
const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  vertical-align: -2px;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ── Success state ───────────────────────────────────────────────
const SuccessWrapper = styled.div`
  padding: 32px 8px 16px;
  text-align: center;
`;

const CheckCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentPink};
  color: ${({ theme }) => theme.colors.white};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.875rem;
  margin: 0 auto 18px;
  line-height: 1;
`;

const SuccessHeading = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
  text-transform: lowercase;
  margin: 0 0 8px 0;
`;

const SuccessBody = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.small};
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: lowercase;
  line-height: 1.5;
  margin: 0;
`;

// ── Main component ──────────────────────────────────────────────

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
// Count actual digits to enforce a reasonable minimum
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

    // Name — required, 2+ chars, letters + punctuation only
    if (!nameT) {
      e.name = 'please add your name';
    } else if (!NAME_RE.test(nameT)) {
      e.name = 'names can use letters, spaces, apostrophes, and hyphens';
    }

    // Email — required, proper RFC-subset regex
    if (!emailT) {
      e.email = 'please add your email';
    } else if (!EMAIL_RE.test(emailT)) {
      e.email = 'that email looks off';
    }

    // Phone — optional, but validate format if provided
    if (phoneT) {
      if (!PHONE_RE.test(phoneT)) {
        e.phone = 'digits, spaces, dashes, parens, optional leading +';
      } else if (countDigits(phoneT) < 7) {
        e.phone = 'needs at least 7 digits';
      }
    }

    // Message — required, min 10 chars, max 2000
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
        setSubmitted(true);
      } else {
        // Try to surface Formspree's error message if there is one
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
      // Network error — user is offline or request blocked
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
