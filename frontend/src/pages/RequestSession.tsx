import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function RequestSession() {
  const [tutorCode, setTutorCode] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [durationMin, setDurationMin] = useState(60); // por defecto 60 min
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        tutorCode,
        topic,
        description,
        durationMin: Number(durationMin),
      };
      await api.createSession(payload);
      alert("✅ Sesión creada con éxito");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("No se pudo crear la sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="req-root">
      <style>{styles}</style>

      <div className="req-shell">
        {/* Header */}
        <header className="req-header">
          <div className="brand">
            <div className="brand-badge">MT</div>
            <div className="brand-text">
              <div className="brand-kicker">Plataforma de tutorías</div>
              <h1 className="brand-title">Monis-Torias</h1>
            </div>
          </div>
        </header>

        {/* Subheader */}
        <section className="subheader">
          <h2 className="page-title">Crear sesión</h2>
          <p className="page-sub">
            Ingresa el <strong>código del tutor</strong>, el tema y la duración estimada.
          </p>
        </section>

        {/* Contenido */}
        <section className="content">
          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="label">Código del tutor</label>
              <input
                type="text"
                placeholder="Ej: 4821"
                value={tutorCode}
                onChange={(e) => setTutorCode(e.target.value)}
                className="input"
                required
              />
              <p className="hint">Código de 4 dígitos asignado por el administrador.</p>
            </div>

            <div className="field">
              <label className="label">Tema</label>
              <input
                type="text"
                placeholder="Ej: Matemáticas — Álgebra"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input"
                required
              />
            </div>

            <div className="field">
              <label className="label">Descripción</label>
              <textarea
                placeholder="Describe brevemente qué necesitas trabajar."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="textarea"
                rows={4}
                required
              />
            </div>

            <div className="field inline">
              <div className="inline-item">
                <label className="label">Duración (minutos)</label>
                <input
                  type="number"
                  placeholder="60"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="input"
                  required
                  min={15}
                />
              </div>

              <div className="inline-item tip">
                <div className="tip-box">
                  ⓘ Recomendada: <strong>60–90 min</strong> para temas con ejercicios.
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`btn-primary ${loading ? "btn-disabled" : ""}`}>
              {loading ? "Creando..." : "Crear sesión"}
            </button>
          </form>
        </section>
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

.req-root{
  min-height:100vh; display:grid; place-items:center;
  background:linear-gradient(180deg,var(--dark) 0%, var(--mid) 55%, var(--light) 100%);
  font-family:ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  color:#0f172a;
}
.req-shell{
  width:min(900px,92vw); background:var(--white); border-radius:20px; overflow:hidden;
  box-shadow:0 24px 60px rgba(0,0,0,.18);
}

/* Header */
.req-header{
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

/* Subheader */
.subheader{padding:20px 22px 6px}
.page-title{margin:0 0 4px; font-size:22px; color:#0f172a; font-weight:800}
.page-sub{margin:0; font-size:14px; color:#475569}

/* Content / Form */
.content{padding:18px 22px 24px}
.form{
  border:1px solid #e6edf7; border-radius:16px; background:#fff; padding:18px;
  box-shadow:0 1px 0 rgba(2,6,23,.04);
}
.field{margin-bottom:14px}
.label{display:block; font-size:13px; color:var(--accent); font-weight:600; margin:0 0 6px}
.input, .textarea{
  width:100%; padding:12px 14px; border:1px solid #D6E4F5; border-radius:12px; font-size:15px;
  outline:none; transition:box-shadow .15s ease, border-color .15s ease;
  background:#FCFDFF;
}
.textarea{resize:vertical}
.input:focus, .textarea:focus{
  border-color:var(--accent); box-shadow:0 0 0 3px rgba(0,91,187,.18);
}

/* Inline group */
.inline{display:grid; grid-template-columns:1fr 1fr; gap:12px}
.inline-item{display:block}
@media (max-width: 720px){ .inline{grid-template-columns:1fr} }
.tip-box{
  height:100%; display:flex; align-items:center; justify-content:center; text-align:center;
  border-radius:12px; border:1px dashed #cfe0f8; background:#fbfdff; color:#334155; padding:12px;
}

/* Alert */
.alert-error{
  margin:0 0 12px; padding:10px 12px; border-radius:12px;
  background:#FEF2F2; border:1px solid #FECACA; color:#B91C1C; font-weight:600; font-size:14px;
}

/* Button */
.btn-primary{
  width:100%; padding:12px 14px; border-radius:12px; color:#fff; border:none; cursor:pointer;
  background:linear-gradient(90deg,var(--mid),var(--dark));
  box-shadow:0 10px 20px rgba(26,46,90,.25); font-weight:800;
  transition:filter .2s ease, transform .05s ease, opacity .2s ease;
}
.btn-primary:hover{filter:brightness(1.05)}
.btn-primary:active{transform:translateY(1px)}
.btn-disabled{opacity:.6; cursor:not-allowed}
`;