import { auth } from "../lib/firebase";

const API_URL = "https://proyecto-arqui-2c418.web.app/api";

async function request(path: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getHealth: () => request("/health"),

  getSessions: () => request("/sessions"),

  createSession: (data: any) => request("/sessions/request", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};