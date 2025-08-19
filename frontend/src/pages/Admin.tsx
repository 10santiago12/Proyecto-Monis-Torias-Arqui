// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 agregado
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

  const navigate = useNavigate(); // 👈 inicializado

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

  if (loading) {
    return (
      <div className="admin-root">
        <style>{styles}</style>
        <div className="admin-shell">
          <header className="admin-header">
            <div className="brand">
              <div className="brand-badge">MT</div>
              <div className="brand-text">
                <div className="brand-kicker">Plataforma de tutorías</div>
                <h1 className="brand-title">Monis-Torias</h1>
              </div>
            </div>
            <button className="btn-secondary" disabled>Recargar</button>
          </header>

          <section className="subheader">
            <h2 className="page-title">Administración de Tutores</h2>
            <p className="page-sub">Cargando tutores…</p>
          </section>

          <div className="grid">
            <div className="skeleton" />
            <div className="skeleton" />
            <div className="skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <style>{styles}</style>

      <div className="admin-shell">
        {/* Header */}
        <header className="admin-header">
          <div className="brand">
            <div className="brand-badge">MT</div>
            <div className="brand-text">
              <div className="brand-kicker">Plataforma de tutorías</div>
              <h1 className="brand-title">Monis-Torias</h1>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={load} className="btn-secondary">
              Recargar
            </button>
            {/* 👇 Botón Cerrar sesión en rojo */}
            <button
              onClick={() => navigate("/")}
              className="btn-logout"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Subheader */}
        <section className="subheader">
          <h2 className="page-title">Administración de Tutores</h2>
          <p className="page-sub">
            Gestiona los tutores y asigna su código único de 4 dígitos.
          </p>
        </section>

        {/* Error */}
        {error && <div className="alert-error">{error}</div>}

        {/* Lista */}
        {!tutors.length ? (
          <div className="empty">
            <div className="empty-icon">👩‍🏫</div>
            <p className="empty-text">No hay tutores registrados aún.</p>
          </div>
        ) : (
          <ul className="grid">
            {tutors.map((t) => (
              <li key={t.id} className="card">
                <div className="card-left">
                  <div className="avatar">
                    {(t.displayName ?? t.id)
                      .split(" ")
                      .map(w => w[0])
                      .join("")
                      .slice(0,2)
                      .toUpperCase()}
                  </div>
                  <div className="meta">
                    <p className="name">{t.displayName ?? t.id}</p>
                    <p className="email">{t.email ?? "—"}</p>
                    <p className="row">
                      Rol: <span className="val">{t.role ?? "tutor"}</span>
                    </p>
                    <p className="row">
                      Código:{" "}
                      <span className={`code ${t.code ? "" : "code--empty"}`}>
                        {t.code ? t.code : "— sin asignar —"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="card-right">
                  <button
                    disabled={!!t.code || assigning === t.id}
                    onClick={() => handleAssign(t.id)}
                    className={`btn-primary ${!!t.code ? "btn-disabled" : ""}`}
                  >
                    {assigning === t.id ? "Asignando..." : "Asignar código 4 dígitos"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------- ESTILOS (sin Tailwind) ------------------- */
const styles = `
:root{
  --dark:#1A2E5A; --mid:#2A4D8A; --light:#E6F0FA; --white:#FFFFFF; --cta:#E0E7FF; --accent:#005BBB;
}
html,body,#root{height:100%} body{margin:0;background:transparent}
*,*::before,*::after{box-sizing:border-box}

.admin-root{
  min-height:100vh; display:grid; place-items:center;
  background:linear-gradient(180deg,var(--dark) 0%, var(--mid) 55%, var(--light) 100%);
  font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color:#0f172a;
}
.admin-shell{
  width:min(1200px,92vw); background:var(--white); border-radius:20px; overflow:hidden;
  box-shadow:0 24px 60px rgba(0,0,0,.18);
}

/* Header */
.admin-header{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:18px 22px; border-bottom:1px solid #eef3f9;
  background:linear-gradient(180deg,rgba(26,46,90,.08), transparent);
}
.brand{display:flex; align-items:center; gap:12px}
.brand-badge{height:40px;width:40px;border-radius:999px;display:grid;place-items:center;
  color:#fff;background:linear-gradient(180deg,var(--dark),var(--mid));font-weight:800;border:1px solid rgba(255,255,255,.6);}
.brand-text{line-height:1.1}
.brand-kicker{font-size:12px;color:#475569}
.brand-title{margin:0;font-size:18px;color:var(--dark);font-weight:800;letter-spacing:.2px}

.btn-secondary{
  padding:10px 14px;border-radius:12px;border:1px solid #dbe7f8;background:#f7faff;color:#0f172a;
  font-weight:700;cursor:pointer;transition:filter .2s ease, transform .05s ease;
}
.btn-secondary:hover{filter:brightness(1.03)}
.btn-secondary:active{transform:translateY(1px)}
.btn-secondary:disabled{opacity:.6;cursor:not-allowed}

/* Botón Logout en rojo */
.btn-logout{
  padding:10px 14px;border-radius:12px;border:1px solid #fecaca;background:#fee2e2;
  color:#b91c1c;font-weight:700;cursor:pointer;transition:filter .2s ease, transform .05s ease;
}
.btn-logout:hover{filter:brightness(1.05)}
.btn-logout:active{transform:translateY(1px)}

/* Subheader */
.subheader{padding:20px 22px 10px}
.page-title{margin:0 0 4px;font-size:22px;color:#0f172a;font-weight:800}
.page-sub{margin:0;font-size:14px;color:#475569}

/* Alert */
.alert-error{
  margin:10px 22px 0;padding:10px 12px;border-radius:12px;
  background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-weight:600;font-size:14px;
}

/* Grid / Cards */
.grid{
  list-style:none; margin:16px 22px 22px; padding:0;
  display:grid; grid-template-columns:repeat(12,1fr); gap:16px;
}
@media (max-width: 900px){ .grid{grid-template-columns:1fr} }
@media (min-width: 901px){ .grid > li{grid-column:span 6} }
@media (min-width:1200px){ .grid > li{grid-column:span 4} }

.card{
  border:1px solid #e6edf7; border-radius:16px; background:#fff;
  box-shadow:0 1px 0 rgba(2,6,23,.04); display:flex; align-items:center; justify-content:space-between;
  padding:14px; gap:16px;
  transition:box-shadow .2s ease, transform .05s ease, border-color .2s ease;
}
.card:hover{ border-color:#d9e6fb; box-shadow:0 10px 24px rgba(26,46,90,.12); transform:translateY(-1px); }

.card-left{display:flex; align-items:flex-start; gap:12px}
.avatar{
  height:44px;width:44px;border-radius:999px;display:grid;place-items:center;
  font-weight:800;color:#fff;background:linear-gradient(180deg,var(--mid),var(--dark));
  border:1px solid rgba(255,255,255,.6);
}
.meta{min-width:0}
.name{margin:0 0 2px;font-size:15px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.email{margin:0 0 6px;font-size:13px;color:#475569;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row{margin:0;font-size:13px;color:#334155}
.val{font-weight:700}
.code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; font-weight:800; letter-spacing:.5px}
.code--empty{color:#64748b;font-style:italic}

.card-right{display:flex; align-items:center; gap:8px}
.btn-primary{
  padding:10px 14px;border-radius:12px;color:#fff;border:none;cursor:pointer;
  background:linear-gradient(90deg,var(--mid),var(--dark));
  box-shadow:0 10px 20px rgba(26,46,90,.25); font-weight:800;
  transition:filter .2s ease, transform .05s ease, opacity .2s ease;
}
.btn-primary:hover{filter:brightness(1.05)}
.btn-primary:active{transform:translateY(1px)}
.btn-primary.btn-disabled{opacity:.55;cursor:not-allowed}

/* Empty state */
.empty{margin:24px 22px 32px; padding:24px; border:1px dashed #cfe0f8; border-radius:16px; background:#fbfdff; text-align:center}
.empty-icon{font-size:28px;margin-bottom:6px}
.empty-text{margin:0;color:#475569}

/* Skeletons */
.skeleton{
  height:110px; border-radius:16px; background:
  linear-gradient(90deg, #eef3f9 25%, #e6eef9 37%, #eef3f9 63%);
  background-size:400% 100%; animation:shine 1.1s linear infinite; border:1px solid #e6edf7;
  grid-column:span 4;
}
@keyframes shine{0%{background-position:100% 0}100%{background-position:0 0}}
`;