export type AdminUser = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  role: "user" | "admin";
  emailVerified?: boolean;
  createdAt?: string;
};

export type ProductRecord = {
  _id: string;
  barcode: string;
  name: string;
  price: number;
  category?: string;
  stock: number;
  createdAt?: string;
};

export type BillRecord = {
  _id: string;
  userId?: AdminUser;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: "pending" | "paid";
  status?: "pending" | "paid" | "verified";
  exitPass?: string | null;
  createdAt: string;
};

export type PaymentRecord = {
  _id: string;
  user?: AdminUser;
  orderId: string;
  paymentId?: string;
  amount: number;
  method?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
};

export type SupportTicketRecord = {
  _id: string;
  user?: AdminUser;
  title: string;
  description: string;
  category: string;
  status: "open" | "in-progress" | "closed";
  response?: string | null;
  respondedAt?: string | null;
  createdAt: string;
};

export type OfferRecord = {
  _id: string;
  name: string;
  couponCode: string;
  discountType: "percentage" | "fixed" | "bogo";
  discountValue: number;
  applicableProducts: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Expired";
  maxUsage: number;
  currentUsage: number;
  createdAt?: string;
};

export type DashboardSummary = {
  usersCount: number;
  billsCount: number;
  productsCount: number;
  openTicketsCount: number;
  revenue: number;
};

type AuthResponse = {
  token: string;
  user: AdminUser;
};

const TOKEN_KEY = "billify_admin_token";
const USER_KEY = "billify_admin_user";

function getLocalAdminBootstrapCredentials() {
  const email = process.env.NEXT_PUBLIC_LOCAL_ADMIN_EMAIL?.trim() || "";
  const password = process.env.NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD?.trim() || "";

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }

  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "";

  return (configuredBaseUrl || "http://127.0.0.1:5000/api").replace(/\/+$/, "");
}

function parseErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const candidate = payload as { message?: string };
  return candidate.message || fallback;
}

function isLocalDevelopmentHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

export function getStoredAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function saveAdminSession(auth: AuthResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, auth.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function shouldUseLocalAdminBootstrap() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(getLocalAdminBootstrapCredentials()) && isLocalDevelopmentHost(window.location.hostname);
}

async function apiRequest<T>(endpoint: string, init: RequestInit = {}, useAuth = true): Promise<T> {
  const apiBaseUrl = getApiBaseUrl();

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");

  if (useAuth) {
    const token = getStoredAdminToken();
    if (!token) {
      throw new Error("No admin session found");
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    throw new Error(parseErrorMessage(payload, `Request failed with status ${response.status}`));
  }

  return response.json() as Promise<T>;
}

export async function loginAdmin(email: string, password: string) {
  const auth = await apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false,
  );

  if (auth.user.role !== "admin") {
    throw new Error("This account does not have admin access.");
  }

  saveAdminSession(auth);
  return auth;
}

export async function bootstrapLocalAdminSession() {
  const credentials = getLocalAdminBootstrapCredentials();

  if (!credentials) {
    throw new Error("Local admin bootstrap credentials are not configured.");
  }

  return loginAdmin(credentials.email, credentials.password);
}

export function fetchAdminProfile() {
  return apiRequest<AdminUser>("/auth/me");
}

export function getDashboardSummary() {
  return apiRequest<DashboardSummary>("/admin/dashboard");
}

export function getAdminUsers() {
  return apiRequest<AdminUser[]>("/admin/users");
}

export function getAdminBills() {
  return apiRequest<BillRecord[]>("/admin/bills");
}

export function getAdminPayments() {
  return apiRequest<PaymentRecord[]>("/admin/payments");
}

export function getAdminSupportTickets() {
  return apiRequest<SupportTicketRecord[]>("/admin/support");
}

export function updateSupportTicket(id: string, payload: { response?: string; status?: string }) {
  return apiRequest<{ success: boolean; ticket: SupportTicketRecord }>(`/admin/support/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getProducts() {
  return apiRequest<ProductRecord[]>("/admin/products");
}

export function createProduct(payload: { barcode: string; name: string; category?: string; price: number; stock: number }) {
  return apiRequest<ProductRecord>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id: string, payload: Partial<ProductRecord>) {
  return apiRequest<ProductRecord>(`/admin/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/products/${id}`, {
    method: "DELETE",
  });
}

// ─── Offers / Discounts ───────────────────────────────────────────────────────

export function getAdminOffers() {
  return apiRequest<OfferRecord[]>("/admin/offers");
}

export function createOffer(payload: Omit<OfferRecord, "_id" | "createdAt" | "currentUsage">) {
  return apiRequest<OfferRecord>("/admin/offers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateOffer(id: string, payload: Partial<Omit<OfferRecord, "_id" | "createdAt">>) {
  return apiRequest<OfferRecord>(`/admin/offers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteOffer(id: string) {
  return apiRequest<{ success: boolean; message: string }>(`/admin/offers/${id}`, {
    method: "DELETE",
  });
}