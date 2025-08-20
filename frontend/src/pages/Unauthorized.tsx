// src/pages/Unauthorized.tsx
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>Sin permisos</h1>
      <p>No tienes acceso a esta página.</p>
      <p><Link to="/">Ir al inicio</Link></p>
    </div>
  );
}