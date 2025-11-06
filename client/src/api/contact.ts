import { PostContactMessageResp } from '@/lib/types/response';

import api from './api-instance';

export const postContactMessage = async ({
  email,
  message
}: {
  email: string;
  message: string;
}) =>
  await api.post<PostContactMessageResp>('/api/contact', {
    email,
    message
  });
