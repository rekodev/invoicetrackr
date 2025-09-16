import { AxiosResponse } from 'axios';

export function isResponseError<T>(response: AxiosResponse<T>) {
  return (
    typeof response.data === 'object' &&
    response.data &&
    'errors' in response.data
  );
}
