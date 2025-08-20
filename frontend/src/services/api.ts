// src/services/api.ts
import { auth } from "../lib/firebase";

const API_URL = "https://proyecto-arqui-2c418.web.app/api";

async function request<T = any>(path: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  return contentType.includes("application/json")
    ? (res.json() as Promise<T>)
    : (undefined as T);
}

/** Tipos opcionales — ajusta a tu backend si quieres más estricto */
export interface Material {
  id: string;
  title: string;
  url?: string;
  description?: string;
}
export interface PaymentInitResponse {
  url: string; // la URL a la que rediriges (ej: Checkout)
}

export const api = {
  // Salud y sesiones
  getHealth: () => request("/health"),
  getSessions: () => request("/sessions"),
  createSession: (data: any) =>
    request("/sessions/request", { method: "POST", body: JSON.stringify(data) }),

  // 🔹 CONFIRMAR SESIÓN (NUEVO)
  confirmSession: (sessionId: string, scheduledAtISO: string) =>
    request(`/sessions/${encodeURIComponent(sessionId)}/confirm`, {
      method: "POST",
      body: JSON.stringify({ scheduledAt: scheduledAtISO }),
    }),

  // Tutores
  getTutors: () => request("/tutors"),
  assignTutorCode: (uid: string, note?: string) =>
    request(`/tutors/${encodeURIComponent(uid)}/assign-code`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),

  // Materiales
  getMaterials: (courseId: string) =>
    request<Material[]>(`/materials/${encodeURIComponent(courseId)}`),

  // Pagos
  createPayment: (sessionId: string) =>
    request<PaymentInitResponse>(`/payments/create-checkout-session`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
};