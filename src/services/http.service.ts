import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import router from '@/router';

interface TypedAxiosInstance extends AxiosInstance {
  get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
  post<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  put<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  patch<T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T>;
  delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<T>;
}


const http: TypedAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || `/api/${import.meta.env.VITE_API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config) => {
    const newConfig = {
      withCredentials: true,
      ...config
    }
    return newConfig;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (router.currentRoute.value.name !== 'login') {
        console.warn('Unauthorized, redirect to login...');
        router.push({ name: 'login' });
      }
    }
    return Promise.reject(error.response?.data?.error || error.response?.data || error);
  }
);

export default http;
