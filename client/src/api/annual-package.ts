import type { AnnualPackageResponse } from '@invoicetrackr/types';

import api from './api-instance';

export const getAnnualPackage = async (userId: number, year: number) =>
  await api.get<AnnualPackageResponse>(`/api/${userId}/annual-package`, {
    params: { year }
  });

export const getAnnualPackageExport = async (userId: number, year: number) =>
  await api.get<ArrayBuffer>(`/api/${userId}/annual-package/export`, {
    params: { year },
    responseType: 'arraybuffer'
  });
