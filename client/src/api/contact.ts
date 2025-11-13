import { PostContactResponse } from '@invoicetrackr/types';

import api from './api-instance';

export const postContactMessage = async ({
  email,
  message
}: {
  email: string;
  message: string;
}) =>
  await api.post<PostContactResponse>('/api/contact', {
    email,
    message
  });
