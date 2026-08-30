# Cloudflare zero-dollar deployment

## Live deployment record

- URL: `https://fiestamatic.pages.dev`
- Provider product: Cloudflare Pages Free
- Connected repository: `doodstecsonhere/fiestamatic`
- Production branch: `main`
- Initial static deployment commit: `379b5d9`
- Shared-board deployment commit: `ac72578`
- Post-merge aligned deployment commit:
  `e2dde66fe5f3b986011df7c600e090585422c54c`
- Post-merge production deployment:
  `96085331-3363-451b-947c-3a280e4d9689`
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

## Post-merge production alignment — 2026-08-27

### Confirmed

- GitHub `main` contains merge commit
  `e2dde66fe5f3b986011df7c600e090585422c54c`, and the alignment branch began
  from that exact clean commit.
- Cloudflare Pages production branch changed from
  `codex/cloudflare-zero-cost-migration` to `main`; automatic production
  deployments remain enabled.
- Deployment `96085331-3363-451b-947c-3a280e4d9689` is Production, reports
  branch `main`, and reports source `e2dde66`.
- Production still has D1 binding `DB` connected to
  `fiestamatic-bayanihan`. No secret values were added or changed.
- The live home, direct `/map`, direct `/community`, a Bagacay fiesta-detail
  dialog, the Leaflet map container, and the shared board loaded successfully.
  The home page also passed a focused 390-by-844 visual check.
- The live shared-board rehearsal used two clearly fictional posts. A second
  credential saw the first post without ownership, unauthorized deletion
  returned `404`, and owner deletion returned `204`. Three independent
  fictional reports returned `200`, hid the second post, and its owner could
  delete the hidden post with `204`.
- The exact two fictional post IDs and their reports and moderation events were
  removed directly after the rehearsal. A production query returned zero
  remaining rows for all three categories. Existing owner-created records were
  not changed; the database then contained one visible and one already-deleted
  pre-existing post record.
- Live `/`, `/map`, `/community`, `/sw.js`, and `/manifest.json` returned
  successful responses. Source review confirms the service worker caches the
  application shell, uses a cached navigation fallback, and supplies an
  offline map-tile fallback.

### Zero-dollar export and restore rehearsal

The production database contains owner-created records, so the rehearsal did
not copy their contents and did not restore over production. Wrangler exported
the production schema only. That schema was applied to a disposable local D1
database, one explicitly fictional row was inserted, the local database was
exported to SQL, and that SQL was restored into a second disposable local D1
database. A direct SQLite verification found the exact fictional row in both
the source and restored databases. Both local databases, both export files,
and the temporary Wrangler configuration were then deleted.

The HTTP rehearsal created hashed rate-limit counters. They contain no message,
contact detail, display name, or raw credential. They were not broadly deleted
because they cannot be safely distinguished from a simultaneous real visitor's
counter; normal posting cleanup removes counters older than 24 hours.

### Free-plan boundary checked on 2026-08-27

- Pages static asset requests are free and unlimited. Pages Functions share
  the Workers Free allowance of 100,000 requests per day, resetting at
  midnight UTC.
- Pages Free permits 500 builds per month, one concurrent build, 20,000 files
  per site, and 25 MiB per individual asset.
- D1 Free permits 5 million rows read per day, 100,000 rows written per day,
  and 5 GB total account storage. This database also remains subject to the
  D1 Free per-database size limit.
- D1 Free limit exhaustion rejects database operations instead of creating a
  paid overage. D1 Time Travel is always enabled, costs no extra, and retains
  seven days on Workers Free.
- No billing plan, payment method, trial, paid add-on, custom domain, or paid
  storage was enabled by this alignment.

Official references checked: [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/),
[Pages limits](https://developers.cloudflare.com/pages/platform/limits/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), and
[D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

### Remaining verification boundary

The service-worker files and offline fallback logic were verified, but this
browser session could not toggle the network fully offline. A real
network-disconnected replay of home, cached fiesta details, and map fallback
therefore remains a manual final-retirement check. Replit remains connected and
unchanged.

## Rollback

Cloudflare can roll back to its previous successful static deployment. That
rollback does not delete or restore D1 records. Keep the D1 database and binding
unchanged during rollback so a corrected deployment can recover. Before Replit
is retired, the immediate fallback is still the unchanged Replit URL. A code
rollback should use a revert commit and review rather than rewriting Git
history.

For this alignment specifically, select the previous successful production
deployment `0eb5f621-52ce-4f86-892c-0daa1465b86f` (source `1958d63`) in
Cloudflare Pages and use its rollback action. Leave `DB` and
`fiestamatic-bayanihan` untouched. If Git-trigger behavior itself must also be
reversed, change the production branch back to
`codex/cloudflare-zero-cost-migration`; that configuration rollback is separate
from the deployment rollback. Do not restore D1 Time Travel merely to roll back
application code, because an in-place database restore overwrites current data.
