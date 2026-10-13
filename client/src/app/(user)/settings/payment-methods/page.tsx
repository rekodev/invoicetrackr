import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getBankingInformationEntries } from '@/api/banking-information';
import { auth } from '@/auth';
import AddBankAccountButton from '@/components/profile/add-bank-account-button';
import BankingInformationForm from '@/components/profile/banking-information-form';
import PageHeader from '@/components/ui/page-header';
import { isResponseError } from '@/lib/utils/error';

export default async function PaymentMethodsPage() {
  const session = await auth();
  if (!session?.user?.id) unauthorized();
  const userId = Number(session.user.id);
  const banks = await getBankingInformationEntries(userId);
  if (isResponseError(banks))
    throw new Error('Failed to load payment methods');
  const t = await getTranslations('profile.banking_information');
  return (
    <section className="flex flex-col gap-section">
      <PageHeader title={t('title')}>
        <AddBankAccountButton
          userId={userId}
          selectedBankAccountId={session.user.selectedBankAccountId}
        />
      </PageHeader>
      <BankingInformationForm
        user={session.user}
        bankAccounts={banks.data.bankAccounts}
      />
    </section>
  );
}
