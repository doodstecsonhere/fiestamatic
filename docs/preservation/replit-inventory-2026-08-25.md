# Replit preservation inventory — 2026-08-25

This sanitized record contains names and metadata only. It contains no secret
values, connection strings, database records, or personal contact details.

## Confirmed

- Replit project: `Fiestamatic: Fiesta Finder`
- Repl ID: `2f74366c-1dd3-4468-9218-11860b92e6a4`
- GitHub repository: `doodstecsonhere/fiestamatic`
- Publishing type: Autoscale, Asia, 2 vCPU, 4 GiB, one maximum machine
- Replit deployment ID: `afc87d1c-26f9-48d2-a40d-f35f8be8d318`
- Replit URL: `https://fiestamatic-fiesta-finder--doodstecson.replit.app`
- Published-app expiry displayed by Replit: 2026-09-15
- Production database: suspended, zero tables, zero rows, reported 0 B used,
  seven-day point-in-time recovery enabled
- Development database: one `community_posts` table with five clearly
  disposable demonstration records
- No database migration or data backup is required for the replacement
- Development App Secret name: `SESSION_SECRET`
- Development database connection name: `DATABASE_URL`
- Production variable names: `SESSION_SECRET`, `DATABASE_URL`, `PGDATABASE`,
  `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `CONNECTORS_HOSTNAME`, and
  `REPLIT_CONNECTORS_HOSTNAME`
- GitHub integration is active; Bitbucket and GitLab are disconnected
- Stripe, Google Drive, Slack, and Twilio are not active Fiestamatic app
  connectors; their names appeared only as empty-state examples
- No active App Storage bucket or repository-defined scheduled task was found
- The owner confirms that no custom domain or external DNS record was created
  for Fiestamatic

## Accepted owner decisions

- Replit's GitHub App may retain access to all repositories.
- The five demonstration Bayanihan records may be discarded.
- The replacement may initially operate without a shared database.
- The Bayanihan board must be device-local until authentication, ownership,
  moderation, abuse controls, and a safe shared datastore are implemented.

## Remaining external unknowns

- GitHub's elevated installation-permission detail page was not opened past
  its account confirmation prompt. The owner accepts all-repository access.
- Replit's project view showed only the current Autoscale deployment. An
  account-wide view is still needed to conclusively exclude detached legacy
  deployments or schedules.

## Retirement gate

Do not disconnect or delete Replit until the replacement URL has passed the
core mobile journeys and rollback has been recorded. Once that is complete,
Replit retirement is an owner decision; database preservation is not a gate.
