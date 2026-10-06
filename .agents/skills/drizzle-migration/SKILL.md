---
name: drizzle-migration
description: "Change the InvoiceTrackr database schema with a hand-written Drizzle migration. Use for any table, column, index, constraint, or data backfill change."
---

# Drizzle Migration (InvoiceTrackr)

## How migrations work in this repo

- Drizzle schema: `server/src/database/schema.ts` (single file).
- Migrations: `server/drizzle/NNNN_rek_<issue>_<slug>.sql`, tracked by
  `server/drizzle/meta/_journal.json`.
- **Migrations are hand-written.** Drizzle snapshots stop at `0028`, so
  `pnpm run server generate` (drizzle-kit generate) would diff against a stale
  snapshot and emit wrong SQL. Don't run it, and don't add snapshot files.
- Production applies pending migrations automatically in the Dokku
  **predeploy** hook (`app.json` → `drizzle-kit migrate`), before the new
  container takes traffic. The old container keeps running against the
  migrated database for a short window, and a failed migration blocks the
  deploy.
- E2E builds its disposable DB with `drizzle-kit push` straight from
  `schema.ts`, not from the SQL files. So `schema.ts` and the SQL must
  describe the same end state, or E2E and production will diverge silently.

## Steps

1. **Read the neighbourhood.** Open the table in `schema.ts` and the last
   few migrations (`ls server/drizzle | tail`) to match naming and style.

2. **Edit `schema.ts`.** Use the existing conventions:
   - snake_case DB names via explicit column names:
     `clientId: integer('client_id')`.
   - Named constraints and indexes, e.g. `fk_invoices_client_id`,
     `invoices_user_client_idx`, `invoices_user_invoice_id_key`,
     `<table>_<rule>_check`.
   - User-owned rows carry `userId` and composite indexes/uniques start
     with `userId`.
   - Money is `numeric` with explicit precision/scale, never `real`/`double`.
   - Timestamps: match the table (most use `timestamp with time zone`
     stored as ISO strings).
   - Prefer `CHECK` constraints for state invariants (see
     `invoices_document_settings_check`).

3. **Write the SQL** in `server/drizzle/<next idx, 4 digits>_rek_<issue>_<slug>.sql`:
   - Quote identifiers (`"invoices"`, `"client_id"`).
   - Separate statements with `--> statement-breakpoint` lines (as in
     `0045_*`), so drizzle-kit runs them one at a time.
   - Make it work on **existing production data**:
     - New NOT NULL column with a constant default → one
       `ADD COLUMN … DEFAULT x NOT NULL` (no table rewrite on Postgres 11+).
       Values that must be computed per row → add nullable, backfill, then
       `SET NOT NULL`.
     - New FK on existing data → backfill or clean orphans first; choose
       `ON DELETE` deliberately (`set null` for optional links,
       `cascade` only for owned child rows).
     - New unique/check constraint → make sure existing rows satisfy it
       (fix or backfill in the same migration).
     - Backfills: deterministic, scoped by `user_id`, and skip ambiguous
       matches rather than guessing (see `0046_*`'s `HAVING COUNT(*) = 1`).
   - Prefer additive, backward-compatible changes; the previous app
     version runs briefly against the new schema. For renames/drops, ship
     the code that stops using the column first and drop it in a later
     migration — check with the user before any destructive step.
   - Never edit a migration that has already been merged/deployed; add a
     new one.

4. **Register it in `server/drizzle/meta/_journal.json`.** Append:

   ```json
   {
     "idx": 47,
     "version": "7",
     "when": 1790640000000,
     "tag": "0047_rek_123_short_slug",
     "breakpoints": true
   }
   ```

   `idx` = previous + 1, `tag` = filename without `.sql`, `when` = a ms
   timestamp **strictly greater** than the previous entry. drizzle-kit uses `when` to decide
   what's pending, so a smaller value can cause the migration to be skipped.

5. **Align the rest of the contract** in the same change: DB query helpers
   in `server/src/database/<domain>.ts`, shared Zod schemas/types,
   response schemas (fields not in the response schema are stripped),
   test factories in `server/src/test/factories/`, and any UI.

6. **Tests.** Update factories and fixtures for new required fields, and
   cover rules the constraint encodes via the **testing** skill.

## Running it locally

1. Confirm root `.env.local` points `DATABASE_URL` at the **development**
   database.
2. `pnpm run server migrate`

Never run `migrate:prod` or point drizzle-kit at production from a laptop.

## Handoff

Tell the user the migration filename, whether it backfills or adds
constraints that could fail on real data, and that it will run
automatically on the next Dokku deploy.
