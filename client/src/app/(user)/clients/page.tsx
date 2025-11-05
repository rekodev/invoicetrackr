import { getClients } from '@/api';
import { auth } from '@/auth';
import ClientSection from '@/components/client/client-section';
import { isResponseError } from '@/lib/utils/error';

const ClientsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const response = await getClients(Number(session.user.id));

  if (isResponseError(response)) throw new Error('Failed to fetch clients');

  return (
    <ClientSection
      userId={Number(session.user.id)}
      clients={response.data.clients}
    />
  );
};

export default ClientsPage;
