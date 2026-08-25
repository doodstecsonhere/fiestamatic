# Cloudflare zero-dollar deployment

## Scope

Fiestamatic is deployed as static assets. Fiesta discovery, maps, offline
assets, and device-local Bayanihan demonstration posts do not require a server,
database, secrets, or paid API.

The shared community API is deliberately not deployed. Public shared posting
must not return until authentication, ownership checks, moderation, reporting,
rate limiting, privacy safeguards, and a zero-cost datastore plan are ready.

## Build settings

- Root directory: repository root
- Build command: `pnpm --filter @workspace/fiestamatic run build`
- Output directory: `artifacts/fiestamatic/dist/public`
- Node.js: 24
- Package manager: pnpm with the committed lockfile
- Production mode: `.env.production` sets `VITE_COMMUNITY_MODE=local`
- Secrets: none
- Database: none

Configure single-page-application fallback so `/map`, `/community`, and fiesta
detail routes serve `index.html`.

## Zero-dollar boundary

Use only Cloudflare's Free plan. Do not upgrade to Workers Paid, add a payment
method, buy a domain, enable a paid add-on, or attach billable storage. Static
asset requests on Cloudflare Pages are free and unlimited; Free-plan build and
file limits apply.

## Verification

- Build and type-check pass.
- Home, search, fiesta details, map, and community routes load directly.
- Mobile layout and keyboard navigation receive a focused check.
- Bayanihan displays the device-only notice and creates/deletes only local
  browser records.
- No request requires `DATABASE_URL`, `SESSION_SECRET`, or a Replit connector.

## Rollback

Cloudflare can roll back to its previous successful deployment. Before Replit
is retired, the immediate rollback is to continue using the unchanged Replit
URL. A code rollback should use a revert commit and review rather than rewriting
Git history.
