import { unauthorized } from 'next/navigation';

import { getBankingInformationEntries, getUser } from '@/api';
import { auth } from '@/auth';
import MultiStepForm from '@/components/multi-step-form';
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

  const currentBankingInformation = bankingInformationResp.data.find(
    (info) => info.id === userResp.data.selectedBankAccountId
  );

  return (
    <MultiStepForm
      existingUserData={userResp.data}
      existingBankingInformation={currentBankingInformation}
    />
  );
}
