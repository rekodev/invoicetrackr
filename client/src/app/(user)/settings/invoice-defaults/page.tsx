import { unauthorized } from 'next/navigation';

import { getUser } from '@/api/user';
import { auth } from '@/auth';
import InvoiceDefaultsForm from '@/components/profile/invoice-defaults-form';
import { isResponseError } from '@/lib/utils/error';

const InvoiceDefaultsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) unauthorized();

  const response = await getUser(Number(session.user.id));
  if (isResponseError(response)) unauthorized();

  return (
    <InvoiceDefaultsForm
      key={`${session.user.language}-${session.user.isVatPayer}`}
      user={response.data.user}
    />
  );
};

export default InvoiceDefaultsPage;
