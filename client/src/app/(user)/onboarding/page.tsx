import { getBankingInformation, getUser } from '@/api';
import { auth } from '@/auth';
import MultiStepForm from '@/components/multi-step-form';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const userId = Number(session.user.id);

  const { data: user } = await getUser(userId);
  const { data: bankingInformation } = await getBankingInformation(userId);

  const currentBankingInformation = bankingInformation.find(
    (info) => info.id === user.selectedBankAccountId
  );

  return (
    <MultiStepForm
      existingUserData={user}
      existingBankingInformation={currentBankingInformation}
    />
  );
}
