import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequestSession from "./pages/RequestSession";
import AdminDashboard from "./pages/Admin";
import TutorDashboard from "./pages/Tutor";

function Unauthorized() {
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>Sin permisos</h1>
      <a href="/" style={{ fontWeight: 700 }}>Ir al inicio</a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login solo para invitados; si hay sesión, redirige a home por rol */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

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

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="manager">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </AuthProvider>
  );
}