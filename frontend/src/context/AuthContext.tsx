import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener de autenticación
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });

    // Logout automático al cerrar la pestaña (solo si VITE_SESSION_PERSISTENCE === 'session')
    const handleBeforeUnload = () => {
      if (import.meta.env.VITE_SESSION_PERSISTENCE === 'session' && auth.currentUser) {
        // Usar signOut sin await para que sea instantáneo
        signOut(auth).catch(console.error);
      }
    };

    if (import.meta.env.VITE_SESSION_PERSISTENCE === 'session') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
