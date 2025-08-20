// src/hooks/useAuth.ts
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getIdTokenResult, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type Roles = { student?: boolean; tutor?: boolean; manager?: boolean };
type AuthCtx = {
  user: User | null;
  roles: Roles;
  loading: boolean;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, roles: {}, loading: true, logout: async () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Roles>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) { setRoles({}); setLoading(false); return; }

      let r: Roles = {};
      // 1) custom claims (si los usas)
      const res = await getIdTokenResult(u, true).catch(() => null);
      r = (res?.claims?.roles as Roles) || {};

      // 2) fallback a Firestore user_roles/{uid}
      if (!r || Object.keys(r).length === 0) {
        const snap = await getDoc(doc(db, "user_roles", u.uid)).catch(() => null);
        r = (snap?.exists() ? (snap.data() as Roles) : {}) || {};
      }

      // 3) si no hay nada, trátalo como student (opcional)
      if (!r.manager && !r.tutor && !r.student) r = { student: true };

      setRoles(r);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setRoles({});
    setUser(null);
  };

  return <Ctx.Provider value={{ user, roles, loading, logout }}>{children}</Ctx.Provider>;
}
