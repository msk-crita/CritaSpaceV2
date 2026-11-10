import { useCallback, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  getCurrentUser,
  login as loginService,
  logout as logoutService,
  resetPassword as resetPasswordService,
} from "../features/auth/auth.service";
import { AuthContext } from "./auth-context";
import type { AuthContextType } from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUser();
        setUser(profile);
      } catch {
        setUser(null);
        await logoutService();
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      const profile = await loginService(email, password, rememberMe);
      setUser(profile);
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetPasswordService(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
