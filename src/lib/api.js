'use client';
import useSWR from 'swr';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'kj_token';

export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} };

export class ApiError extends Error {
  constructor(status, message, errors) { super(message); this.status = status; this.errors = errors; }
}

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(API_URL + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new ApiError(res.status, json.message || `Request failed (${res.status})`, json.errors);
  return json;
}
export const post = (path, body) => api(path, { method: 'POST', body: body ?? {} });
export const patch = (path, body) => api(path, { method: 'PATCH', body });
export const put = (path, body) => api(path, { method: 'PUT', body });
export const del = (path) => api(path, { method: 'DELETE' });

const fetcher = (path) => api(path);
/** SWR wrapper. Pass null to skip. Returns { data (the `data` field), extras (rest of envelope), error, isLoading, mutate } */
export function useApi(path, options = {}) {
  const swr = useSWR(path, fetcher, { revalidateOnFocus: false, keepPreviousData: true, ...options });
  const { data: envelope, ...rest } = swr;
  return { data: envelope?.data, extras: envelope, ...rest };
}
