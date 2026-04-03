import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

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
export const ADMIN_SESSION_EVENT = "billify-admin-session-change";

function notifyAdminSessionChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

function getLocalAdminBootstrapCredentials() {
  const email = process.env.NEXT_PUBLIC_LOCAL_ADMIN_EMAIL?.trim() || "";
  const password = process.env.NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD?.trim() || "";

  if (!email || !password) {
    return null;
  }

  return { email, password };
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
  notifyAdminSessionChange();
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyAdminSessionChange();
}

export function shouldUseLocalAdminBootstrap() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(getLocalAdminBootstrapCredentials()) && isLocalDevelopmentHost(window.location.hostname);
}

function getRequiredAdminToken() {
  const token = getStoredAdminToken();

  if (!token) {
    throw new Error("No admin session found");
  }

  return token;
}

export async function loginAdmin(email: string, password: string) {
  const auth = await apiPost<AuthResponse>("/auth/login", { email, password });

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
  return apiGet<AdminUser>("/auth/me", { token: getRequiredAdminToken() });
}

export function getDashboardSummary() {
  return apiGet<DashboardSummary>("/admin/dashboard", { token: getRequiredAdminToken() });
}

export function getAdminUsers() {
  return apiGet<AdminUser[]>("/admin/users", { token: getRequiredAdminToken() });
}

export function getAdminBills() {
  return apiGet<BillRecord[]>("/admin/bills", { token: getRequiredAdminToken() });
}

export function getAdminPayments() {
  return apiGet<PaymentRecord[]>("/admin/payments", { token: getRequiredAdminToken() });
}

export function getAdminSupportTickets() {
  return apiGet<SupportTicketRecord[]>("/admin/support", { token: getRequiredAdminToken() });
}

export function updateSupportTicket(id: string, payload: { response?: string; status?: string }) {
  return apiPut<{ success: boolean; ticket: SupportTicketRecord }>(`/admin/support/${id}`, payload, {
    token: getRequiredAdminToken(),
  });
}

export function getProducts() {
  return apiGet<ProductRecord[]>("/admin/products", { token: getRequiredAdminToken() });
}

export function createProduct(payload: { barcode: string; name: string; category?: string; price: number; stock: number }) {
  return apiPost<ProductRecord>("/products", payload, {
    token: getRequiredAdminToken(),
  });
}

export function updateProduct(id: string, payload: Partial<ProductRecord>) {
  return apiPut<ProductRecord>(`/admin/products/${id}`, payload, {
    token: getRequiredAdminToken(),
  });
}

export function deleteProduct(id: string) {
  return apiDelete<{ success: boolean; message: string }>(`/admin/products/${id}`, {
    token: getRequiredAdminToken(),
  });
}

// ─── Offers / Discounts ───────────────────────────────────────────────────────

export function getAdminOffers() {
  return apiGet<OfferRecord[]>("/admin/offers", { token: getRequiredAdminToken() });
}

export function createOffer(payload: Omit<OfferRecord, "_id" | "createdAt" | "currentUsage">) {
  return apiPost<OfferRecord>("/admin/offers", payload, {
    token: getRequiredAdminToken(),
  });
}

export function updateOffer(id: string, payload: Partial<Omit<OfferRecord, "_id" | "createdAt">>) {
  return apiPut<OfferRecord>(`/admin/offers/${id}`, payload, {
    token: getRequiredAdminToken(),
  });
}

export function deleteOffer(id: string) {
  return apiDelete<{ success: boolean; message: string }>(`/admin/offers/${id}`, {
    token: getRequiredAdminToken(),
  });
}