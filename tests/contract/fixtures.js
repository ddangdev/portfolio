/* Shared fixtures for the lead contract test: a request builder, a fake env and a mocked fetch router.
   Nothing here touches the network or a real secret: an unexpected URL throws. */

export const ENV = { TURNSTILE_SECRET: 'test-secret', RESEND_API_KEY: 'test-key', LEAD_TO: 'inbox@example.com' };

export function leadRequest(body, { host = 'ddanghnl.com', raw = false } = {}) {
  return new Request(`https://${host}/api/lead`, {
    method: 'POST',
    body: raw ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' },
  });
}

/** Installs a fetch router on globalThis via node:test's mock; returns the recorded calls. */
export function mockFetch(t, { verify = { success: true, hostname: 'ddanghnl.com' }, resendStatus = 200 } = {}) {
  const calls = { verify: [], resend: [] };
  t.mock.method(globalThis, 'fetch', async (url, init = {}) => {
    const href = String(url);
    if (href === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      calls.verify.push(new URLSearchParams(init.body));
      return Response.json(verify);
    }
    if (href === 'https://api.resend.com/emails') {
      calls.resend.push(JSON.parse(init.body));
      return new Response(resendStatus === 200 ? '{"id":"x"}' : 'boom', { status: resendStatus });
    }
    throw new Error(`unexpected fetch in test: ${href}`);
  });
  return calls;
}

export const okInput = {
  name: ' Kai Test ',
  contact: 'kai@example.com',
  message: 'hi',
  services: ['website + hosting', 'not sure yet'],
  company: '',
};

/* contacts, valid and invalid; the invariant test needs a mix of both. Phone-shaped values here are
   test fixtures only (555-01xx is reserved for fiction), never site copy. */
export const CONTACTS = [
  'kai@example.com', 'k.ai+tag@mail.example.co', 'a@b.io', 'kai@x', 'kai@x.c', 'kai@@x.com', 'kai@ x.com',
  '@example.com', 'kai.example.com', 'hello', '', '   ', '808 555 0100', '(808) 555-0100', '+1 808 555 0100',
  '808.555.0100', '5550100', '555010', '12345678901234567', '+44 20 7946 0958', 'call 808 555 0100',
  '808-555-01OO', 'kai@example.com ', ' kai@example.com', 'KAI@EXAMPLE.COM', 'kai@sub.example.museum',
  '1234567', '+(1) 808-555-0100', 'kai@example.c0m', 'x@y.zz',
];
