import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import router from '@/router';

interface TypedAxiosInstance extends AxiosInstance {
  get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
}

const interceptors = {
  requestResolve: (config: InternalAxiosRequestConfig<any>) => {
    const newConfig = {
      withCredentials: true,
      ...config
    }
    return newConfig;
  },
  requestReject: (error: any) => Promise.reject(error),
  responseResolve: (response: AxiosResponse<any, any, {}>) => response.data,
  responseReject: (error: any) => {
    if (error.response?.status === 401) {
      if (router.currentRoute.value.name !== 'login') {
        console.warn('Unauthorized, redirect to login...');
        router.push({ name: 'login' });
      }
    }
    return Promise.reject(error.response?.data?.error || error);
  }
};

const apiV1: TypedAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_V1_BASE_URL || `/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiV1.interceptors.request.use(interceptors.requestResolve, interceptors.requestReject);
apiV1.interceptors.response.use(interceptors.responseResolve, interceptors.responseReject);


const apiV2: TypedAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_V2_BASE_URL || `/api/v2`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiV2.interceptors.request.use(interceptors.requestResolve, interceptors.requestReject);
apiV2.interceptors.response.use(interceptors.responseResolve, interceptors.responseReject);

export { apiV1, apiV2 };
