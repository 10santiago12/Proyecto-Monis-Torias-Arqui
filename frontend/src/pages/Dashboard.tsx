import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Cargando sesiones...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sesiones disponibles</h1>
        
        {/* ✅ Botón único, fuera del map */}
        <Link
          to="/request-session"
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
        >
          ➕ Crear sesión
        </Link>
      </div>

      <ul className="space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="p-4 border rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">{s.title ?? "Sesión"}</h2>
            <p className="text-gray-600">{s.description ?? "Sin descripción"}</p>
            <Link
              to={`/sessions/${s.id}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Ver sesión →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}