import assert from 'node:assert/strict';
import handler from '../api/cron.js';
import { directUrl, fetchLinked } from '../api/_lib/links.js';
import stripeWebhook from '../api/stripe-webhook.js';
import { keysFrom } from '../api/mcp.js';

async function hit(headers = {}) {
  const res = { statusCode: 200, headersOut: {}, setHeader(k, v) { this.headersOut[k.toLowerCase()] = v; }, end(body) { this.body = body; } };
  await handler({ method: 'GET', url: '/api/cron', headers }, res);
  return { status: res.statusCode, data: JSON.parse(res.body) };
}

delete process.env.CRON_SECRET;
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
assert.equal((await hit()).status, 503, 'cron must not run when CRON_SECRET is missing');
process.env.CRON_SECRET = 'unit-test-cron-secret';
assert.equal((await hit({ authorization: 'Bearer wrong' })).status, 401, 'wrong secret is rejected');
assert.deepEqual((await hit({ authorization: 'Bearer unit-test-cron-secret' })).data, { skipped: true }, 'valid secret reaches the no-database skip');

for (const url of [
  'http://example.com/file.csv',
  'https://localhost/file.csv',
  'https://api.localhost/file.csv',
  'https://127.0.0.1/file.csv',
  'https://169.254.169.254/latest/meta-data',
  'https://user:pass@example.com/file.csv'
]) assert.throws(() => directUrl(url), /https|can.t be used/i, url);

const originalFetch = globalThis.fetch;
try {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data' } });
  };
  await assert.rejects(() => fetchLinked('https://docs.google.com/spreadsheets/d/abcdefghijklmnopqrst/edit'), /https|can.t be used/i);
  assert.equal(calls, 1, 'private-address redirect is rejected before a second request');

  calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(options.redirect, 'manual', 'redirects must be handled manually');
    if (calls === 1) return new Response(null, { status: 302, headers: { location: 'https://cdn.example.com/export.csv' } });
    return new Response('Date,Amount\n2026-01-01,10\n', { status: 200, headers: { 'content-type': 'text/csv' } });
  };
  const file = await fetchLinked('https://docs.google.com/spreadsheets/d/abcdefghijklmnopqrst/edit');
  assert.match(file.buf.toString('utf8'), /Date,Amount/);
  assert.equal(calls, 2, 'a validated public redirect still works');
} finally {
  globalThis.fetch = originalFetch;
}
console.log('Security tests passed: GOGETTERINC cron and linked-sheet redirects.');



assert.equal(keysFrom({ headers: {}, url: '/api/mcp?key=gg_12345678901234567890123456789012' }).length, 0, 'GO GETTER MCP rejects URL query keys');
assert.deepEqual(keysFrom({ headers: { authorization: 'Bearer gg_12345678901234567890123456789012' }, url: '/api/mcp' }), ['gg_12345678901234567890123456789012'], 'GO GETTER MCP accepts Authorization header keys');

// Stripe webhook must fail closed unless a signing secret and a valid signature exist.
async function webhookHit({ signature = '', body = '{"id":"evt_12345678"}' } = {}) {
  const req = {
    method: 'POST',
    url: '/api/stripe-webhook',
    headers: { 'stripe-signature': signature },
    async *[Symbol.asyncIterator]() { yield Buffer.from(body); }
  };
  const res = { statusCode: 200, headersOut: {}, setHeader(k, v) { this.headersOut[k.toLowerCase()] = v; }, end(body) { this.body = body; } };
  await stripeWebhook(req, res);
  return { status: res.statusCode, data: JSON.parse(res.body) };
}
process.env.DATABASE_URL = 'postgres://test.invalid/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_unit_test';
delete process.env.STRIPE_WEBHOOK_SECRET;
assert.equal((await webhookHit({ signature: 't=1,v1=bad' })).status, 503, 'webhook fails closed without signing secret');
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_unit_test';
assert.equal((await webhookHit()).status, 400, 'webhook rejects requests without Stripe-Signature');
let signatureChecks = 0;
globalThis.__ggStripe = {
  webhooks: {
    constructEvent(raw, signature, secret) {
      signatureChecks++;
      assert.equal(raw.toString('utf8'), '{"id":"evt_12345678"}');
      assert.equal(signature, 't=1,v1=bad');
      assert.equal(secret, 'whsec_unit_test');
      throw new Error('signature mismatch');
    }
  }
};
assert.equal((await webhookHit({ signature: 't=1,v1=bad' })).status, 400, 'webhook rejects invalid Stripe signatures');
assert.equal(signatureChecks, 1, 'raw request bytes are passed to Stripe verification');
delete globalThis.__ggStripe;
delete process.env.DATABASE_URL;
delete process.env.STRIPE_SECRET_KEY;
delete process.env.STRIPE_WEBHOOK_SECRET;
