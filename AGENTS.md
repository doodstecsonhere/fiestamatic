# Fiestamatic Project Instructions

## Purpose and communication

Fiestamatic is a mobile-first guide to Dumaguete City barangay fiestas. It
includes fiesta discovery, barangay information, maps, offline behavior, and a
Bayanihan community board backed by PostgreSQL.

The owner is a technically new developer. At the end of every task:

- Explain the result in plain, non-technical language.
- List every file changed and every check performed.
- Distinguish confirmed results from assumptions, unknowns, and checks that
  could not be run.
- Explain exactly how to roll back the implemented change.
- Call out any remaining risk, manual verification, or owner decision.

## Authoritative repository and scope

- The private GitHub repository `doodstecsonhere/fiestamatic` is the sole
  authoritative source for future Fiestamatic development.
- Treat any old Replit-connected Fiestamatic repository as a historical
  snapshot, not a development destination.
- Keep Fiestamatic work separate from the owner's other applications.
- Never allow Replit or another integration to overwrite this repository.
- Do not disconnect Replit until the replacement has passed final code, data,
  deployment, domain, and rollback verification and the owner explicitly
  approves disconnection.

## Strict zero-dollar budget

- The current budget is exactly zero dollars.
- Never activate a trial, subscription, paid service, paid add-on,
  pay-as-you-go billing, usage overage, or service requiring a payment method
  without the owner's explicit approval.
- Never add a payment method, disable a spending cap, or change billing.
- Do not treat a temporary free trial as a zero-cost solution.
- Prefer permanent free plans that stop, pause, or reject requests at their
  limits instead of charging automatically.
- Before recommending or connecting a service, document its free-plan limits,
  commercial-use rules, inactivity behavior, card requirement, behavior when
  the allowance is exhausted, and whether overage charges are possible.
- If an action might create a charge and the cost behavior is not confirmed,
  stop and ask the owner.

## Read-only requests and approval boundaries

When the owner asks for an assessment, review, diagnosis, or investigation,
remain read-only unless the request separately authorizes implementation.

For an authorized implementation task, Codex may perform only the work placed
in scope. Normal safe implementation work may include:

- Inspecting repository files and safe metadata.
- Editing authorized local project files.
- Creating one focused branch for the feature or fix.
- Running safe local checks with non-production data.
- Making small, understandable commits.
- Pushing the feature branch to this private GitHub repository for cloud
  backup.
- Preparing a pull request for owner review.

Codex must obtain explicit owner approval before:

- Merging any pull request.
- Publishing a tag or GitHub Release.
- Deploying to production or changing a production deployment.
- Changing a domain or DNS.
- Changing production environment variables, authentication, storage, or
  hosting configuration.
- Accessing, importing, exporting, deleting, or modifying production data.
- Applying a database migration to any shared, preview, or production database.
- Rotating or revoking a working credential.
- Enabling billing, adding a payment method, or using a paid service.
- Disconnecting Replit or changing its repository synchronization.
- Deleting a repository, branch, service, database, backup, or storage bucket.

An instruction to prepare a pull request is not permission to merge it. An
instruction to prepare a deployment is not permission to deploy it.

## Git and pull-request workflow

- Begin from a clean working tree. If unrelated changes exist, preserve them
  and stop if they overlap the requested work.
- Use one clearly named branch per feature or fix. Do not develop directly on
  `main`.
- Prefer branch names such as `codex/<short-purpose>`, `feat/<short-purpose>`,
  `fix/<short-purpose>`, or `docs/<short-purpose>`.
- Keep commits small, understandable, and limited to the authorized task.
- Do not mix unrelated refactoring, formatting, dependency updates, or cleanup
  into a change.
- Review the diff and run checks appropriate to the change before committing.
- Push the feature branch to the active private GitHub repository so the work
  has a cloud backup.
- Prepare a pull request that explains the change, checks, risks, and rollback.
- Leave pull requests unmerged until the owner explicitly approves merging.
- Never force-push `main` or rewrite shared history.
- Prefer a revert commit over destructive history rewriting after changes have
  been shared.

## Dependencies and generated files

- Use Node.js 24 and pnpm for this workspace.
- Keep `pnpm-lock.yaml` committed and use frozen-lockfile installs in automated
  checks.
- Do not install, remove, or upgrade dependencies unless the current task
  explicitly authorizes it.
- Explain why a new dependency is necessary and review its license,
  maintenance, security, bundle-size, portability, and zero-budget impact.
- Preserve the pnpm minimum-release-age protection unless the owner approves a
  documented exception.
- Do not introduce new Replit-only dependencies into portable application code.
- Do not hand-edit generated API clients or generated schemas when their source
  specification can be updated and regenerated safely.
- Do not run generators, builds, or formatters during a read-only task.

## Secrets and private data

- Never print, expose, commit, or paste secret values, credentials, tokens,
  connection strings, private keys, session data, or private user information.
- Commit only safe variable names and non-secret placeholders to an example
  environment file.
