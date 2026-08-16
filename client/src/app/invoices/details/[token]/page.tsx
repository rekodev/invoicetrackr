import { getTranslations } from 'next-intl/server';

import { getRecipientDetailsRequest } from '@/api/invoice';
import RecipientDetailsForm from '@/components/invoice/recipient-details-form';
import { isResponseError } from '@/lib/utils/error';

type Props = { params: Promise<{ token: string }> };
export default async function RecipientDetailsPage({ params }: Props) {
  const { token } = await params;
  const response = await getRecipientDetailsRequest(token);
  if (isResponseError(response)) {
    const t = await getTranslations('recipient_details');

    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto max-w-xl rounded-xl border p-6 sm:p-8">
          <h1 className="text-xl font-semibold">{t('invalid_title')}</h1>
          <p className="text-muted mt-2 text-sm">
            {t('invalid_description')}
          </p>
        </div>
      </main>
    );
  }

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
