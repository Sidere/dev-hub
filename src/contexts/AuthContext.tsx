import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { User, AuthToken, getStoredToken, getStoredUser, storeAuth, clearAuth, isTokenExpired, getTokenRemainingMs, isTechnicalRole } from "@/lib/auth";
import { MOCK_USER, getMockToken } from "@/lib/mock-data";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_WARNING_MS = 5 * 60 * 1000; // 5 minutes before expiry

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
  }, []);

  const setupTokenTimers = useCallback((token: AuthToken) => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    const remaining = getTokenRemainingMs(token);
    if (remaining <= 0) { logout(); return; }

    // Auto-logout timer
    logoutTimerRef.current = setTimeout(() => {
      toast.error("Sessão expirada. Faça login novamente.", { duration: 5000 });
      logout();
    }, remaining);

    // Warning timer
    if (remaining > TOKEN_WARNING_MS) {
      warningTimerRef.current = setTimeout(() => {
        toast.warning("Sua sessão expira em 5 minutos. Salve seu trabalho.", { duration: 10000 });
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
    // DEMO MODE: accept any login and use mock data
    // In production, replace with real API call
    await new Promise(r => setTimeout(r, 800));

    const mockUser = { ...MOCK_USER, email };
    if (!isTechnicalRole(mockUser.role)) {
      throw new Error("Acesso restrito a usuários técnicos (DEV / ADMIN_TECH).");
    }

    storeAuth(getMockToken(), mockUser);
    const token = getStoredToken()!;
    setupTokenTimers(token);
    setUser(mockUser);
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
