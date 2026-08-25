import type {
  ClientBody,
  InvoicePartyBusinessType
} from '@invoicetrackr/types';
import { ChangeEvent, useMemo, useState } from 'react';

const INVOICE_PARTY_BUSINESS_TYPES: Array<InvoicePartyBusinessType> = [
  'individual',
  'business'
];

const useClientSearchAndFilter = (clients: Array<ClientBody> | undefined) => {
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
      const normalizedSearchTerm = searchTerm.trim().toLowerCase();

      filteredClients = filteredClients.filter((client) => {
        const searchableValues = [
          client.name,
          client.businessNumber,
          client.email || ''
        ];

        return searchableValues.some((value) =>
          value.toLowerCase().includes(normalizedSearchTerm)
        );
      });
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
    setPage(1);
  };

  return {
    page,
    setPage,
    searchTerm,
    typeFilters,
    setTypeFilters,
    filteredItems,
    handleClearSearch,
    handleSearch
  };
};

export default useClientSearchAndFilter;
