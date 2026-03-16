const LOCAL_API_URL = "http://localhost:8080";
const RENDER_API_URL = "https://artistlog-backend-latest.onrender.com";

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function isLocalhostHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isLocalUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function resolveApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  const hasWindow = typeof window !== "undefined";
  const currentHost = hasWindow ? window.location.hostname : "";
  const runningLocally = hasWindow && isLocalhostHost(currentHost);

  if (envUrl) {
    if (!runningLocally && hasWindow && isLocalUrl(envUrl)) {
      console.warn(
        `[API] VITE_API_URL (${envUrl}) points to localhost in production. Falling back to ${RENDER_API_URL}.`
      );
      return RENDER_API_URL;
    }
    return normalizeBaseUrl(envUrl);
  }

  return runningLocally ? LOCAL_API_URL : RENDER_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("artistlog_token");
}

function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("artistlog_token", token);
}

function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("artistlog_token");
  localStorage.removeItem("artistlog_user");
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, headers: customHeaders, ...rest } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: HeadersInit = {
    ...((customHeaders as HeadersInit) || {}),
  };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && !(headers as Record<string, string>)["Content-Type"]) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (auth && token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const rawBody =
    body === undefined
      ? undefined
      : isFormData || typeof body === "string"
        ? (body as BodyInit)
        : JSON.stringify(body);

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers,
      body: rawBody,
    });
  } catch (err) {
    const message = isLocalUrl(url)
      ? `Nao foi possivel conectar ao backend local em ${url}. Verifique se ele esta rodando na porta 8080.`
      : `Falha de rede ao acessar ${endpoint}. Verifique URL da API e configuracao de CORS.`;
    throw new ApiError(message, 0, { cause: err });
  }

  if (response.status === 401 && auth) {
    removeToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError("Sessao expirada. Faca login novamente.", 401);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      (data as { message?: string; description?: string } | null)?.message ||
      (data as { message?: string; description?: string } | null)?.description ||
      (typeof data === "string" && data.trim().length > 0 ? data : `HTTP ${response.status}`);

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

const apiClientCallable = <T>(endpoint: string, options: RequestOptions = {}) => request<T>(endpoint, options);

export const apiClient = Object.assign(apiClientCallable, {
  get: <T>(endpoint: string, params?: Record<string, unknown>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return request<T>(`${endpoint}${query ? `?${query}` : ""}`);
  },

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PUT",
      body,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),

  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: "POST",
      body: formData,
    }),

  postPublic: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "POST",
      body,
      auth: false,
    }),

  postPublicSilent: async <T>(endpoint: string, body?: unknown) => {
    try {
      return await request<T>(endpoint, {
        method: "POST",
        body,
        auth: false,
      });
    } catch {
      return undefined as T;
    }
  },
});

export { getToken, setToken, removeToken };
