import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

function homeByRole(roles: { manager?: boolean; tutor?: boolean; student?: boolean }) {
  if (roles?.manager) return "/admin";
  if (roles?.tutor) return "/tutor";
  return "/dashboard"; // default: student
}

export default function GuestRoute({ children }: { children: JSX.Element }) {
  const { user, roles, loading } = useAuth();
  const loc = useLocation();

  // Importante: espera a que termine loading (incluye snapshot de roles)
  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;

  if (!user) return children;              // sin sesión: muestra login
  return <Navigate to={homeByRole(roles)} replace state={{ from: loc }} />; // con sesión: fuera del login
}
