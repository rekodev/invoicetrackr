import { notFound } from 'next/navigation';

import { getRecipientDetailsRequest } from '@/api/invoice';
import RecipientDetailsForm from '@/components/invoice/recipient-details-form';
import { isResponseError } from '@/lib/utils/error';

type Props = { params: Promise<{ token: string }> };
export default async function RecipientDetailsPage({ params }: Props) {
  const { token } = await params;
  const response = await getRecipientDetailsRequest(token);
  if (isResponseError(response)) notFound();
  return (
    <main className="min-h-screen px-4 py-12">
      <RecipientDetailsForm
        token={token}
        {...response.data}
        initialValues={response.data.receiver}
      />
    </main>
  );
}
