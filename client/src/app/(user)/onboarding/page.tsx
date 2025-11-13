import { unauthorized } from 'next/navigation';

import MultiStepForm from '@/components/multi-step-form';
import { auth } from '@/auth';
import { getBankingInformationEntries } from '@/api/banking-information';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);

  const userResp = await getUser(userId);
  const bankingInformationResp = await getBankingInformationEntries(userId);

  if (isResponseError(userResp)) unauthorized();
  if (isResponseError(bankingInformationResp))
    throw new Error('Failed to fetch data');

  const currentBankingInformation =
    bankingInformationResp.data.bankAccounts.find(
      (info) => info.id === userResp.data.user.selectedBankAccountId
    );

  return (
    <MultiStepForm
      existingUserData={userResp.data.user}
      existingBankingInformation={currentBankingInformation}
    />
  );
}
