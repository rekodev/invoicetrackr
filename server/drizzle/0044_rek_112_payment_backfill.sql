DO $$
DECLARE
  invoice_row RECORD;
  new_payment_id INTEGER;
BEGIN
  FOR invoice_row IN
    SELECT id, user_id, total_amount, currency, paid_at, date
    FROM invoices
    WHERE lifecycle_status = 'issued' AND status = 'paid'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM payment_allocations
      WHERE user_id = invoice_row.user_id AND invoice_id = invoice_row.id
    ) THEN
      INSERT INTO payments (user_id, payment_date, amount, currency, eur_amount, method)
      VALUES (
        invoice_row.user_id,
        COALESCE(invoice_row.paid_at::date, invoice_row.date),
        invoice_row.total_amount,
        COALESCE(invoice_row.currency, 'eur'),
        invoice_row.total_amount,
        'bank_transfer'
      ) RETURNING id INTO new_payment_id;

      INSERT INTO payment_allocations (user_id, payment_id, invoice_id, amount)
      VALUES (invoice_row.user_id, new_payment_id, invoice_row.id, invoice_row.total_amount);
    END IF;
  END LOOP;
END $$;
