import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function RequestSession() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.createSession({ title, description });
      alert("✅ Sesión creada con éxito");
      navigate("/dashboard"); // redirige al listado
    } catch (err: any) {
      console.error(err);
      setError("No se pudo crear la sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-xl font-bold mb-6 text-center">Crear Sesión</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows={3}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Creando..." : "Crear sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}