/**
 * Typed fetch wrapper for the IslamQA backend. Thin on purpose: TanStack
 * Query (see lib/query-client.ts) owns caching/retries/refetching, this
 * just knows how to make one authenticated request and surface backend
 * errors in a useful shape.
 */
import { File, UploadType } from 'expo-file-system';

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
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Send as application/x-www-form-urlencoded instead of JSON (needed for
   * the OAuth2-password-flow /auth/login endpoint specifically). */
  form?: Record<string, string>;
  auth?: boolean;
}

// The access token is short-lived (30 min -- see settings.ACCESS_TOKEN_EXPIRE_MINUTES),
// so any session longer than that needs a silent refresh or every screen
// just shows "couldn't load" while still looking logged in. Shared across
// concurrent 401s so a burst of failing requests triggers one refresh
// call, not one per request.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    // /auth/refresh takes refresh_token as a query param, not a JSON body
    // (see app/api/v1/endpoints/auth.py -- it's a bare `str` parameter).
    const response = await fetch(
      `${API_BASE_URL}/api/v1/auth/refresh?refresh_token=${encodeURIComponent(refreshToken)}`,
      { method: 'POST' }
    );
    if (!response.ok) {
      await clearTokens();
      return false;
    }
    const tokens = (await response.json()) as { access_token: string; refresh_token: string };
    await setTokens(tokens.access_token, tokens.refresh_token);
    return true;
  } catch {
    return false;
  }
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

  let response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (response.status === 401 && auth) {
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    if (await refreshPromise) {
      const token = useAuthStore.getState().accessToken;
      if (token) headers.Authorization = `Bearer ${token}`;
      response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: requestBody });
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response));
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

interface UploadOptions {
  fieldName: string;
  mimeType: string;
  /** Additional multipart form fields sent alongside the file. */
  fields?: Record<string, string>;
}

/** For multipart file uploads (audio recitation checks, Phase 2). Goes
 * through expo-file-system's native multipart upload rather than
 * fetch+FormData: Expo's own global `fetch` polyfill (SDK 57's
 * `expo/winter/fetch`) only accepts a real Blob/File-like value with a
 * `.bytes()` method for FormData file parts -- it silently can't handle
 * React Native's classic `{uri, name, type}` FormData shape at all (see
 * convertFormData.ts: "`uri` is not supported for React Native's
 * FormData"), which is what threw "Unsupported FormDataPart
 * implementation". `File#upload` bypasses fetch entirely. */
export async function apiUpload<T>(
  path: string,
  fileUri: string,
  { fieldName, mimeType, fields }: UploadOptions
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = useAuthStore.getState().accessToken;
  if (token) headers.Authorization = `Bearer ${token}`;

  const file = new File(fileUri);
  const result = await file.upload(`${API_BASE_URL}${path}`, {
    uploadType: UploadType.MULTIPART,
    fieldName,
    mimeType,
    parameters: fields,
    headers,
  });

  if (result.status < 200 || result.status >= 300) {
    throw new ApiError(result.status, parseUploadErrorDetail(result.body));
  }
  return JSON.parse(result.body) as T;
}

function parseUploadErrorDetail(body: string): string {
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.detail === 'string') return parsed.detail;
    if (Array.isArray(parsed.detail)) {
      return parsed.detail.map((e: { msg?: string }) => e.msg).join(', ');
    }
  } catch {
    // Not JSON -- fall through.
  }
  return body;
}
