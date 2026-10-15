// @ts-check
import Stripe from 'stripe';

/** @type {Stripe | null} */
let client = null;

export function stripeKey() { return process.env.STRIPE_SECRET_KEY || ''; }
export function testMode() { return /^(sk|rk)_test_/.test(stripeKey()); }

/** @returns {Stripe} */
export function stripe() {
  if (!client) {
    // a stand-in can be injected for local testing
    client = /** @type {any} */ (globalThis).__ggStripe || new Stripe(stripeKey(), {
      maxNetworkRetries: 1,
      timeout: 20_000,
      appInfo: { name: 'GO GETTER admin' }
    });
  }
  return /** @type {Stripe} */ (client);
}

/** Turn a Stripe error into a short message for the screen. @param {any} e */
export function stripeMessage(e) {
  if (!e || !e.type) return null;
  if (e.code === 'authentication_required') return 'The bank wants the customer to approve this charge. Send them an invoice or a pay link instead.';
  if (e.type === 'StripeCardError') return 'Card declined: ' + (e.message || 'the bank said no.');
  if (e.type === 'StripeAuthenticationError') return 'The Stripe key is not valid. Check STRIPE_SECRET_KEY in Vercel.';
  if (e.type === 'StripeInvalidRequestError') return 'Stripe: ' + (e.message || 'invalid request');
  if (e.type === 'StripeConnectionError') return 'Could not reach Stripe. Try again.';
  return 'Stripe: ' + (e.message || 'error');
}
