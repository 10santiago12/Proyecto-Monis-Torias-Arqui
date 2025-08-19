// src/services/api.ts
import { auth } from "../lib/firebase";

// Si tienes backend en otro origen, puedes usar env:
// const API_URL = import.meta.env.VITE_API_URL ?? "https://proyecto-arqui-2c418.web.app/api";
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
  // algunos endpoints pueden no devolver JSON (204), ajusta si aplica
  const contentType = res.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? (res.json() as Promise<T>) : (undefined as T);
}

/** Tipos opcionales — ajusta a tu backend si quieres más estricto */
export interface Material {
  id: string;
  title: string;
  url?: string;
  description?: string;
  // ...campos que manejes
}
export interface PaymentInitResponse {
  url: string; // la URL a la que rediriges (ej: Checkout)
}

export const api = {
  // Salud y sesiones (lo que ya tenías)
  getHealth: () => request("/health"),
  getSessions: () => request("/sessions"),
  createSession: (data: any) =>
    request("/sessions/request", { method: "POST", body: JSON.stringify(data) }),

  // Tutores
  getTutors: () => request("/tutors"),
  assignTutorCode: (uid: string, note?: string) =>
    request(`/tutors/${uid}/assign-code`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),

  // 🔹 MATERIALES (usado en src/pages/Materials.tsx)
  // Asumo un endpoint REST tipo /materials/:courseId que devuelve lista de materiales
  // Si tu backend espera query ?courseId=..., cambia la línea del request.
  getMaterials: (courseId: string) =>
    request<Material[]>(`/materials/${encodeURIComponent(courseId)}`),

  // 🔹 PAGOS (usado en src/pages/Session.tsx)
  // Asumo POST que crea sesión de pago y responde { url }
  // Ajusta la ruta si tu backend usa otra (p. ej. /sessions/:id/pay)
  createPayment: (sessionId: string) =>
    request<PaymentInitResponse>(`/payments/create-checkout-session`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
};