# Security configuration

Set secrets in Vercel → Project → Settings → Environment Variables. Do not put secret values in source control, tickets, chat, or URLs.

## API key handling

- GO GETTER's MCP connector accepts keys only in `Authorization: Bearer …`, `X-API-Key`, `X-Account-Key`, or `X-GoGetter-Key` headers. URL query-string keys are intentionally rejected because URLs can be retained in logs and browser history. Update any connector configuration that previously appended `?key=`.

## Required for scheduled jobs

- `CRON_SECRET`: a long, random secret. Vercel Cron sends it as `Authorization: Bearer <CRON_SECRET>`. Configure it for the intended environment(s), then redeploy.

## Required for Stripe webhooks

- `STRIPE_SECRET_KEY`: the server-side Stripe secret key already used by the application.
- `STRIPE_WEBHOOK_SECRET`: the signing secret for the exact Stripe webhook endpoint that calls `/api/stripe-webhook` (the value Stripe shows with the `whsec_` prefix). It is different from `STRIPE_SECRET_KEY`. Keep test and live endpoint secrets separate and assign each only to the matching Vercel environment.

After setting or changing environment variables, redeploy the relevant Preview deployment to activate them. Test webhook delivery in Stripe's test mode before enabling the code in Production. Until `STRIPE_WEBHOOK_SECRET` is configured, the webhook intentionally fails closed with HTTP 503.

## Safe verification

- Confirm missing and invalid signatures are rejected.
- Confirm a valid test event is processed once and a duplicate is acknowledged without repeating side effects.
- Never test by charging a real customer or using a live Stripe event against Preview.
