/* PURE: form values -> the exact JSON body functions/api/lead.js reads.
   "not sure yet" travels inside `services`, so it shows in the lead email's subject and list;
   `unsure` is kept as a boolean for parity with the old site (the endpoint ignores it).
   The honeypot `company` is passed untouched: the server is the one that decides. */
import { UNSURE } from '../../data/services.js';

export const PAYLOAD_KEYS = ['name', 'contact', 'message', 'services', 'unsure', 'turnstileToken', 'company', 'page'];

export function buildLeadPayload({ name, contact, message, services, company }, { turnstileToken, page }) {
  return {
    name: name.trim(),
    contact: contact.trim(),
    message: message.trim(),
    services: [...services],
    unsure: services.includes(UNSURE.name),
    turnstileToken,
    company,
    page,
  };
}
