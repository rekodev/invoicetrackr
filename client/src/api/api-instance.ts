import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method
} from 'axios';

import { getGeneralErrorMessageAction } from '@/lib/actions/general-error';
import { getRequestHeadersAction } from '@/lib/actions';

export type ApiError = {
  code: string;
  errors: Array<{ key: string; value: string }>;
  message: string;
};

export type ApiResponse<T> = AxiosResponse<T> | AxiosResponse<ApiError>;

class ApiInstance {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL:
        typeof window !== 'undefined'
          ? undefined
          : `http://localhost:${process.env.SERVER_PORT}`,
      withCredentials: true
    });

    this.httpClient.interceptors.request.use(async (config) => {
      const requestHeaders = await getRequestHeadersAction();
      Object.assign(config.headers, requestHeaders);

      return config;
    });
  }

  async request<T>(
    method: Method,
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {}
  ) {
    try {
      if (data instanceof FormData) {
        config.headers = {
          ...config.headers,
          'Content-Type': undefined
        };
      }

      const response = await this.httpClient.request<T>({
        method,
        url,
        data: method === 'get' ? undefined : data,
        ...config,
        params: method === 'get' ? data : config.params
      });

      return response;
    } catch (error: any) {
      const generalErrorMessage = await getGeneralErrorMessageAction();

      const errorResp: AxiosResponse<ApiError> = {
        ...error,
        data: {
          errors: error?.response?.data?.errors || [],
          message: error?.response?.data?.message || generalErrorMessage,
          code: error?.response?.data?.code || 'unknown_error'
        }
      };

      return errorResp;
    }
  }

  async get<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>('get', url, {}, config);
  }

  async post<T>(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.request<T>('post', url, data, config);
  }

  async put<T>(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.request<T>('put', url, data, config);
  }

  async delete<T>(url: string, data = {}, config: AxiosRequestConfig = {}) {
    return this.request<T>('delete', url, data, config);
  }
}

const api = new ApiInstance();

export default api;
