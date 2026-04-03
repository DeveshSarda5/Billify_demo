const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";

export const BASE_URL = rawBaseUrl.replace(/\/+$/, "");

console.log("API BASE URL:", process.env.NEXT_PUBLIC_API_BASE_URL);

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: BodyInit | Record<string, unknown> | Array<unknown> | null;
  headers?: HeadersInit;
  token?: string | null;
};

function getRequiredBaseUrl() {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return BASE_URL;
}

function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${getRequiredBaseUrl()}${normalizedEndpoint}`;
}

function serializeRequestBody(body: ApiRequestOptions["body"]) {
  if (
    body == null ||
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }

  return JSON.stringify(body);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as T;
}

async function parseErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload === "object" && "message" in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  } catch {
    // Fall through to the generic status-based message.
  }

  return `Request failed with status ${response.status}`;
}

export async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, body, ...init } = options;
  const requestHeaders = new Headers(headers || {});
  const requestBody = serializeRequestBody(body);

  if (requestBody != null && !(requestBody instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildApiUrl(endpoint), {
    ...init,
    body: requestBody,
    headers: requestHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return parseResponse<T>(response);
}

export function apiGet<T>(endpoint: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "GET",
  });
}

export function apiPost<T>(endpoint: string, body?: ApiRequestOptions["body"], options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: body ?? null,
  });
}

export function apiPut<T>(endpoint: string, body?: ApiRequestOptions["body"], options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body ?? null,
  });
}

export function apiDelete<T>(endpoint: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}