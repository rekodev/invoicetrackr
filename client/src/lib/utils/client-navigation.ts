import type { ClientListQuery } from '@invoicetrackr/types';

import { CLIENT_BUSINESS_TYPES, CLIENT_PAGE_SIZE } from '@/lib/constants/client';
import { CLIENTS_PAGE } from '@/lib/constants/pages';

type SearchValue = string | string[] | undefined;

export type ClientListPageQuery = ClientListQuery & {
  page: number;
  pageSize: number;
};

export const parseClientListQuery = (
  params: Record<string, SearchValue>
): ClientListPageQuery => {
  const page = Number(typeof params.page === 'string' ? params.page : undefined);
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : '';
  const businessType = CLIENT_BUSINESS_TYPES.find(
    (type) => type === params.type
  );

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: CLIENT_PAGE_SIZE,
    ...(q ? { q } : {}),
    ...(businessType ? { businessType } : {})
  };
};

export const clientListQueryHref = ({
  page,
  q,
  businessType
}: ClientListPageQuery) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (businessType) params.set('type', businessType);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return `${CLIENTS_PAGE}${query ? `?${query}` : ''}`;
};
