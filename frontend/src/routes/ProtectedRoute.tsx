// src/routes/ProtectedRoute.tsx
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
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;

  if (role && !roles[role]) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}