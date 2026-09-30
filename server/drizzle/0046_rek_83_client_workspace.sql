ALTER TABLE "invoices" ADD COLUMN "client_id" integer;
ALTER TABLE "invoices" ADD CONSTRAINT "fk_invoices_client_id" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE set null;
CREATE INDEX "invoices_user_client_idx" ON "invoices" ("user_id", "client_id");

WITH unique_matches AS (
  SELECT invoices.id AS invoice_id, MIN(clients.id) AS client_id
  FROM invoices
  INNER JOIN invoice_receivers ON invoice_receivers.id = invoices.receiver_id
  INNER JOIN clients ON clients.user_id = invoices.user_id
    AND clients.business_type = invoice_receivers.business_type
    AND regexp_replace(upper(trim(clients.business_number)), '[[:space:]]+', '', 'g') =
      regexp_replace(upper(trim(invoice_receivers.business_number)), '[[:space:]]+', '', 'g')
  WHERE trim(invoice_receivers.business_number) <> ''
  GROUP BY invoices.id
  HAVING COUNT(*) = 1
)
UPDATE invoices SET client_id = unique_matches.client_id
FROM unique_matches WHERE invoices.id = unique_matches.invoice_id;
