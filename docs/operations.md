# Operations

How production InvoiceTrackr is watched, backed up, restored, and recovered.
Env vars and the deploy pipeline are covered by the `env-deploy` skill
(`.agents/skills/env-deploy/SKILL.md`).

## Production at a glance

| Piece | Where |
| --- | --- |
| App (Next.js + Fastify in one container) | Dokku app `invoice-app` on the VPS |
| Database | Neon Postgres (`DATABASE_URL`, Neon driver) |
| Uploaded files (logos, signatures, expense documents) | Cloudinary |
| Transactional email and inbound support mail | Resend |
| Product analytics and error tracking | PostHog (EU) |

## Health and monitoring

- **Health check**: `GET /api/health` returns `200 {"status":"ok"}` when
  Next.js, Fastify, and the database all answer, and `503` when the database
  does not. Dokku runs it as a startup check (`app.json` → `healthchecks`), so
  a deploy that cannot reach the database never replaces the running
  container.
- **Process supervision**: `prod.sh` exits as soon as either the Next.js or
  the Fastify process dies, so Docker restarts the container instead of
  leaving half the app running.
- **Errors**: PostHog → Error tracking.
  - Server: every 5xx response, unhandled promise rejection, and uncaught
    exception, under the distinct id `invoicetrackr-server`, tagged with the
    route pattern (never the raw URL), method, and status code.
  - Browser: render errors caught by the app error page, only for visitors
    who accepted analytics.
  - Set up an alert in PostHog for new server issues so failures reach you
    without opening the dashboard.
- **Logs**: `dokku logs invoice-app -t` (add `-n 500` for history).
- **Email delivery**: Resend calls `POST /api/webhook/resend` (signed with
  `RESEND_WEBHOOK_SECRET`) for `email.delivered`, `email.bounced`,
  `email.failed`, and `email.received`. Delivery outcomes update the invoice's
  delivery history; received mail is forwarded to `RESEND_FORWARD_TO_EMAIL`.
  If statuses stop moving past "Accepted for sending", check the webhook's
  attempt log in Resend: `401` means the secret on Dokku does not match.

## Backups

Two independent layers:

1. **Neon point-in-time restore.** Neon keeps a history window you can
   restore to any second of. Check the window under Project settings →
   Storage → History retention; the free plan keeps very little, so confirm
   it covers at least 7 days before launch.
2. **Nightly `pg_dump` on the Dokku host.** A logical dump you control,
   independent of Neon. Kept on the same VPS, so it does not survive losing
   the host; copy it off-site (another machine or object storage) when that
   becomes a concern.

Database backups do not include Cloudinary files. Cloudinary keeps its own
copies; enable Cloudinary backup in its settings if you need restorable file
history.

### Set up the nightly dump (once, as root on the VPS)

Use the same Postgres major version as Neon (the server logs `SELECT
version()` on start, or check the Neon console). The examples assume 17.

```sh
mkdir -p /etc/invoicetrackr /var/backups/invoicetrackr
chmod 700 /etc/invoicetrackr /var/backups/invoicetrackr

# Production connection string, readable by root only
echo "DATABASE_URL=$(dokku config:get invoice-app DATABASE_URL)" \
  > /etc/invoicetrackr/backup.env
chmod 600 /etc/invoicetrackr/backup.env

cat > /usr/local/bin/invoicetrackr-backup <<'SH'
#!/bin/sh
set -eu
target="/var/backups/invoicetrackr/invoicetrackr-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker run --rm --env-file /etc/invoicetrackr/backup.env \
  -v /var/backups/invoicetrackr:/backups postgres:17 \
  sh -c 'pg_dump --format=custom --no-owner --dbname="$DATABASE_URL" \
    --file="/backups/$(basename "$0")"' "$target"
find /var/backups/invoicetrackr -name '*.dump' -mtime +14 -delete
SH
chmod 700 /usr/local/bin/invoicetrackr-backup

echo '15 2 * * * root /usr/local/bin/invoicetrackr-backup >> /var/log/invoicetrackr-backup.log 2>&1' \
  > /etc/cron.d/invoicetrackr-backup
```

Run `/usr/local/bin/invoicetrackr-backup` once by hand and confirm a
non-empty `.dump` appears. Dumps older than 14 days are deleted. If you ever
rotate the database password, regenerate `/etc/invoicetrackr/backup.env`.

## Restore

Always restore into a **new** Neon branch or database first, check it, then
switch the app over. Never restore over the live database blind.

### From Neon history (preferred for mistakes in the last few days)

1. Neon console → Branches → `main` → Restore, or create a branch from a
   point in time just before the incident.
2. Connect to the new branch and spot-check the data (latest invoices,
   payments, users).
3. Either restore `main` in place from that point (Neon keeps a backup branch
   of the pre-restore state), or point the app at the new branch:
   `dokku config:set invoice-app DATABASE_URL=<new branch URL>`.

### From a nightly dump

1. Create an empty database (a new Neon branch reset to empty, or a new
   project).
2. On the VPS:

   ```sh
   docker run --rm -v /var/backups/invoicetrackr:/backups postgres:17 \
     pg_restore --no-owner --clean --if-exists \
     --dbname='<target DATABASE_URL>' /backups/<file>.dump
   ```

3. Spot-check the data, then `dokku config:set invoice-app
   DATABASE_URL=<target URL>` (this restarts the app).
4. Regenerate `/etc/invoicetrackr/backup.env` if the URL changed.

### Test the restore

Before launch and then every few months: restore the latest dump into a
throwaway Neon branch, check row counts of `users`, `invoices`, and
`payments` against production, and delete the branch.

## Incident playbook

1. **Is it up?** `curl -i https://<domain>/api/health`.
2. **What broke?** `dokku logs invoice-app -n 500` and PostHog → Error
   tracking. `dokku ps:report invoice-app` shows restarts.
3. **Bad deploy?** Roll back to the previous image. Every deploy loads
   `invoicetrackr:<commit sha>` onto the host:

   ```sh
   docker images invoicetrackr --format '{{.Tag}} {{.CreatedAt}}'
   dokku git:from-image invoice-app invoicetrackr:<previous sha>
   ```

   Migrations are not rolled back automatically. If the bad deploy ran a
   migration the old code cannot handle, restore the database (above) or
   ship a forward fix.
4. **Database down?** Check the Neon status page and console. The health
   check returns `503` until it answers again.
5. **Email not arriving?** Resend dashboard → Emails for the message, and
   the webhook attempt log for delivery events.

## Secrets

All production secrets live in Dokku config (`dokku config:show
invoice-app`), plus the GitHub Actions secrets used to build and deploy.

| Secret | Rotate by |
| --- | --- |
| `AUTH_SECRET` | `dokku config:set`; signs everyone out |
| `INTERNAL_API_SECRET` | `dokku config:set` with a new random value; Next.js and Fastify read the same var |
| `DATABASE_URL` | Reset the role password in Neon, then `dokku config:set` and regenerate `backup.env` |
| `RESEND_EMAIL_API_KEY` | New key in Resend, `dokku config:set`, then revoke the old key |
| `RESEND_WEBHOOK_SECRET` | Rotate the webhook signing secret in Resend, then `dokku config:set` right away |
| `CLOUDINARY_API_SECRET` | New key pair in Cloudinary, `dokku config:set`, then disable the old pair |
| `AUTH_GOOGLE_SECRET` | New client secret in Google Cloud console, `dokku config:set` |
| `POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_KEY` | Project API keys are write-only; the public one is a GitHub build secret |

`dokku config:set` restarts the app. Never paste secrets into issues, PRs,
or logs.
