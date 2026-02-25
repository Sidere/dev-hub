export type Environment = "DEV" | "STAGING" | "PROD";

export interface EnvironmentConfig {
  name: Environment;
  label: string;
  apiBaseUrl: string;
  color: string;
}

export const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  DEV: {
    name: "DEV",
    label: "Development",
    apiBaseUrl: import.meta.env.VITE_API_URL_DEV || "https://api-dev.aquinafeira.com",
    color: "env-dev",
  },
  STAGING: {
    name: "STAGING",
    label: "Staging",
    apiBaseUrl: import.meta.env.VITE_API_URL_STAGING || "https://api-staging.aquinafeira.com",
    color: "env-staging",
  },
  PROD: {
    name: "PROD",
    label: "Production",
    apiBaseUrl: import.meta.env.VITE_API_URL_PROD || "https://api.aquinafeira.com",
    color: "env-prod",
  },
};

export function getEnvColorClass(env: Environment): string {
  switch (env) {
    case "DEV": return "bg-env-dev text-white";
    case "STAGING": return "bg-env-staging text-white";
    case "PROD": return "bg-env-prod text-white";
  }
}

export function getEnvBorderClass(env: Environment): string {
  switch (env) {
    case "DEV": return "border-env-dev";
    case "STAGING": return "border-env-staging";
    case "PROD": return "border-env-prod";
  }
}
