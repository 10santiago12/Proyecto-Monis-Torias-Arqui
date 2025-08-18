import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequestSession from "./pages/RequestSession";
import MyRequests from "./pages/MyRequests";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/request-session" element={<RequestSession />} />
      <Route path="/my-requests" element={<MyRequests />} />
    </Routes>
  );
}

export default App;