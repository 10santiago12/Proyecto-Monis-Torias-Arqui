// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequestSession from "./pages/RequestSession";
import AdminDashboard from "./pages/Admin";
import TutorDashboard from "./pages/Tutor";

// (Opcional) Pantalla simple para /unauthorized.
// Si prefieres, crea src/pages/Unauthorized.tsx y reemplaza este componente.
function Unauthorized() {
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>Sin permisos</h1>
      <p>No tienes acceso a esta página.</p>
      <a href="/" style={{ fontWeight: 700 }}>Ir al inicio</a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Pública */}
        <Route path="/" element={<Login />} />

        {/* Estudiante */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-session"
          element={
            <ProtectedRoute role="student">
              <RequestSession />
            </ProtectedRoute>
          }
        />

        {/* Tutor */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute role="tutor">
              <TutorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin / Manager */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="manager">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rutas auxiliares */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </AuthProvider>
  );
}