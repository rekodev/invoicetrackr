import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from 'axios';

export type ApiResponse<T = any> = {
  data: T;
  errors?: Record<string, string>;
  message?: string;
};

export type ApiError = {
  error: AxiosError;
  errors: Array<Record<string, any>>;
  message: string;
};

class ApiInstance {
  private httpClient: AxiosInstance;

  constructor(baseURL: string) {
    this.httpClient = axios.create({
      baseURL,
    });

    // this.setupInterceptors();
  }

  //   private setupInterceptors() {
  //     this.httpClient.interceptors.response.use(
  //       (response) => response,
  //       (error) => Promise.reject(error)
  //     );

  //     this.httpClient.interceptors.request.use((config) => {
  //       const excludes = ['/api/login', '/api/signup'];
  //       if (!excludes.includes(config.url!)) {
  //         const token = getAuthToken();
  //         if (token) {
  //           config.headers!['Authorization'] = `Bearer ${token}`;
  //         }
  //       }

  //       return config;
  //     });
  //   }

  async request<T = any>(
    method: Method,
    url: string,
    data: any = {},
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<ApiResponse<T>> | AxiosResponse<ApiError>> {
    try {
      if (data instanceof FormData) {
        config.headers = { ...config.headers, 'Content-Type': undefined };
      }

      const response = await this.httpClient.request<ApiResponse<T>>({
        method,
        url,
        data: method === 'get' ? undefined : data,
        ...config,
        params: method === 'get' ? data : config.params,
      });

      return response;
    } catch (error: any) {
      if (error.response) {
        return error.response;
      }

      return {
        ...error,
        data: {
          error,
          errors: [],
          message: 'Service unavailable. Try again later',
        },
      };
    }
  }

  async get(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse> {
    return this.request('get', url, {}, config);
  }

  async post(
    url: string,
    data = {},
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse> {
    return this.request('post', url, data, config);
  }

  async put(
    url: string,
    data = {},
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse> {
    return this.request('put', url, data, config);
  }

  async delete(
    url: string,
    data = {},
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse> {
    return this.request('delete', url, data, config);
  }
}

const api = new ApiInstance(
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000'
);

export default api;
