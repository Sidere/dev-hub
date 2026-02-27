import { getStoredToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token.accessToken}`;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
    throw new Error(error.message ?? `Erro ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  post: <T>(endpoint: string, body: unknown, auth = false) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), auth }),

  get: <T>(endpoint: string, auth = false) =>
    request<T>(endpoint, { method: 'GET', auth }),
};