# REK-95/96 migration recovery notes

Before applying `0036_rek_95_96_freelancer_foundation.sql`, take a database backup and verify that every bank account referenced by a user belongs to that user. The migration clears invalid selected-account references and removes bank-account rows with no owner.

Rollback requires a maintenance window:

1. Export `audit_events`; they are append-only operational records and have no legacy equivalent.
2. Re-add the removed profile/default columns to `users` with their pre-migration types and defaults.
3. Backfill those columns by joining `business_profiles.user_id = users.id`.
4. Recreate the legacy selected-bank-account and invoice-default constraints.
5. Recreate and backfill the legacy expense event tables from the corresponding `audit_events` entity types if the old application version requires them.
6. Drop the new finance tables only after confirming the restored application can read every user and invoice snapshot.

Issued invoice sender, receiver, service, and bank snapshots are not rewritten by this migration and should not require rollback transformation.
