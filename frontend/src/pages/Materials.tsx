import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Materials() {
  const { id } = useParams();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getMaterials(id)
      .then(setMaterials)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-4">Cargando materiales...</p>;
  if (!materials.length) return <p className="p-4">No hay materiales disponibles.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Materiales de la sesión</h1>
      <ul className="space-y-3">
        {materials.map((m) => (
          <li key={m.id} className="p-4 border rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">{m.title}</h2>
            <p className="text-gray-600">{m.description}</p>
            {m.url && (
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Ver material
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
