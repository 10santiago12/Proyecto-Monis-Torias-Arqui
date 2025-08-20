import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: "student" | "tutor" | "manager";
}) {
  const { user, roles, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!user) return <Navigate to="/" replace state={{ from: loc }} />;

  if (role && !roles[role]) {
    // Usuario logueado pero sin el rol requerido -> redirige al inicio (login/guest)
    return <Navigate to="/" replace />;
  }

  return children;
}