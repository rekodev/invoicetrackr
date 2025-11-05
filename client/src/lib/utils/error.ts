import { ApiError, ApiResponse } from '@/api/api-instance';
import { AxiosResponse } from 'axios';

export function isResponseError<T>(
  response: ApiResponse<T>
): response is AxiosResponse<ApiError> {
  return (
    typeof response.data === 'object' &&
    response.data &&
    'errors' in response.data
  );
}
