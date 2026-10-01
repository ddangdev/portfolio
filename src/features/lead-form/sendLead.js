/* Sends one lead to /api/lead and classifies the outcome. No React; `fetch` is only touched when called.
   The endpoint often answers HTTP 200 with { ok: false }, so success is `body.ok === true` and nothing else.
   Returns { ok: true } | { ok: false, kind: 'server', error } | { ok: false, kind: 'network' }. */

export const LEAD_ENDPOINT = '/api/lead';
export const SEND_TIMEOUT_MS = 15000;   // the server itself waits up to 8 s on the mail API plus the spam check

export async function sendLead(payload, { endpoint = LEAD_ENDPOINT, timeoutMs = SEND_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      return { ok: false, kind: 'network' };
    }

    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;   // not JSON (an HTML error page, an empty body)
    }

    if (body && body.ok === true) return { ok: true };
    const error = body && typeof body.error === 'string' ? body.error.trim() : '';
    return { ok: false, kind: 'server', error };
  } finally {
    clearTimeout(timer);
  }
}
