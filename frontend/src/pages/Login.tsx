import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("student"); // 👈 default estudiante
  const [error, setError] = useState("");

  // Mapa de rutas según rol
  const roleRoutes: Record<string, string> = {
    student: "/dashboard",
    tutor: "/tutor",
    admin: "/admin",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // Crear usuario
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        // Guardar en Firestore con rol
        await setDoc(doc(db, "users", uid), {
          email,
          role,
          createdAt: new Date().toISOString(),
        });

        alert("✅ Cuenta creada con éxito");
        navigate(roleRoutes[role] || "/dashboard"); // redirige según rol
      } else {
        // Iniciar sesión
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        // Leer rol desde Firestore
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const userData = snap.data();
          navigate(roleRoutes[userData.role] || "/dashboard");
        } else {
          navigate("/dashboard"); // fallback
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo ya está en uso.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Credenciales inválidas.");
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-xl font-bold mb-6 text-center">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          {isRegister && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="student">Estudiante</option>
              <option value="tutor">Tutor</option>
              <option value="admin">Administrador</option>
            </select>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {isRegister ? "Registrarse" : "Ingresar"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-500 hover:underline"
          >
            {isRegister ? "Inicia sesión" : "Crea una cuenta"}
          </button>
        </p>
      </div>
    </div>
  );
}