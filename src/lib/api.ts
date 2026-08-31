// Fetch-based API client (house style: see MWC-Membership-Expo src/api.ts) —
// replaced axios 2026-08-31 per owner request. The surface stays
// axios-compatible (get/post/put/delete returning { data }, errors carrying
// .response.data) so the ported thunks did not change.

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type RequestConfig = {
  headers?: Record<string, string>;
  timeout?: number;
  timeoutErrorMessage?: string;
};

export type ApiResponse<T = any> = {
  data: T;
  status: number;
};

export class ApiError extends Error {
  response?: { data: any; status: number; message?: string };

  constructor(message: string, response?: ApiError['response']) {
    super(message);
    this.name = 'ApiError';
    this.response = response;
  }
}

export const authHeader = (token: string): RequestConfig => ({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = config?.timeout
    ? setTimeout(() => controller.abort(), config.timeout)
    : undefined;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err: any) {
    // No response at all — connection drop, DNS failure, or our timeout.
    // Same semantics as an axios "Network Error" (error.response undefined).
    const message =
      err?.name === 'AbortError'
        ? (config?.timeoutErrorMessage ?? 'Network Error')
        : 'Network Error';
    throw new ApiError(message);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.message ?? `Request failed (${res.status})`, {
      data,
      status: res.status,
      message: data?.message,
    });
  }

  return { data: data as T, status: res.status };
}

export const api = {
  get: <T = any>(path: string, config?: RequestConfig) =>
    request<T>('GET', path, undefined, config),
  post: <T = any>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>('POST', path, body, config),
  put: <T = any>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>('PUT', path, body, config),
  delete: <T = any>(path: string, config?: RequestConfig) =>
    request<T>('DELETE', path, undefined, config),
};
