const API_URL = 'https://api.expoferiascr.site/api';

type ApiRequest = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readBody(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(status: number, body: unknown) {
  if (body && typeof body === 'object' && 'error' in body) {
    const error = body.error;
    if (typeof error === 'string') return error;
  }

  if (typeof body === 'string') return body;
  return `Error HTTP ${status}`;
}

async function request(endpoint: string, options: ApiRequest = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Bypass-Tunnel-Reminder': 'true',
        ...options.headers,
      },
    });
    const body = await readBody(response);

    if (!response.ok) {
      throw new ApiError(response.status, getErrorMessage(response.status, body));
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }
}

export const apiClient = {
  get: (endpoint: string) => request(endpoint),

  post: (endpoint: string, body: unknown) => request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),

  put: (endpoint: string, body: unknown) => request(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),

  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),

  postForm: (endpoint: string, formData: FormData) => request(endpoint, {
    method: 'POST',
    body: formData,
  }),
};
