import type {
  CompanyLookupRequest,
  CompanyLookupResult
} from '@invoicetrackr/types';

export interface CompanyLookupProvider {
  search(query: CompanyLookupRequest['query']): Promise<CompanyLookupResult[]>;
}

export class CompanyLookupProviderError extends Error {
  constructor() {
    super('Company lookup provider failed');
    this.name = 'CompanyLookupProviderError';
  }
}
