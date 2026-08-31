# Zero-dollar map decision

## Root cause

The Cloudflare map used CARTO Voyager raster tiles from
`basemaps.cartocdn.com`. CARTO now overlays those requests with
`API KEY required` and `carto.com/basemaps/apikey`, so the map was no longer
an unimpeded public map.

## Online provider

Fiestamatic uses OpenStreetMap Foundation's Standard raster tile service at
`https://tile.openstreetmap.org/{z}/{x}/{y}.png` for normal, human-driven
interactive viewing while online.

The provider decision was checked against the official
[Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) and
[OpenStreetMap copyright and licence page](https://www.openstreetmap.org/copyright)
on 2026-08-31.

### Terms and zero-dollar boundary

- No API key, account, trial, card, payment method, or billing activation is
  required.
- The service is donation-funded, best effort, and has no service-level
  guarantee. OSMF may block access without notice if usage is heavy,
  inappropriate, or harms the service.
- The policy publishes no numeric per-application request allowance. It permits
  ordinary interactive viewing and prohibits bulk downloading, scraping,
  prefetching, and building offline tile archives.
- Modern browser caching must honor the tile server's HTTP caching headers.
  Fiestamatic does not add no-cache headers and its service worker deliberately
  does not intercept or persist OSM tiles.
- The required visible attribution is
  `© OpenStreetMap contributors`, linked to the copyright and ODbL information.
- OpenStreetMap data is available under ODbL, including commercial use subject
  to the licence. The community tile service itself provides no availability
  guarantee, and the policy warns that access can be withdrawn, particularly
  for problematic or high-volume use.
- There is no paid overage path. If OSMF restricts the application, tiles stop
  loading; no charge is created.
- There is no Fiestamatic provider account to expire through inactivity.

This is suitable for Fiestamatic's current small, zero-budget community use,
but availability and traffic growth must be monitored. A later high-traffic
release would require a newly reviewed provider or self-hosting decision.

## Offline and failure behavior

OSMF prohibits using its Standard tile server as an offline-download source.
Fiestamatic therefore does not prefetch or service-worker-cache third-party
tiles.

When the browser reports offline status or an online tile request fails, the
map switches to the bundled `/offline-map.svg`. It is a schematic orientation
guide, not a street-navigation map. The Leaflet map stays interactive and keeps
all barangay markers, fiesta popups, and barangay detail dialogs available.
The UI says clearly when this fallback is active.

The bundled fallback is precached with the application shell and makes no
network request. Previously viewed OSM tiles may still appear from the
browser's normal standards-compliant HTTP cache, but arbitrary uncached areas
are not claimed to work offline.

## Rollback

Before merge, discard or close the focused branch and PR. After merge, use a
reviewed revert PR; do not rewrite `main`.

After an approved production deployment, application rollback should select
Cloudflare deployment `96085331-3363-451b-947c-3a280e4d9689`, source
`e2dde66fe5f3b986011df7c600e090585422c54c`. Keep D1 binding `DB` and
database `fiestamatic-bayanihan` unchanged. Do not use D1 Time Travel to
roll back map code. The untouched Replit deployment remains the independent
emergency fallback.
