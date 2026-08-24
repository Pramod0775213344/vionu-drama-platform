function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // In browser: always use relative path '/api/v1' so client fetch requests stay on the same HTTPS domain.
    // Next.js server proxies it server-side to the Oracle VM backend, eliminating browser Mixed Content errors 100%!
    return '/api/v1';
  }
  // Server-side (Node.js SSR):
  const envUrl = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://145.241.195.29:4000/api/v1'
  ).replace(/\/+$/, '');

  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('kflix_access_token') : null;
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}
