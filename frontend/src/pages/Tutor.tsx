// src/pages/Tutor.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

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
  studentId?: string;
  tutorId?: string;
  tutorCode?: string;
};

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Mapa: sessionId -> valor del input datetime-local
  const [schedule, setSchedule] = useState<Record<string, string>>({});

  // --- helpers fecha ---
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
  // ISO -> "YYYY-MM-DDTHH:mm" (valor de <input type="datetime-local">)
  const isoToLocalInput = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const h = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${y}-${m}-${day}T${h}:${min}`;
  };
  // "YYYY-MM-DDTHH:mm" -> ISO
  const localInputToISO = (v: string) => {
    if (!v) return "";
    const d = new Date(v); // interpreta en zona local
    return isNaN(d.getTime()) ? "" : d.toISOString();
  };

  // --- carga desde API ---
  const load = async () => {
    try {
      setError("");
      setLoading(true);
      const list = await api.getSessions();
      setSessions(Array.isArray(list) ? list : []);
      // Prefill inputs con preferredAt si existe (o ahora + 1h)
      const prefill: Record<string, string> = {};
      (Array.isArray(list) ? list : []).forEach((s: Session) => {
        if (s.status === "requested") {
          const prefISO = toISO(s.preferredAt);
          const fallbackISO = new Date(Date.now() + 60 * 60 * 1000).toISOString();
          prefill[s.id] = isoToLocalInput(prefISO || fallbackISO);
        }
      });
      setSchedule(prefill);
    } catch (e: any) {
      console.error(e);
      setError("No se pudieron cargar tus tutorías.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Confirmadas con fecha futura
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

  // Pedidas pero sin confirmar
  const pending = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "requested")
        .sort((a, b) => toTime(a.preferredAt || a.createdAt) - toTime(b.preferredAt || b.createdAt)),
    [sessions]
  );

  const handleLogout = async () => {
    try {
      // TODO: signOut(auth) si usas Firebase
      localStorage.removeItem("token");
      sessionStorage.clear();
      alert("Has cerrado sesión ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("No se pudo cerrar sesión. Inténtalo de nuevo.");
    }
  };

  const handleChangeDate = (id: string, v: string) => {
    setSchedule((prev) => ({ ...prev, [id]: v }));
  };

  const handleConfirm = async (id: string) => {
    const localVal = schedule[id];
    if (!localVal) return;
    const iso = localInputToISO(localVal);
    if (!iso) {
      alert("Fecha/hora inválida");
      return;
    }
    try {
      setSavingId(id);
      await api.confirmSession(id, iso);
      // Actualizar estado local
      setSessions((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: "confirmed", scheduledAt: iso, confirmedAt: new Date().toISOString() as any }
            : s
        )
      );
      alert("Sesión confirmada ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "No se pudo confirmar la sesión");
    } finally {
      setSavingId(null);
    }
  };

  const isConfirmDisabled = (id: string) => {
    const v = schedule[id];
    if (!v) return true;
    const t = new Date(v).getTime();
    return isNaN(t); // inválida
  };

  return (
    <div className="tutor-root">
      <style>{styles}</style>

      <div className="tutor-shell">
        {/* Header */}
        <header className="tutor-header">
          <div className="brand">
            <div className="brand-badge">MT</div>
            <div className="brand-text">
              <div className="brand-kicker">Plataforma de tutorías</div>
              <h1 className="brand-title">Monis-Torias</h1>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" onClick={load} disabled={loading}>
              {loading ? "Cargando…" : "Recargar"}
            </button>
            <button className="btn-logout" type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Subheader */}
        <section className="subheader">
          <h2 className="page-title">Panel de Tutor</h2>
          <p className="page-sub">Aquí podrás ver y confirmar sesiones, además de gestionar tu perfil.</p>
        </section>

        {error && <div className="alert-error">{error}</div>}

        {/* Contenido */}
        <section className="grid">
          {/* Confirmadas próximas */}
          <div className="card card-span2">
            <div className="card-head">
              <h3 className="card-title">Confirmadas (próximas)</h3>
              <span className="chip">{confirmedUpcoming.length}</span>
            </div>

            {loading ? (
              <div className="empty">
                <div className="empty-icon">⏳</div>
                <p className="empty-text">Cargando tus sesiones…</p>
              </div>
            ) : confirmedUpcoming.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📅</div>
                <p className="empty-text">No tienes sesiones próximas confirmadas.</p>
              </div>
            ) : (
              <ul className="sessions">
                {confirmedUpcoming.map((s) => (
                  <li key={s.id} className="session-item">
                    <div className="session-main">
                      <div className="session-title">{s.topic || "Tutoría"}</div>
                      <div className="session-sub">
                        {fmt(s.scheduledAt)} · {s.durationMin ? `${s.durationMin} min` : "Duración no definida"}
                      </div>
                    </div>
                    <div className="session-cta">
                      <button className="btn-primary" disabled>
                        Abrir meet
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pendientes por confirmar */}
          <div className="card">
            <div className="card-head">
              <h3 className="card-title">Pendientes por confirmar</h3>
              <span className="chip">{pending.length}</span>
            </div>

            {loading ? (
              <div className="empty">
                <div className="empty-icon">⏳</div>
                <p className="empty-text">Cargando…</p>
              </div>
            ) : pending.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📝</div>
                <p className="empty-text">No tienes solicitudes pendientes.</p>
              </div>
            ) : (
              <ul className="sessions">
                {pending.map((s) => (
                  <li key={s.id} className="session-item">
                    <div className="session-main" style={{ flex: 1 }}>
                      <div className="session-title">{s.topic || "Tutoría"}</div>
                      <div className="session-sub">
                        Preferida: {fmt(s.preferredAt)} · {s.durationMin ? `${s.durationMin} min` : "Duración no definida"}
                      </div>
                    </div>

                    {/* selector de fecha y botón confirmar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="datetime-local"
                        value={schedule[s.id] || ""}
                        onChange={(e) => handleChangeDate(s.id, e.target.value)}
                        style={{
                          padding: "8px 10px",
                          border: "1px solid #dbe7f8",
                          borderRadius: 10,
                          fontSize: 13,
                        }}
                      />
                      <button
                        className="btn-primary"
                        disabled={isConfirmDisabled(s.id) || savingId === s.id}
                        onClick={() => handleConfirm(s.id)}
                      >
                        {savingId === s.id ? "Confirmando…" : "Confirmar"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Perfil */}
          <div className="card">
            <h3 className="card-title">Tu perfil</h3>
            <ul className="list">
              <li>• Completa tu bio y asignaturas.</li>
              <li>• Verifica tu correo institucional.</li>
              <li>• Mantén tu disponibilidad actualizada.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------- ESTILOS ------------------- */
const styles = `
:root{
  --dark:#1A2E5A; --mid:#2A4D8A; --light:#E6F0FA; --white:#FFFFFF; --cta:#E0E7FF; --accent:#005BBB;
}
html,body,#root{height:100%} body{margin:0;background:transparent}
*,*::before,*::after{box-sizing:border-box}

