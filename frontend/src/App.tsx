import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/Loading";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

// Lazy load de páginas para code splitting
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RequestSession = lazy(() => import("./pages/RequestSession"));
const AdminDashboard = lazy(() => import("./pages/Admin"));
const TutorDashboard = lazy(() => import("./pages/Tutor"));

function Unauthorized() {
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>Sin permisos</h1>
      <a href="/" style={{ fontWeight: 700 }}>Ir al inicio</a>
    </div>
  );
}

// Componente de loading para Suspense
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(180deg, #1A2E5A 0%, #2A4D8A 55%, #E6F0FA 100%)'
    }}>
      <LoadingSpinner size="large" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}