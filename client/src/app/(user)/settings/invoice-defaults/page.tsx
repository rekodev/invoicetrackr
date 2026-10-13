import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getUser } from '@/api/user';
import { auth } from '@/auth';
import InvoiceDefaultsForm from '@/components/profile/invoice-defaults-form';
import PageHeader from '@/components/ui/page-header';
import { isResponseError } from '@/lib/utils/error';

const InvoiceDefaultsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) unauthorized();

  const response = await getUser(Number(session.user.id));
  if (isResponseError(response)) unauthorized();

  const t = await getTranslations('profile.account_settings.invoice_defaults');

  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={t('title')} />
      <InvoiceDefaultsForm
        key={`${session.user.language}-${session.user.isVatPayer}`}
        user={response.data.user}
      />
    </section>
  );
};

export default InvoiceDefaultsPage;
