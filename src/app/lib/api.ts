export interface Training {
  id: string;
  userId: string;
  type: "online" | "on-site";
  date: string;
  status: string;
  createdAt: string;
}
export type UserType = "farmer" | "buyer" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  userType: UserType;
  location?: string;
  phone?: string;
  // Subscription fields for farmers
  subscriptionLevel?: "basic" | "diamond" | "platinum";
  subscriptionStatus?: "trial" | "active" | "expired";
  trialEndsAt?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  farmer: string;
  location: string;
  stock: number;
  lat: number;
  lng: number;
  image: string;
  description: string;
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  areaSize: number;
  plantingDate: string;
  expectedHarvest: string;
  status: "planted" | "growing" | "ready" | "harvested";
  notes: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("authToken") || "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error("Cannot reach the backend API. Start the full app with 'npm run dev' or make sure the backend is running on port 4000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export const api = {
  async register(payload: {
    name: string;
    username: string;
    email: string;
    password: string;
    userType: UserType;
    location?: string;
    phone?: string;
  }) {
    return request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { identifier: string; password: string }) {
    return request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async me() {
    return request<{ user: User }>("/users/me");
  },

  async updateProfile(payload: Partial<Pick<User, "name" | "username" | "email" | "location" | "phone">>) {
    return request<{ token: string; user: User }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    return request<{ message: string }>("/users/password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async requestPasswordReset(identifier: string) {
    return request<{ message: string; resetToken: string | null; resetLink: string | null }>("/users/password-reset-request", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    });
  },

  async updateSubscription(subscriptionLevel: "basic" | "diamond" | "platinum") {
    return request<{ message: string; user: User }>("/users/subscription", {
      method: "PUT",
      body: JSON.stringify({ subscriptionLevel }),
    });
  },

  async resetPassword(payload: { token: string; newPassword: string }) {
    return request<{ message: string }>("/users/password-reset", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async switchRole(targetRole: UserType) {
    return request<{ token: string; user: User }>("/users/switch-role", {
      method: "POST",
      body: JSON.stringify({ targetRole }),
    });
  },

  async listProducts(params: { search?: string; category?: string; minPrice?: number | null; maxPrice?: number | null }) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.category) qs.set("category", params.category);
    if (typeof params.minPrice === "number") qs.set("minPrice", String(params.minPrice));
    if (typeof params.maxPrice === "number") qs.set("maxPrice", String(params.maxPrice));
    return request<{ products: Product[] }>(`/products?${qs.toString()}`);
  },

  async getWeather(location: string) {
    const qs = new URLSearchParams({ location });
    return request<{
      location: string;
      current: { temp: number; humidity: number; windSpeed: number; condition: string };
      alerts: Array<{ id: string; type: "drought" | "frost" | "rain" | "storm"; severity: "low" | "medium" | "high"; message: string }>;
    }>(`/weather/current?${qs.toString()}`);
  },

  async listCrops() {
    return request<{ crops: Crop[] }>("/crops");
  },

  async createCrop(payload: Omit<Crop, "id" | "createdAt" | "updatedAt" | "userId">) {
    return request<{ crop: Crop }>("/crops", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateCrop(id: string, payload: Omit<Crop, "id" | "createdAt" | "updatedAt" | "userId">) {
    return request<{ crop: Crop }>(`/crops/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteCrop(id: string) {
    return request<{ message: string }>(`/crops/${id}`, {
      method: "DELETE",
    });
  },

  async createPaymentIntent(amount: number, currency: "usd" | "jmd" = "usd") {
    return request<{
      provider: string;
      status: "mock_success" | "requires_action" | "failed" | "succeeded";
      amount: number;
      currency: string;
      paymentIntentId: string;
      clientSecret: string;
      message?: string;
    }>("/payments/create-intent", {
      method: "POST",
      body: JSON.stringify({ amount, currency }),
    });
  },

  async listOrders() {
    return request<{ orders: any[] }>("/orders");
  },

  async createOrder(payload: {
    items: Array<{ product: Product; quantity: number }>;
    deliveryMethod: "delivery" | "pickup";
    address: string;
    payment: {
      status: "mock_success" | "requires_action" | "failed" | "succeeded";
      paymentIntentId?: string;
      provider: string;
    };
  }) {
    return request<{ order: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async askAi(message: string, messages: AiMessage[] = [], imageDataUrl?: string) {
    return request<{ reply: string }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, messages, imageDataUrl }),
    });
  },

  async listTrainings() {
    return request<{ trainings: Training[] }>("/trainings");
  },

  async createTraining(payload: { type: "online" | "on-site"; date: string }) {
    return request<{ training: Training }>("/trainings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async createReview(payload: { orderId: string; productId: string; rating: number; comment: string }) {
    return request<{ review: any }>("/reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async listMyReviews() {
    return request<{ reviews: any[] }>("/reviews/mine");
  },

  async adminOverview() {
    return request<{
      users: number;
      buyers: number;
      farmers: number;
      admins: number;
      orders: number;
      reviews: number;
      pendingResets: number;
    }>("/admin/overview");
  },
};
