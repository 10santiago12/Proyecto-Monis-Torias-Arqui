// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

type MaybeTimestamp =
  | string
  | { seconds: number; nanoseconds?: number }
  | { _seconds: number; _nanoseconds?: number }
  | { toDate: () => Date }
  | null
  | undefined;

type Session = {
  id: string;
  status: "requested" | "confirmed" | "done" | string;
  topic?: string;
  description?: string;
  durationMin?: number;
  preferredAt?: MaybeTimestamp;
  scheduledAt?: MaybeTimestamp;
  createdAt?: MaybeTimestamp;
  tutorId?: string | null;
  tutorCode?: string;
};

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- helpers de fecha ---
  const toISO = (v: MaybeTimestamp): string | undefined => {
    if (!v) return undefined;
    if (typeof v === "string") return v;
    // @ts-ignore
    if (typeof v?.seconds === "number") return new Date(v.seconds * 1000).toISOString();
    // @ts-ignore
    if (typeof v?._seconds === "number") return new Date(v._seconds * 1000).toISOString();
    // @ts-ignore
    if (typeof v?.toDate === "function") return (v as any).toDate().toISOString();
    return undefined;
  };
  const toTime = (v: MaybeTimestamp): number => {
    const iso = toISO(v);
    if (!iso) return NaN;
    const t = new Date(iso).getTime();
    return isNaN(t) ? NaN : t;
  };
  const fmt = (v: MaybeTimestamp) => {
    const iso = toISO(v);
    if (!iso) return "Por agendar";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Fecha inválida";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
  };

  useEffect(() => {
    api
      .getSessions()
      .then((list) => {
        const arr = Array.isArray(list) ? (list as Session[]) : [];
        setSessions(arr);
        // console.log("[Student] /sessions ->", arr);
      })
      .catch((e: any) => {
        console.error(e);
        setError("No se pudieron cargar tus sesiones.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Confirmadas futuras
  const confirmedUpcoming = useMemo(() => {
    const now = Date.now();
    return sessions
      .filter((s) => s.status === "confirmed")
      .filter((s) => {
        const t = toTime(s.scheduledAt);
        return !isNaN(t) && t >= now;
      })
      .sort((a, b) => toTime(a.scheduledAt) - toTime(b.scheduledAt));
  }, [sessions]);

  // Pendientes por confirmar
  const pending = useMemo(() => {
    return sessions
      .filter((s) => s.status === "requested")
      .sort((a, b) => toTime(a.preferredAt || a.createdAt) - toTime(b.preferredAt || b.createdAt));
  }, [sessions]);

  if (loading) {
    return (
      <div className="dash-root">
        <style>{baseStyles}</style>
        <div className="dash-shell">
          <header className="dash-header">
            <div className="brand">
              <div className="brand-badge">MT</div>
              <div className="brand-text">
                <div className="brand-kicker">Plataforma de tutorías</div>
                <h1 className="brand-title">Monis-Torias</h1>
              </div>
            </div>
            <div className="header-cta">
              <Link to="/request-session" className="btn-primary disabled">
                ➕ Crear sesión
              </Link>
              <button onClick={() => navigate("/")} className="btn-logout" type="button">
                Cerrar sesión
              </button>
            </div>
          </header>
          <div className="content">
            <div className="skeleton-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-root">
      <style>{baseStyles}</style>

      <div className="dash-shell">
        {/* Header */}
        <header className="dash-header">
          <div className="brand">
            <div className="brand-badge">MT</div>
            <div className="brand-text">
              <div className="brand-kicker">Plataforma de tutorías</div>
              <h1 className="brand-title">Monis-Torias</h1>
            </div>
          </div>

          <div className="header-cta">
            <Link to="/request-session" className="btn-primary">
              Crear sesión
            </Link>
            <button onClick={() => navigate("/")} className="btn-logout" type="button">
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Subheader */}
        <div className="subheader">
          <h2 className="page-title">Tus sesiones</h2>
          <p className="page-sub">Aquí verás tus próximas tutorías y las solicitudes pendientes.</p>
        </div>

        {error && (
          <div style={{ margin: "0 22px 10px", color: "#b91c1c", fontWeight: 700 }}>
            {error}
          </div>
        )}

        {/* Confirmadas próximas */}
        <section className="content">
          <h3 style={{ margin: "0 0 8px" }}>
            Confirmadas (próximas) <span className="chip">{confirmedUpcoming.length}</span>
          </h3>

          {confirmedUpcoming.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📅</div>
              <p className="empty-text">No tienes sesiones confirmadas próximas.</p>
            </div>
          ) : (
            <ul className="cards-grid">
              {confirmedUpcoming.map((s) => (
                <li key={s.id} className="card">
                  <div className="card-body">
                    <h3 className="card-title">{s.topic || "Tutoría"}</h3>
                    <p className="card-desc">
                      {fmt(s.scheduledAt)} · {s.durationMin ? `${s.durationMin} min` : "Duración no definida"}
                    </p>
                    {/* Si tienes página de detalle */}
                    <Link to={`/sessions/${s.id}`} className="card-link">
                      Ver sesión →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pendientes por confirmar */}
        <section className="content">
          <h3 style={{ margin: "0 0 8px" }}>
            Pendientes por confirmar <span className="chip">{pending.length}</span>
          </h3>

          {pending.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📝</div>
              <p className="empty-text">No tienes solicitudes pendientes.</p>
            </div>
          ) : (
            <ul className="cards-grid">
              {pending.map((s) => (
                <li key={s.id} className="card">
                  <div className="card-body">
                    <h3 className="card-title">{s.topic || "Tutoría"}</h3>
                    <p className="card-desc">
                      Preferida: {fmt(s.preferredAt)} · {s.durationMin ? `${s.durationMin} min` : "Duración no definida"}
                    </p>
                    <Link to={`/sessions/${s.id}`} className="card-link">
                      Ver solicitud →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- estilos (sin Tailwind) ---------- */
const baseStyles = `
:root{
  --dark:#1A2E5A; --mid:#2A4D8A; --light:#E6F0FA; --white:#FFFFFF; --cta:#E0E7FF; --accent:#005BBB;
}
html,body,#root{height:100%} body{margin:0; background:transparent}
*,*::before,*::after{box-sizing:border-box}
.dash-root{
  min-height:100vh; display:grid; place-items:center;
  background:linear-gradient(180deg,var(--dark) 0%, var(--mid) 55%, var(--light) 100%);
  font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color:#0f172a;
}
.dash-shell{
  width:min(1200px,92vw); background:var(--white); border-radius:20px; overflow:hidden;
  box-shadow:0 24px 60px rgba(0,0,0,.18);
}
.dash-header{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:18px 22px; border-bottom:1px solid #eef3f9;
  background:linear-gradient(180deg,rgba(26,46,90,.08), transparent);
}
.brand{display:flex; align-items:center; gap:12px}
.brand-badge{height:40px; width:40px; border-radius:999px; display:grid; place-items:center;
  color:#fff; background:linear-gradient(180deg,var(--dark),var(--mid)); font-weight:800; border:1px solid rgba(255,255,255,.6);}
.brand-text{line-height:1.1}
.brand-kicker{font-size:12px; color:#475569}
.brand-title{margin:0; font-size:18px; color:var(--dark); font-weight:800; letter-spacing:.2px}
.header-cta{display:flex; align-items:center; gap:8px}
.btn-primary{
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
  padding:10px 14px; border-radius:12px; color:#fff; text-decoration:none; font-weight:700;
  background:linear-gradient(90deg, var(--mid), var(--dark)); box-shadow:0 10px 20px rgba(26,46,90,.25);
  transition:filter .2s ease, transform .05s ease;
}
.btn-primary:hover{filter:brightness(1.05)}
.btn-primary:active{transform:translateY(1px)}
.btn-primary.disabled{opacity:.6; pointer-events:none}

/* Botón Cerrar sesión en rojo */
.btn-logout{
  padding:10px 14px; border-radius:12px; border:1px solid #fecaca; background:#fee2e2;
  color:#b91c1c; font-weight:700; cursor:pointer; transition:filter .2s ease, transform .05s ease;
}
.btn-logout:hover{filter:brightness(1.05)}
.btn-logout:active{transform:translateY(1px)}

.subheader{padding:20px 22px 10px}
.page-title{margin:0 0 4px; font-size:22px; color:#0f172a; font-weight:800}
.page-sub{margin:0; font-size:14px; color:#475569}

.content{padding:22px}

.cards-grid{
  list-style:none; padding:0 22px 22px; margin:0;
  display:grid; grid-template-columns:repeat(12,1fr); gap:16px;
}
@media (max-width: 900px){
  .cards-grid{grid-template-columns:1fr}
}
@media (min-width: 901px){
  .cards-grid > li{grid-column:span 6}
}
@media (min-width: 1200px){
  .cards-grid > li{grid-column:span 4}
}

.card{
  border:1px solid #e6edf7; border-radius:16px; background:#fff;
  box-shadow:0 1px 0 rgba(2,6,23,.04);
  transition:box-shadow .2s ease, transform .05s ease, border-color .2s ease;
}
.card:hover{
  border-color:#d9e6fb;
  box-shadow:0 10px 24px rgba(26,46,90,.12);
  transform:translateY(-1px);
}
.card-body{padding:16px 16px 14px}
.card-title{margin:0 0 6px; font-size:16px; font-weight:800; color:#0f172a}
.card-desc{margin:0 0 10px; font-size:14px; color:#475569}
.card-link{
  display:inline-block; font-weight:700; text-decoration:none; color:var(--accent);
  border:2px solid transparent; padding:6px 0; border-radius:10px;
}
.card-link:hover{ text-decoration:underline }
.card-link:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(0,91,187,.18) }

/* chips + empty */
.chip{
  display:inline-flex; align-items:center; justify-content:center; min-width:28px; height:24px; padding:0 8px;
  border-radius:999px; font-size:12px; font-weight:800; color:#0f172a; background:#f1f6ff; border:1px solid #dbe7f8;
}
.empty{display:grid; place-items:center; text-align:center; padding:18px; border:1px dashed #cfe0f8; border-radius:12px; background:#fbfdff; margin:0 22px 22px}
.empty-icon{font-size:26px; margin-bottom:6px}
.empty-text{margin:0; color:#475569}

/* skeleton loading */
.skeleton-grid{display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px}
@media (max-width: 900px){ .skeleton-grid{grid-template-columns:1fr} }
.skeleton-card{
  height:110px; border-radius:16px; background:
  linear-gradient(90deg, #eef3f9 25%, #e6eef9 37%, #eef3f9 63%);
  background-size:400% 100%; animation:shine 1.1s linear infinite;
  border:1px solid #e6edf7;
}
@keyframes shine{0%{background-position:100% 0}100%{background-position:0 0}}
`;