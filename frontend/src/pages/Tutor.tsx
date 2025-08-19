import { useNavigate } from "react-router-dom";

export default function TutorDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // TODO: llama aquí tu servicio real de logout si aplica (Firebase/Supabase/tu API)
      // Ejemplos:
      // await signOut(auth);
      // await api.auth.logout();

      // Limpieza local básica
      localStorage.removeItem("token");
      sessionStorage.clear();

      alert("Has cerrado sesión ✅");
      navigate("/"); // 👉 redirige a la raíz
    } catch (err) {
      console.error(err);
      alert("No se pudo cerrar sesión. Inténtalo de nuevo.");
    }
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

          {/* Botón Logout */}
          <button className="btn-logout" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        {/* Subheader */}
        <section className="subheader">
          <h2 className="page-title">Panel de Tutor</h2>
          <p className="page-sub">
            Aquí podrás ver y confirmar sesiones, además de gestionar tu perfil.
          </p>
        </section>

        {/* Contenido visual */}
        <section className="grid">
          {/* Próximas sesiones */}
          <div className="card card-span2">
            <div className="card-head">
              <h3 className="card-title">Próximas sesiones</h3>
              <span className="chip">0</span>
            </div>
            <div className="empty">
              <div className="empty-icon">📅</div>
              <p className="empty-text">No tienes sesiones por confirmar.</p>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="card">
            <h3 className="card-title">Acciones rápidas</h3>
            <div className="actions">
              <button className="btn-primary" type="button" disabled>
                Ver calendario
              </button>
              <button className="btn-secondary" type="button" disabled>
                Abrir materiales
              </button>
            </div>
            <p className="hint">*Botones de muestra (sin funcionalidad nueva)</p>
          </div>

          {/* Tu perfil */}
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
.brand-title{margin:0; font-size:18px; color:var(--dark); font-weight:800; letter-spacing:.2px}

/* Botón Logout */
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

.btn-secondary{
  padding:10px 14px; border-radius:12px; border:1px solid #dbe7f8; background:#f7faff; color:#0f172a;
  font-weight:700; cursor:pointer; transition:filter .2s ease, transform .05s ease; 
}
.btn-secondary:hover{filter:brightness(1.03)}
.btn-secondary:active{transform:translateY(1px)}
.btn-secondary:disabled{opacity:.6; cursor:not-allowed}

.hint{margin:8px 0 0; font-size:12px; color:#64748b}

/* List */
.list{list-style:none; margin:0; padding:0}
.list li{padding:6px 0; color:#334155}
`;