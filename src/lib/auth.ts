/**
 * Auth utilities for JWT token management.
 * 
 * SECURITY NOTE: This Dev Hub uses localStorage for JWT storage as a fallback.
 * This application is restricted to internal technical users only (DEV / ADMIN_TECH roles).
 * When the backend supports HTTP-only cookies, migrate to that approach.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "DEV" | "ADMIN_TECH" | "ADMIN" | "USER";
}

export interface AuthToken {
  token: string;
  expiresAt: number; // unix timestamp in ms
}

const TOKEN_KEY = "devhub_token";
const USER_KEY = "devhub_user";

export function storeAuth(token: string, user: User): void {
  const payload = parseJwtPayload(token);
  const authToken: AuthToken = {
    token,
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
}

export function isTokenExpired(token: AuthToken): boolean {
  return Date.now() >= token.expiresAt;
}

export function getTokenRemainingMs(token: AuthToken): number {
  return Math.max(0, token.expiresAt - Date.now());
}

export function isTechnicalRole(role: string): boolean {
  return role === "DEV" || role === "ADMIN_TECH";
}

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}
