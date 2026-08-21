# Fiestamatic

Fiestamatic is a mobile-first guide to barangay fiestas in Dumaguete City—helping residents and visitors discover celebrations, explore locations, and participate in the community.

## Product features

- Chronological fiesta calendar and countdowns
- Search and filters across Dumaguete’s barangays
- Interactive Leaflet/OpenStreetMap view
- Barangay details, traditions, and patron-saint information
- Bayanihan community board for shared rides and tables

## Technology

React, TypeScript, Vite, Leaflet/OpenStreetMap, Express, PostgreSQL, Drizzle ORM, and pnpm workspaces.

## Development status

This private repository is the independent source of truth for Fiestamatic. It retains the original revision history while the application is being migrated away from Replit.

Migration work should be performed on feature branches and merged through reviewed pull requests.

## Development

Use Node.js 24 and pnpm.

```sh
pnpm install
pnpm run typecheck
pnpm run build
```

The barangay dataset is embedded in the frontend. The Bayanihan board requires a PostgreSQL database and a `DATABASE_URL` environment variable.
