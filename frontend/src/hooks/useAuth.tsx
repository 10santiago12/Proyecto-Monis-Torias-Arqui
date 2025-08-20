import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, signOut, type User } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

type Roles = { student?: boolean; tutor?: boolean; manager?: boolean };
type Ctx = {
  user: User | null;
  roles: Roles;
  loading: boolean;         // <- incluye la espera del snapshot de roles
  logout: () => Promise<void>;
};

const Ctx = createContext<Ctx>({ user: null, roles: {}, loading: true, logout: async () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Roles>({});
  const [loading, setLoading] = useState(true);
  const rolesUnsubRef = useRef<() => void | undefined>(undefined);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      // Limpia listener anterior
      rolesUnsubRef.current?.();
      setUser(u);

      if (!u) {
        setRoles({});
        setLoading(false);
        return;
      }

      // Vamos a esperar a tener roles -> loading true
      setLoading(true);

      // 1) Claims (si existen)
      const tokenRes = await getIdTokenResult(u).catch(() => null);
      const claimRoles = ((tokenRes?.claims?.roles as Roles) || {}) as Roles;

      // 2) Listener tiempo real a Firestore user_roles/{uid}
      const ref = doc(db, "user_roles", u.uid);
      rolesUnsubRef.current = onSnapshot(
        ref,
        (snap) => {
          const dbRoles = (snap.exists() ? (snap.data() as Roles) : {}) || {};
          const merged = { ...claimRoles, ...dbRoles };
          setRoles(merged);
          setLoading(false); // <- sólo aquí bajamos el loading
        },
        async (err) => {
          console.error("user_roles snapshot error:", err);
          // Fallback: un get único
          const s = await getDoc(ref).catch(() => null);
          const dbRoles = (s?.exists() ? (s.data() as Roles) : {}) || {};
          const merged = { ...claimRoles, ...dbRoles };
          setRoles(merged);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      rolesUnsubRef.current?.();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    setRoles({});
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, roles, loading, logout }}>
      {children}
    </Ctx.Provider>
  );
}