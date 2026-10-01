/* Contract test: the payload the browser builds (src/features/lead-form) against the real endpoint
   (functions/api/lead.js). Runs with `npm test` (node --test). fetch is mocked; no network, no secrets. */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { onRequestPost } from '../../functions/api/lead.js';
import { buildLeadPayload, PAYLOAD_KEYS } from '../../src/features/lead-form/buildLeadPayload.js';
import { validateField } from '../../src/features/lead-form/validation.js';
import { serviceChips } from '../../src/data/services.js';
import { CONTACTS, ENV, leadRequest, mockFetch, okInput } from './fixtures.js';

const meta = { turnstileToken: 'tok', page: 'https://ddanghnl.com/' };
const post = async (body, opts = {}) => {
  const res = await onRequestPost({ request: leadRequest(body, opts), env: opts.env || ENV });
  return { status: res.status, body: await res.json() };
};

test('1. a full payload is delivered: verify once, mail once, subject, text and reply_to', async (t) => {
  const calls = mockFetch(t);
  const r = await post(buildLeadPayload(okInput, meta));
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: true });
  assert.equal(calls.verify.length, 1);
  assert.equal(calls.verify[0].get('secret'), 'test-secret');
  assert.equal(calls.verify[0].get('response'), 'tok');
  assert.equal(calls.verify[0].get('remoteip'), '203.0.113.7');
  assert.equal(calls.resend.length, 1);
  const mail = calls.resend[0];
  assert.equal(mail.subject, 'new lead — Kai Test · website + hosting + not sure yet');
  assert.match(mail.text, /- website \+ hosting/);
  assert.match(mail.text, /- not sure yet/);
  assert.match(mail.text, /hxxps:\/\/ddanghnl\.com\//);
  assert.equal(mail.reply_to, 'kai@example.com');
});

test('2. a phone contact is accepted, with no reply_to', async (t) => {
  const calls = mockFetch(t);
  const r = await post(buildLeadPayload({ ...okInput, contact: '808 555 0100' }, meta));
  assert.equal(r.body.ok, true);
  assert.equal(calls.resend[0].reply_to, undefined);
});

test('3. a filled honeypot answers ok and sends nothing', async (t) => {
  mockFetch(t);
  const r = await post(buildLeadPayload({ ...okInput, company: 'Acme' }, meta));
  assert.deepEqual(r.body, { ok: true });
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test('4. an empty token fails the anti-spam check without mailing', async (t) => {
  const calls = mockFetch(t);
  const r = await post(buildLeadPayload(okInput, { ...meta, turnstileToken: '' }));
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, false);
  assert.match(r.body.error, /anti-spam check/);
  assert.equal(calls.resend.length, 0);
});

test('5. a failed verification is ok:false', async (t) => {
  mockFetch(t, { verify: { success: false } });
  const r = await post(buildLeadPayload(okInput, meta));
  assert.equal(r.status, 200);
  assert.equal(r.body.ok, false);
});

test('6. the token must come from our own hosts (www included)', async (t) => {
  await t.test('evil.example', async (tt) => {
    mockFetch(tt, { verify: { success: true, hostname: 'evil.example' } });
    assert.equal((await post(buildLeadPayload(okInput, meta))).body.ok, false);
  });
  await t.test('www.ddanghnl.com', async (tt) => {
    mockFetch(tt, { verify: { success: true, hostname: 'www.ddanghnl.com' } });
    assert.equal((await post(buildLeadPayload(okInput, meta))).body.ok, true);
  });
});

test('7. a mail API failure is ok:false with the retry message', async (t) => {
  mockFetch(t, { resendStatus: 500 });
  const r = await post(buildLeadPayload(okInput, meta));
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { ok: false, error: "couldn't send right now — please try again in a moment." });
});

test('8. no Turnstile secret: refused in production, skipped on localhost', async (t) => {
  const { TURNSTILE_SECRET: _drop, ...noSecret } = ENV;
  await t.test('ddanghnl.com -> 503', async (tt) => {
    mockFetch(tt);
    const r = await post(buildLeadPayload(okInput, meta), { env: noSecret });
    assert.equal(r.status, 503);
    assert.equal(r.body.ok, false);
  });
  await t.test('localhost -> verify skipped, ok', async (tt) => {
    const calls = mockFetch(tt);
    const r = await post(buildLeadPayload(okInput, meta), { env: noSecret, host: 'localhost' });
    assert.equal(r.body.ok, true);
    assert.equal(calls.verify.length, 0);
  });
});

test('9. an unusable contact is 422', async (t) => {
  mockFetch(t);
  const r = await post(buildLeadPayload({ ...okInput, contact: 'hello' }, meta));
  assert.equal(r.status, 422);
  assert.equal(r.body.ok, false);
});

test('10. a body that is not JSON is 400', async (t) => {
  mockFetch(t);
  const r = await post('not json', { raw: true });
  assert.equal(r.status, 400);
  assert.equal(r.body.ok, false);
});

test('11. a long token reaches siteverify unchanged', async (t) => {
  const calls = mockFetch(t);
  const token = 'x'.repeat(2000);
  await post(buildLeadPayload(okInput, { ...meta, turnstileToken: token }));
  assert.equal(calls.verify[0].get('response'), token);
});

test('12. every contact the browser accepts, the server accepts', async (t) => {
  mockFetch(t);
  const accepted = CONTACTS.filter((c) => validateField('contact', c) === '');
  assert.ok(accepted.length >= 10, 'the fixture list should hold plenty of valid contacts');
  assert.ok(accepted.length < CONTACTS.length, 'and some invalid ones');
  for (const contact of accepted) {
    const r = await post(buildLeadPayload({ ...okInput, contact }, meta));
    assert.equal(r.body.ok, true, `server rejected a client-valid contact: ${JSON.stringify(contact)}`);
  }
});

test('13. the payload has exactly the agreed keys and only chip names as services', () => {
  const payload = buildLeadPayload(okInput, meta);
  assert.deepEqual(Object.keys(payload), PAYLOAD_KEYS);
  assert.deepEqual(PAYLOAD_KEYS, ['name', 'contact', 'message', 'services', 'unsure', 'turnstileToken', 'company', 'page']);
  const names = serviceChips.map((c) => c.name);
  assert.ok(payload.services.every((s) => names.includes(s)));
  assert.equal(payload.unsure, true);
  assert.equal(payload.name, 'Kai Test');
  assert.equal(buildLeadPayload({ ...okInput, services: ['analytics'] }, meta).unsure, false);
});

test('14. a name made only of control characters fails in the browser, as it would at the server', async (t) => {
  mockFetch(t);
  const name = String.fromCharCode(7, 8);
  assert.notEqual(validateField('name', name), '');
  const r = await post(buildLeadPayload({ ...okInput, name }, meta));
  assert.equal(r.status, 422);
});
