import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequestSession from "./pages/RequestSession";
import AdminDashboard from "./pages/Admin";
import TutorDashboard from "./pages/Tutor";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} /> {/* Estudiante */}
      <Route path="/request-session" element={<RequestSession />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/tutor" element={<TutorDashboard />} />
    </Routes>
  );
}

export default App;