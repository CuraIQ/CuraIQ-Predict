import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * PredictIQ API client with interceptors for
 * request correlation, auth headers, and global error normalization.
 */

export interface ApiError {
  code: string;
  message: string;
  requestId?: string | null;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId?: string | null;

  constructor(status: number, code: string, message: string, requestId?: string | null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject correlation ID ────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set('X-Request-ID', crypto.randomUUID());
  return config;
});

// ── Response interceptor: unwrap errors into ApiClientError ───────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: ApiError }>) => {
    const status = error.response?.status ?? 500;
    const body = error.response?.data?.error;
    throw new ApiClientError(
      status,
      body?.code ?? 'NETWORK_ERROR',
      body?.message ?? error.message ?? 'An unexpected error occurred',
      error.response?.headers?.['x-request-id'] ?? null,
    );
  },
);

export default apiClient;
