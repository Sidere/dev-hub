export interface User {
  id: string;
  name: string;
  email: string;
  role: "DEV" | "USER";
}

export interface AuthToken {
  accessToken: string;
  expiresAt: number;
}

const TOKEN_KEY = "devhub_token";
const USER_KEY = "devhub_user";

export function storeAuth(token: string, user: User): void {
  const payload = parseJwtPayload(token);
  const authToken: AuthToken = {
    accessToken: token,
    expiresAt: payload?.exp ? payload.exp * 1000 : Date.now() + 3600000,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(authToken));
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredToken(): AuthToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isTokenExpired(token: AuthToken): boolean {
  return Date.now() >= token.expiresAt;
}

export function getTokenRemainingMs(token: AuthToken): number {
  return Math.max(0, token.expiresAt - Date.now());
}

export function isTechnicalRole(role: string): boolean {
  return role === "DEV"
}

interface JwtPayload {
  exp?: number;
  [key: string]: string | number | undefined;
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }

}

const REFRESH_TOKEN_KEY = 'devhub_refresh_token';

export function storeRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}