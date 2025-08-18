import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Session() {
  const { id } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSessions()
      .then((sessions) => {
        setSession(sessions.find((s: any) => s.id === id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    if (!id) return;
    const { url } = await api.createPayment(id);
    window.location.href = url; // redirige al checkout mock
  };

  if (loading) return <p className="p-4">Cargando sesión...</p>;
  if (!session) return <p className="p-4">Sesión no encontrada</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{session.title ?? "Sesión"}</h1>
      <p className="text-gray-700 mb-4">{session.description}</p>

      <button
        onClick={handlePay}
        className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
      >
        Comprar acceso
      </button>

      <Link
        to={`/materials/${session.id}`}
        className="ml-4 text-blue-600 hover:underline"
      >
        Ver materiales
      </Link>
    </div>
  );
}
