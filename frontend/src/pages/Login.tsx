import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

type Role = "student" | "tutor" | "manager";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const roleToClaims = (r: Role) =>
    r === "manager" ? { manager: true } : r === "tutor" ? { tutor: true } : { student: true };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegister) {
        // Crear cuenta
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

        // Guarda perfil "humano" (opcional)
        await setDoc(doc(db, "users", uid), {
          email: email.trim(),
          role,
          createdAt: new Date().toISOString(),
        });

        // Guarda roles que usa el backend para autorizar
        await setDoc(doc(db, "user_roles", uid), roleToClaims(role), { merge: true });

        // Nota: NO navegamos. GuestRoute te redirige según user+roles.
      } else {
        // Iniciar sesión
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

        // Si no existe user_roles, asume estudiante por defecto (evita quedarse en login)
        const rolesSnap = await getDoc(doc(db, "user_roles", uid));
        if (!rolesSnap.exists()) {
          await setDoc(doc(db, "user_roles", uid), { student: true }, { merge: true });
        }

        // Nota: NO navegamos. GuestRoute te redirige según user+roles.
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/email-already-in-use") {
        setError("Este correo ya está en uso.");
      } else if (err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password") {
        setError("Credenciales inválidas.");
      } else if (err?.code === "auth/user-not-found") {
        setError("Usuario no encontrado.");
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-root">
      <style>{`
        :root {
          --dark: #1A2E5A;
          --mid: #2A4D8A;
          --light: #E6F0FA;
          --white: #FFFFFF;
          --cta: #E0E7FF;
          --accent: #005BBB;
        }

        html, body, #root { height: 100%; }
        body { margin: 0; background: transparent; }
        *, *::before, *::after { box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: linear-gradient(180deg, var(--dark) 0%, var(--mid) 55%, var(--light) 100%);
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
        }

        .login-shell {
          width: min(1100px, 92vw);
          background: var(--white);
          border-radius: 20px;
          box-shadow: 0 20px 45px rgba(0,0,0,.18);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
        }
        @media (max-width: 900px) {
          .login-shell { grid-template-columns: 1fr; }
          .hero { min-height: 180px; }
        }

        .hero {
          background: linear-gradient(180deg, var(--dark) 0%, var(--mid) 100%);
          color: var(--white);
          padding: 48px 48px 48px;
          position: relative;
        }
        .hero h1 {
          font-size: 28px;
          margin: 8px 0 4px;
          font-weight: 800;
          letter-spacing: .2px;
        }
        .hero h2 {
          font-size: 22px;
          margin: 16px 0 8px;
          font-weight: 800;
        }
        .hero p {
          margin: 0;
          opacity: .9;
          max-width: 46ch;
          line-height: 1.45;
        }

        .brand {
          display: flex; align-items: center; gap: 12px;
        }
        .brand-badge {
          height: 42px; width: 42px; border-radius: 999px;
          background: rgba(255,255,255,.15);
          display: grid; place-items: center;
          border: 1px solid rgba(255,255,255,.25);
          font-weight: 800;
        }

        .form-pane {
          background: var(--white);
          padding: 40px 36px;
          display: grid;
          align-content: center;
        }
        .pane-title {
          color: var(--dark);
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .pane-sub {
          color: var(--mid);
          font-size: 13px;
          margin-bottom: 22px;
          text-decoration: none;
        }

        .error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 14px;
        }
        .field { margin-bottom: 14px; }
        .label {
          display: block;
          font-size: 13px;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 6px;
        }
        .input, .select {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #D6E4F5;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: box-shadow .15s ease, border-color .15s ease, transform .02s ease;
          background: #FCFDFF;
        }
        .input:focus, .select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0,91,187,.18);
        }

        .submit {
          width: 100%;
          padding: 12px 14px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          color: var(--white);
          background: linear-gradient(90deg, var(--mid), var(--dark));
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(26,46,90,.25);
          transition: transform .05s ease, filter .2s ease;
        }
        .submit:hover { filter: brightness(1.05); }
        .submit:active { transform: translateY(1px); }
        .submit:disabled { opacity: .6; cursor: not-allowed; }

        .switch {
          margin-top: 12px;
          text-align: center;
          font-size: 14px;
          color: #475569;
        }
        .link {
          color: var(--accent);
          font-weight: 700;
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 3px;
          background: none;
          border: 0;
          cursor: pointer;
          padding: 0 2px;
        }

        .cta {
          margin-top: 10px;
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 2px solid var(--accent);
          color: var(--accent);
          background: var(--cta);
          font-weight: 800;
          cursor: pointer;
          transition: background .2s ease, transform .05s ease;
        }
        .cta:hover { background: #fff; }
        .cta:active { transform: translateY(1px); }

        .footer {
          margin-top: 18px;
          text-align: center;
          color: var(--mid);
          font-size: 12px;
        }
      `}</style>

      <div className="login-shell">
        {/* HERO */}
        <section className="hero">
          <div className="brand">
            <div className="brand-badge">MT</div>
            <div>
              <div style={{ opacity: .85, fontSize: 12 }}>Plataforma de tutorías</div>
              <h1>Monis-Torias</h1>
            </div>
          </div>

          <h2>Acompañamiento académico 24/7</h2>
          <p>
            Accede a tutorías, agenda sesiones y potencia tu aprendizaje con una experiencia
            simple, moderna y accesible.
          </p>
        </section>

        {/* FORM */}
        <section className="form-pane">
          <div>
            <div className="pane-title">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</div>
            <a href="#" className="pane-sub">Universidad de La Sabana</a>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Correo institucional</label>
                <input
                  type="email"
                  placeholder="tunombre@unisabana.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div className="field">
                <label className="label">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input"
                />
              </div>

              {isRegister && (
                <div className="field">
                  <label className="label">Rol</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="select"
                  >
                    <option value="student">Estudiante</option>
                    <option value="tutor">Tutor</option>
                    {/* Valor corregido a 'manager' para coincidir con tu backend */}
                    <option value="manager">Administrador</option>
                  </select>
                </div>
              )}

              <button type="submit" className="submit" disabled={submitting}>
                {submitting ? (isRegister ? "Creando…" : "Ingresando…") : isRegister ? "Registrarse" : "Ingresar"}
              </button>
            </form>

            {!isRegister ? (
              <>
                <div className="switch">¿Aún no tienes cuenta?</div>
                <button onClick={() => setIsRegister(true)} className="cta" aria-label="Inscríbete">
                  Inscríbete
                </button>
              </>
            ) : (
              <div className="switch">
                ¿Ya tienes cuenta?{" "}
                <button onClick={() => setIsRegister(false)} className="link">
                  Inicia sesión
                </button>
              </div>
            )}

            <div className="footer">© {new Date().getFullYear()} Monis-Torias — Tutorías</div>
          </div>
        </section>
      </div>
    </div>
  );
}