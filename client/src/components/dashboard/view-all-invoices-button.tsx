'use client';

import { Button, Link } from '@heroui/react';

import { INVOICES_PAGE } from '@/lib/constants/pages';

export default function ViewAllInvoicesButton() {
  return (
    <Button as={Link} variant="bordered" href={INVOICES_PAGE} size="sm">
      View All
    </Button>
  );
}
