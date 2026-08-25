# Cloudflare zero-dollar deployment

## Live deployment record

- URL: `https://fiestamatic.pages.dev`
- Provider product: Cloudflare Pages Free
- Connected repository: `doodstecsonhere/fiestamatic`
- Production branch during migration verification:
  `codex/cloudflare-zero-cost-migration`
- Initial deployed source commit: `379b5d9`
- Custom domain: none
- Database, Functions, storage bindings, and secrets: none
- Verified on 2026-08-25: home and search, direct `/map`, direct `/community`,
  device-local posting, and the device-only disclosure

Cloudflare showed 11 of 100,000 account requests used on the audit date. The
deployment uses static assets rather than Pages Functions, so it does not need
the Workers request allowance for normal page delivery.

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
