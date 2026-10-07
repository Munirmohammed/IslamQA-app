/**
 * Typed fetch wrapper for the IslamQA backend. Thin on purpose: TanStack
 * Query (see lib/query-client.ts) owns caching/retries/refetching, this
 * just knows how to make one authenticated request and surface backend
 * errors in a useful shape.
 */
import { useAuthStore } from '@/stores/auth-store';

import { API_BASE_URL } from '@/config/env';

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = 'ApiError';
  }
}

async function parseErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    // FastAPI's HTTPException body shape: {"detail": "..."} or validation
    // errors as {"detail": [{"msg": ...}, ...]}.
    if (typeof body.detail === 'string') return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((e: { msg?: string }) => e.msg).join(', ');
    }
    return response.statusText;
  } catch {
    return response.statusText;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Send as application/x-www-form-urlencoded instead of JSON (needed for
   * the OAuth2-password-flow /auth/login endpoint specifically). */
  form?: Record<string, string>;
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, form, auth = true } = options;

  const headers: Record<string, string> = {};
  let requestBody: BodyInit | undefined;

  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    requestBody = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

/** For multipart uploads (audio recitation checks, Phase 2) -- FormData
 * sets its own Content-Type boundary, so it must bypass the JSON/form
 * branches above entirely. */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = useAuthStore.getState().accessToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response));
  }
  return response.json() as Promise<T>;
}
