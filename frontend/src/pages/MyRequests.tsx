import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function MyRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Cargando solicitudes...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mis solicitudes</h1>
      <ul className="space-y-3">
        {requests.map((r) => (
          <li key={r.id} className="p-4 border rounded shadow">
            <h2 className="font-semibold">{r.topic}</h2>
            <p className="text-sm text-gray-600">{r.description}</p>
            <p className="text-sm">Duración: {r.durationMin} min</p>
            <p className="text-sm">
              Estado:{" "}
              <span className="font-medium">
                {r.status ?? "pendiente"}
              </span>
            </p>
            {r.scheduledAt && (
              <p className="text-sm">📅 {new Date(r.scheduledAt).toLocaleString()}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}