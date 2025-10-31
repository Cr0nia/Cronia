import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants/config';

export type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  responseType?: 'json' | 'text' | 'blob';
  skipAuth?: boolean;
};

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function apiRequest<T = unknown>(
  path: string,
  { method = 'GET', headers = {}, body, query, signal, responseType = 'json', skipAuth }: ApiRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const url = buildUrl(path, query);

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  let payload: BodyInit | undefined;

  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined && body !== null) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] ?? 'application/json';
    payload = JSON.stringify(body);
  }

  if (!skipAuth && authToken && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      signal: mergeSignals(signal, controller.signal),
    });

    if (!response.ok) {
      throw await buildApiError(response);
    }

    switch (responseType) {
      case 'text':
        return (await response.text()) as T;
      case 'blob':
        return (await response.blob()) as T;
      case 'json':
      default:
        if (response.status === 204) return undefined as T;
        return (await response.json()) as T;
    }
  } finally {
    clearTimeout(timeout);
  }
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined | null>) {
  const normalizedPath = path.startsWith('http') ? path : `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
  if (!query) return normalizedPath;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const queryString = params.toString();
  return queryString ? `${normalizedPath}?${queryString}` : normalizedPath;
}

async function buildApiError(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  let message = response.statusText || 'Request failed';
  let details: unknown;

  try {
    if (contentType.includes('application/json')) {
      const json = await response.json();
      message =
        (json?.message && Array.isArray(json.message)
          ? json.message.join(', ')
          : json?.message) ?? message;
      details = json;
    } else {
      const text = await response.text();
      if (text) message = text;
      details = text;
    }
  } catch (error) {
    // ignore parsing errors
  }

  const err = new Error(message) as Error & { status?: number; details?: unknown };
  err.status = response.status;
  err.details = details;
  return err;
}

function mergeSignals(signalA: AbortSignal | undefined, signalB: AbortSignal) {
  if (!signalA) return signalB;
  if ((signalA as any).aborted) return signalA;

  const controller = new AbortController();

  const abort = () => controller.abort();
  signalA.addEventListener('abort', abort);
  signalB.addEventListener('abort', abort);

  return controller.signal;
}
