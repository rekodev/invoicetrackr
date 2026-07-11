import { AxiosResponse } from 'axios';

import { ApiError, ApiResponse } from '@/api/api-instance';

export function isResponseError<T>(
  response: ApiResponse<T>
): response is AxiosResponse<ApiError> {
  return (
    typeof response.data === 'object' &&
    response.data &&
    'errors' in response.data
  );
}
