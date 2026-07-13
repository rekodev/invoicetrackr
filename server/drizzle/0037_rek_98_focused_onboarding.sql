UPDATE "business_profiles"
SET "onboarding_completed_at" = NULL,
    "updated_at" = CURRENT_TIMESTAMP
WHERE "onboarding_completed_at" IS NOT NULL
  AND (
    BTRIM("legal_name") = ''
    OR BTRIM("activity_certificate_number") = ''
    OR BTRIM("address") = ''
    OR BTRIM("invoice_email") = ''
  );
