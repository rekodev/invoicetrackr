import type { DashboardSummaryResponse } from '@invoicetrackr/types';

import api from './api-instance';

export const getDashboardSummary = async (userId: number, year?: number) =>
  await api.get<DashboardSummaryResponse>(`/api/${userId}/dashboard/summary`, {
    params: year ? { year } : undefined
  });
