import { getClients } from '@/api/client';
import ClientSection from '@/components/client/client-section';
import { isResponseError } from '@/lib/utils/error';

type Props = { userId: number };

const ClientsPageContent = async ({ userId }: Props) => {
  const response = await getClients(userId);

  if (isResponseError(response)) throw new Error('Failed to fetch clients');

  return <ClientSection userId={userId} clients={response.data.clients} />;
};

export default ClientsPageContent;
