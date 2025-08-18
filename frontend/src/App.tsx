import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Reservas from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/reservas" element={<Reservas />} />
    </Routes>
  );
}

export default App;