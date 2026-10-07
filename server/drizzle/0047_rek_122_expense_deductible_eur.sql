UPDATE "expenses"
SET "deductible_amount" = round("eur_amount" * "business_use_percentage" / 100, 2)
WHERE "deductible_amount" <> round("eur_amount" * "business_use_percentage" / 100, 2);
