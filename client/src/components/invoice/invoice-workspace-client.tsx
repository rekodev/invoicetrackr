'use client';

import type { InvoiceWorkspaceResponse } from '@invoicetrackr/types';
import dynamic from 'next/dynamic';

const InvoiceWorkspace = dynamic(() => import('./invoice-workspace'), {
  ssr: false
});

type Props = {
  userId: number;
  data: InvoiceWorkspaceResponse;
  isEmailVerified: boolean;
  preferredLanguage: string;
};

export default function InvoiceWorkspaceClient(props: Props) {
  return <InvoiceWorkspace {...props} />;
}
