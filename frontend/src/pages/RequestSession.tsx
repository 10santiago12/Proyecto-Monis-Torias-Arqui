import { useState } from "react";
import { api } from "../services/api";

export default function RequestSession() {
  const [form, setForm] = useState({
    tutorCode: "",
    topic: "",
    description: "",
    durationMin: 60,
    preferredAt: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.requestSession({
        tutorCode: form.tutorCode,
        topic: form.topic,
        description: form.description,
        durationMin: Number(form.durationMin),
        preferredAt: form.preferredAt || undefined,
      });
      alert("Solicitud enviada ✅");
      setForm({ tutorCode: "", topic: "", description: "", durationMin: 60, preferredAt: "" });
    } catch (err) {
      alert("Error al enviar la solicitud ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Solicitar Monitoría</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="tutorCode"
          value={form.tutorCode}
          onChange={handleChange}
          placeholder="Código del tutor"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          placeholder="Tema"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descripción"
          className="w-full border p-2 rounded"
        />
        <input
          type="number"
          name="durationMin"
          value={form.durationMin}
          onChange={handleChange}
          placeholder="Duración (minutos)"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="datetime-local"
          name="preferredAt"
          value={form.preferredAt}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>
    </div>
  );
}