.tutor-root{
  min-height:100vh; display:grid; place-items:center;
  background:linear-gradient(180deg,var(--dark) 0%, var(--mid) 55%, var(--light) 100%);
  font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color:#0f172a;
}
.tutor-shell{
  width:min(1200px,92vw); background:var(--white); border-radius:20px; overflow:hidden;
  box-shadow:0 24px 60px rgba(0,0,0,.18);
}

/* Header */
.tutor-header{
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:18px 22px; border-bottom:1px solid #eef3f9;
  background:linear-gradient(180deg,rgba(26,46,90,.08), transparent);
}
.brand{display:flex; align-items:center; gap:12px}
.brand-badge{height:40px; width:40px; border-radius:999px; display:grid; place-items:center;
  color:#fff; background:linear-gradient(180deg,var(--dark),var(--mid)); font-weight:800; border:1px solid rgba(255,255,255,.6);}
.brand-text{line-height:1.1}
.brand-kicker{font-size:12px; color:#475569}
.brand-title{margin:0; font-size:18px; color:#0f172a; font-weight:800; letter-spacing:.2px}

/* Botones */
.btn-secondary{
  padding:10px 14px;border-radius:12px;border:1px solid #dbe7f8;background:#f7faff;color:#0f172a;
  font-weight:700;cursor:pointer;transition:filter .2s ease, transform .05s ease;
}
.btn-secondary:hover{filter:brightness(1.03)}
.btn-secondary:active{transform:translateY(1px)}
.btn-secondary:disabled{opacity:.6;cursor:not-allowed}

.btn-logout{
  padding:10px 16px; border-radius:12px; border:none;
  background:linear-gradient(90deg,#ef4444,#dc2626);
  color:white; font-weight:700; cursor:pointer;
  transition:filter .2s ease, transform .05s ease;
}
.btn-logout:hover{filter:brightness(1.05)}
.btn-logout:active{transform:translateY(1px)}

/* Subheader */
.subheader{padding:20px 22px 6px}
.page-title{margin:0 0 4px; font-size:22px; color:#0f172a; font-weight:800}
.page-sub{margin:0; font-size:14px; color:#475569}

/* Alert */
.alert-error{
  margin:10px 22px 0;padding:10px 12px;border-radius:12px;
  background:#FEF2F2;border:1px solid #FECACA;color:#B91C1C;font-weight:600;font-size:14px;
}

/* Grid / Cards */
.grid{
  margin:16px 22px 22px;
  display:grid; grid-template-columns:repeat(12,1fr); gap:16px;
}
.card{
  border:1px solid #e6edf7; border-radius:16px; background:#fff;
  box-shadow:0 1px 0 rgba(2,6,23,.04); padding:16px;
  transition:box-shadow .2s ease, transform .05s ease, border-color .2s ease;
}
.card:hover{ border-color:#d9e6fb; box-shadow:0 10px 24px rgba(26,46,90,.12); transform:translateY(-1px); }
.card-title{margin:0 0 10px; font-size:16px; font-weight:800; color:#0f172a}

@media (max-width: 900px){
  .grid{grid-template-columns:1fr}
  .card, .card-span2{grid-column:span 1}
}
@media (min-width: 901px){
  .card{grid-column:span 4}
  .card-span2{grid-column:span 8}
}

.card-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:6px}
.chip{
  display:inline-flex; align-items:center; justify-content:center; min-width:28px; height:24px; padding:0 8px;
  border-radius:999px; font-size:12px; font-weight:800; color:#0f172a; background:#f1f6ff; border:1px solid #dbe7f8;
}

/* Empty state */
.empty{display:grid; place-items:center; text-align:center; padding:18px; border:1px dashed #cfe0f8; border-radius:12px; background:#fbfdff}
.empty-icon{font-size:26px; margin-bottom:6px}
.empty-text{margin:0; color:#475569}

/* Actions */
.actions{display:flex; gap:10px; flex-wrap:wrap}
.btn-primary{
  padding:10px 14px; border-radius:12px; color:#fff; border:none; cursor:pointer;
  background:linear-gradient(90deg,var(--mid),var(--dark));
  box-shadow:0 10px 20px rgba(26,46,90,.25); font-weight:800;
  transition:filter .2s ease, transform .05s ease, opacity .2s ease;
}
.btn-primary:hover{filter:brightness(1.05)}
.btn-primary:active{transform:translateY(1px)}
.btn-primary:disabled{opacity:.6; cursor:not-allowed}

.hint{margin:8px 0 0; font-size:12px; color:#64748b}

/* Lista de sesiones */
.sessions{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px}
.session-item{
  border:1px solid #e6edf7; border-radius:12px; padding:12px; display:flex; align-items:center; justify-content:space-between; gap:12px;
}
.session-title{font-weight:800}
.session-sub{font-size:13px; color:#475569}
.session-cta{display:flex; align-items:center}
.muted{color:#64748b; font-weight:600}
`;