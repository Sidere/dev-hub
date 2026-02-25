import React, { createContext, useContext, useState, useCallback } from "react";
import { Environment, ENVIRONMENTS, EnvironmentConfig } from "@/lib/environment";
import { useAuth } from "./AuthContext";

interface EnvironmentContextType {
  current: EnvironmentConfig;
  environment: Environment;
  switchEnvironment: (env: Environment) => void;
  isProd: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | null>(null);

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [environment, setEnvironment] = useState<Environment>("DEV");
  const { logout } = useAuth();

  const switchEnvironment = useCallback((env: Environment) => {
    if (env === environment) return;
    // Force re-authentication on environment switch
    logout();
    setEnvironment(env);
  }, [environment, logout]);

  return (
    <EnvironmentContext.Provider value={{
      current: ENVIRONMENTS[environment],
      environment,
      switchEnvironment,
      isProd: environment === "PROD",
    }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) throw new Error("useEnvironment must be used within EnvironmentProvider");
  return ctx;
}
