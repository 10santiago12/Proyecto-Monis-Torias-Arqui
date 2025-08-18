// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { api } from "../services/api";

type Tutor = {
  id: string;         // uid del tutor
  displayName?: string;
  email?: string;
  code?: string;      // código de 4 dígitos si ya lo tiene
  role?: string;      // "tutor"
};

export default function AdminPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const list = await api.getTutors();
      setTutors(list);
    } catch (e: any) {
      console.error(e);
      setError("No se pudo cargar la lista de tutores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAssign = async (uid: string) => {
    setError("");
    setAssigning(uid);
    try {
      const { code } = await api.assignTutorCode(uid);
      // Refrescar en memoria el tutor al que asignamos
      setTutors((prev) =>
        prev.map((t) => (t.id === uid ? { ...t, code } : t))
      );
      alert(`Código asignado: ${code}`);
    } catch (e: any) {
      console.error(e);
      setError("No se pudo asignar el código. Verifica que tengas rol 'manager'.");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) return <p className="p-4">Cargando tutores...</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Administración de Tutores</h1>
        <button
          onClick={load}
          className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200 border"
        >
          Recargar
        </button>
      </div>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {!tutors.length ? (
        <p>No hay tutores registrados aún.</p>
      ) : (
        <ul className="space-y-3">
          {tutors.map((t) => (
            <li
              key={t.id}
              className="p-4 border rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{t.displayName ?? t.id}</p>
                <p className="text-sm text-gray-600">{t.email ?? "—"}</p>
                <p className="text-sm">
                  Rol: <span className="font-medium">{t.role ?? "tutor"}</span>
                </p>
                <p className="text-sm">
                  Código:{" "}
                  <span className="font-mono">
                    {t.code ? t.code : "— sin asignar —"}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!!t.code || assigning === t.id}
                  onClick={() => handleAssign(t.id)}
                  className={`px-3 py-2 rounded text-white ${
                    !!t.code
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {assigning === t.id ? "Asignando..." : "Asignar código 4 dígitos"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}