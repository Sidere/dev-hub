import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  User,
  AuthToken,
  getStoredToken,
  getStoredUser,
  storeAuth,
  clearAuth,
  isTokenExpired,
  getTokenRemainingMs,
  isTechnicalRole,
  storeRefreshToken,
  getStoredRefreshToken
} from "@/lib/auth";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: "DEV" | "USER";
  };
}

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_WARNING_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const logout = useCallback(async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken }).catch(() => { });
      }
    } finally {
      clearAuth();
      setUser(null);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    }
  }, []);

  const setupTokenTimers = useCallback((token: AuthToken) => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    const remaining = getTokenRemainingMs(token);
    if (remaining <= 0) {
      logout();
      return;
    }

    logoutTimerRef.current = setTimeout(() => {
      toast.error("Sessão expirada. Faça login novamente.");
      logout();
    }, remaining);

    if (remaining > TOKEN_WARNING_MS) {
      warningTimerRef.current = setTimeout(() => {
        toast.warning("Sua sessão expira em 5 minutos.");
      }, remaining - TOKEN_WARNING_MS);
    }
  }, [logout]);

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (token && storedUser && !isTokenExpired(token) && isTechnicalRole(storedUser.role)) {
      setUser(storedUser);
      setupTokenTimers(token);
    } else if (token) {
      clearAuth();
    }
    setIsLoading(false);
  }, [setupTokenTimers]);

  const login = async (email: string, password: string) => {
    const data = await apiClient.post<LoginResponse>('/auth/login', { email, password });

    if (!isTechnicalRole(data.user.role)) {
      throw new Error("Acesso restrito a usuários desenvolvedores.");
    }

    storeAuth(data.accessToken, data.user);

    if (data.refreshToken) {
      storeRefreshToken(data.refreshToken);
    }

    const token = getStoredToken();
    if (token) {
      setupTokenTimers(token);
    }

    setUser(data.user);
    toast.success(`Bem-vindo, ${data.user.name}`);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}