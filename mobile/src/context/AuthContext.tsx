import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../services/api";
import { api } from "../services/api";

type AppUser = {
  id: string;
  email: string;
  roles: string[];
  displayName?: string | null;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_TOKEN_KEY = "authToken";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        setAuthToken(null);
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      }
      setLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        setAuthToken(data.token);
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token);
        setUser(data.user);
      },
      register: async (email, password) => {
        const { data } = await api.post("/auth/register", { email, password });
        setAuthToken(data.token);
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token);
        setUser(data.user);
      },
      loginWithGoogle: async () => {
        throw new Error("Google OAuth not configured for PostgreSQL auth flow yet.");
      },
      logout: async () => {
        setAuthToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