- Keep real `.env` files and environment-specific secret files ignored.
- Treat `DATABASE_URL` and all database connection details as sensitive.
- Use separate local, preview, and production credentials with least privilege.
- Never use production user data as development or preview sample data.
- Do not rotate a working credential until every consumer and rollback step is
  known and the owner explicitly approves the rotation.
- If a possible secret is found in Git history, report only its file path and
  apparent type; never repeat or validate the value.

## Database and community data safety

- PostgreSQL stores Bayanihan community posts. Git does not back up those
  records.
- Use versioned, reviewed migration files instead of relying on unrecorded
  schema pushes.
- Never run `drizzle-kit push-force` against a shared or production database.
- Do not automatically apply database changes from a post-merge hook or
  deployment without explicit approval.
- Test migrations against a disposable database first.
- Before any shared or production migration, require a current backup, a tested
  restore, a reviewed migration, a rollback or forward-recovery plan, and
  explicit owner approval.
- Explain that reverting application code does not restore deleted or
  transformed database records.
- Use clearly fictional, non-sensitive sample community data for local and
  preview environments.
- Do not delete current sample records unless the current task explicitly
  authorizes deletion and identifies the exact target environment.

## Authentication, authorization, and community safety

- Do not expose community create, edit, or delete operations publicly without
  server-side authorization and abuse protections.
- A typed display name is not a verified identity.
- Users must not be able to edit or delete another user's content.
- Administrative and moderator access must use least privilege and be
  auditable.
- Before enabling public posting, require server-side validation, rate limiting,
  spam prevention, reporting, moderation, abuse handling, privacy safeguards,
  and a user data-deletion process.
- Minimize public contact information and do not log community messages,
  contact details, credentials, or sensitive request bodies.
- Test authentication, session expiry, authorization failures, ownership,
  reporting, and moderation before calling the community board production-ready.

## Upload safeguards

Fiestamatic does not currently have a confirmed upload feature. Before adding
one, define allowed file types and sizes, verify actual content type, prevent
path traversal and executable uploads, use private-by-default storage where
appropriate, define scanning and deletion behavior, document retention, and
confirm zero-cost storage limits. Adding storage or uploads requires explicit
scope and must not silently introduce a paid service.

## Testing and real-user-journey verification

A successful build does not prove that the application works. Report these as
separate results:

- Type-check and build status.
- Automated test status.
- Visual review status.
- Mobile-layout status.
- Accessibility status.
- Real end-to-end user-journey status.

For relevant changes, verify the affected journeys, including:

- Browsing, searching, and filtering fiestas.
- Fiesta-date and countdown calculations.
- Map display, pins, directions, and barangay details.
- Loading, empty, offline, and failure states.
- Creating, editing, and deleting only owned community content.
- Rejecting unauthorized community changes.
- Reporting and moderation behavior.
- Database migration and restore behavior.

Use disposable test data. Never run tests against production unless the owner
explicitly approves a clearly safe production check.

## Local and cloud previews

- Complete a local preview with non-production services and sample data before
  asking the owner to approve a merge or production deployment, unless the
  change cannot affect runtime behavior and the pull request explains why a
  preview is unnecessary.
- Do not point a local preview at the production database.
- Cloud previews must be isolated from production data and production write
  credentials.
- Pull-request previews must not modify production.
- Check relevant mobile widths, keyboard navigation, accessible names, focus
  behavior, contrast, loading states, empty states, and failure states.
- Do not describe a preview as production-ready until its important real-user
  journeys pass end to end.

## Deployment and rollback

- Production deployment always requires explicit owner approval.
- Record the exact commit proposed for deployment.
- Before production deployment, require passing relevant checks, local and
  cloud preview verification, configuration review, and a documented rollback.
- Do not automatically deploy unreviewed branches to production.
- Keep the last known-good deployment available until the replacement is
  verified.
- Monitor free-plan limits and stop rather than enabling paid usage.
- After every implemented task, provide an exact rollback procedure covering
  code, deployment, database, storage, and configuration where applicable.
- Never imply that reverting a commit also reverses database, storage, secret,
  domain, or external-service changes.

## GitHub Releases

- Use `legacy-replit-baseline` only for a verified historical baseline.
- Reserve `v1.0.0` for the first stable, tested, Replit-independent production
  release.
- Codex may prepare draft release notes only when requested.
- Publishing a tag or GitHub Release requires explicit owner approval.
- Routine commits, pull-request previews, and ordinary deployments do not each
  require a GitHub Release.
- Release notes should state verification performed, configuration and database
  changes, known limitations, and exact rollback steps.

## Replit retirement gate

Keep the existing Replit application, deployment, database, and integration
available until all of the following are confirmed:

- GitHub is a sufficient practical code export.
- Required configuration and secret names are documented safely.
- Database backups and restoration have been tested.
- Local and cloud previews pass relevant checks.
- The replacement production deployment passes real-user journeys.
- Domain and DNS cutover are verified.
- Monitoring and rollback procedures are ready.
- The owner explicitly approves disconnecting Replit.
