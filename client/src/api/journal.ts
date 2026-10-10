import type {
  JournalExportQuery,
  JournalQuery,
  JournalResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const getJournal = async (userId: number, query: JournalQuery) =>
  await api.get<JournalResponse>(`/api/${userId}/journal`, { params: query });

export const getJournalExport = async (
  userId: number,
  query: JournalExportQuery
) =>
  await api.get<ArrayBuffer>(`/api/${userId}/journal/export`, {
    params: query,
    responseType: 'arraybuffer'
  });
