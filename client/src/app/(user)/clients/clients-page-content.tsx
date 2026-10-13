import { getClients } from '@/api/client';
import ClientSection from '@/components/client/client-section';
import type { ClientListPageQuery } from '@/lib/utils/client-navigation';
import { isResponseError } from '@/lib/utils/error';

type Props = { userId: number; query: ClientListPageQuery };

const ClientsPageContent = async ({ userId, query }: Props) => {
  const response = await getClients(userId, query);

  if (isResponseError(response)) throw new Error('Failed to fetch clients');

  return (
    <ClientSection
      userId={userId}
      clients={response.data.clients}
      total={response.data.pagination?.total ?? response.data.clients.length}
      query={query}
    />
  );
};

export default ClientsPageContent;
