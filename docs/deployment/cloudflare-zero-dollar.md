# Cloudflare zero-dollar deployment

## Live deployment record

- URL: `https://fiestamatic.pages.dev`
- Provider product: Cloudflare Pages Free
- Connected repository: `doodstecsonhere/fiestamatic`
- Production branch during migration verification:
  `codex/cloudflare-zero-cost-migration`
- Initial static deployment commit: `379b5d9`
- Shared-board deployment commit: `ac72578`
- Custom domain: none
- Production D1 database: `fiestamatic-bayanihan` in APAC
- Pages Function binding: `DB`
- Verified on 2026-08-25 before shared-board work: home and search, direct
  `/map`, direct `/community`, and the device-only preview

Static page delivery does not use the Workers request allowance. The shared
board API uses Pages Functions and D1, so only API requests and database queries
consume their respective Free-plan allowances.

## Scope

Fiesta discovery, maps, and offline assets remain static. The Bayanihan board
uses same-origin Pages Functions and a D1 Free database so posts can be shared
between visitors. Its minimum launch protections and deletion process are
documented in `docs/community/public-board-safety.md`.

## Build settings

- Root directory: repository root
- Build command: `pnpm --filter @workspace/fiestamatic run build`
- Output directory: `artifacts/fiestamatic/dist/public`
- Node.js: 24
- Package manager: pnpm with the committed lockfile
- Production mode: `.env.production` sets `VITE_COMMUNITY_MODE=shared`
- Secrets: none
- Required D1 binding name: `DB`
- Schema migration: `migrations/0001_bayanihan_public_board.sql`

Configure single-page-application fallback so `/map`, `/community`, and fiesta
detail routes serve `index.html`.

## Zero-dollar boundary

Use only Cloudflare's Free plan. Do not upgrade to Workers Paid, add a payment
method, buy a domain, enable a paid add-on, or attach billable storage. On D1
Free, the board stops returning successful database requests when a daily or
storage allowance is exhausted; it must never switch to paid overages.

## Verification

- Build and type-check pass.
- Cloudflare production build and Functions compilation pass at `ac72578`.
- Home, search, fiesta details, map, and community routes load directly.
- Mobile layout and keyboard navigation receive a focused check.
- Bayanihan displays the public-board and unverified-name notice.
- A second isolated device credential saw a shared fictional post and did not
  receive its ownership permission.
- Unauthorized deletion returned `404`; owner deletion returned `204`.
- Three independent fictional reports returned `200` and automatically hid the
  reported post. The owner could then delete the hidden post.
- All production rehearsal posts and their related report/moderation rows were
  removed after verification; the remaining community post count was zero.
- Input validation, duplicate/spam controls, dual rate limiting, and 90-day
  content erasure are covered by source review and disposable-database tests.
- No request requires `DATABASE_URL`, `SESSION_SECRET`, or a Replit connector.

Cloudflare D1 Free provides seven days of point-in-time recovery. Because this
database began empty and contains no migrated Replit data, no legacy database
backup was imported or required for launch.

## Rollback

Cloudflare can roll back to its previous successful static deployment. That
rollback does not delete or restore D1 records. Keep the D1 database and binding
unchanged during rollback so a corrected deployment can recover. Before Replit
is retired, the immediate fallback is still the unchanged Replit URL. A code
rollback should use a revert commit and review rather than rewriting Git
history.
