import { ChangeEvent, useMemo, useState } from 'react';

import { ClientModel } from '@/lib/types/models/client';
import { InvoicePartyBusinessType } from '@/lib/types/models/invoice';

const INVOICE_PARTY_BUSINESS_TYPES: Array<InvoicePartyBusinessType> = [
  'individual',
  'business',
];

const useClientSearchAndFilter = (clients: Array<ClientModel> | undefined) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilters, setTypeFilters] = useState<Set<InvoicePartyBusinessType>>(
    new Set(INVOICE_PARTY_BUSINESS_TYPES)
  );

  const hasSearchFilter = Boolean(searchTerm);

  const filteredItems = useMemo(() => {
    if (!clients) return [];

    let filteredClients = [...clients];

    if (hasSearchFilter) {
      filteredClients = filteredClients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filteredClients = filteredClients.filter((client) =>
      Array.from(typeFilters).includes(client.businessType)
    );

    return filteredClients;
  }, [clients, hasSearchFilter, searchTerm, typeFilters]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return {
    page,
    setPage,
    searchTerm,
    typeFilters,
    setTypeFilters,
    filteredItems,
    handleClearSearch,
    handleSearch,
  };
};

export default useClientSearchAndFilter;
