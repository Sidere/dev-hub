import type { User } from "./auth";

// Mock user for demo mode
export const MOCK_USER: User = {
  id: "usr_mock_001",
  name: "Dev Admin",
  email: "dev@aquinafeira.com",
  role: "DEV",
};

// Generate a mock token dynamically so exp is always valid
export function getMockToken(): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: "usr_mock_001", name: "Dev Admin", role: "DEV", exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `${header}.${payload}.mock_signature`;
}

export interface ApiHealthEndpoint {
  name: string;
  url: string;
  status: "healthy" | "degraded" | "down";
  responseTime: number;
  lastChecked: string;
}

export interface SystemStat {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "stable";
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "error";
  message: string;
  service: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  service: string;
  message: string;
  requestId: string;
  correlationId: string;
  userId?: string;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

export function generateMockHealthData(): ApiHealthEndpoint[] {
  return [
    { name: "Auth Service", url: "/api/auth", status: "healthy", responseTime: 42, lastChecked: new Date().toISOString() },
    { name: "Products API", url: "/api/products", status: "healthy", responseTime: 128, lastChecked: new Date().toISOString() },
    { name: "Orders API", url: "/api/orders", status: "degraded", responseTime: 890, lastChecked: new Date().toISOString() },
    { name: "Notifications", url: "/api/notifications", status: "healthy", responseTime: 65, lastChecked: new Date().toISOString() },
    { name: "Search Service", url: "/api/search", status: "down", responseTime: 0, lastChecked: new Date().toISOString() },
    { name: "Payment Gateway", url: "/api/payments", status: "healthy", responseTime: 210, lastChecked: new Date().toISOString() },
  ];
}

export function generateMockSystemStats(): SystemStat[] {
  return [
    { label: "Active Users", value: "1,247", change: "+12%", trend: "up" },
    { label: "API Calls Today", value: "84,392", change: "+5%", trend: "up" },
    { label: "Error Rate", value: "0.34%", change: "-0.1%", trend: "down" },
    { label: "Uptime", value: "99.97%", change: "stable", trend: "stable" },
    { label: "Avg Response", value: "223ms", change: "-15ms", trend: "down" },
  ];
}

export function generateMockActivity(): ActivityEvent[] {
  const now = Date.now();
  return [
    { id: "evt_1", timestamp: new Date(now - 120000).toISOString(), type: "info", message: "Deployment v2.4.1 completed successfully", service: "CI/CD" },
    { id: "evt_2", timestamp: new Date(now - 300000).toISOString(), type: "warning", message: "Orders API response time exceeded 500ms threshold", service: "Orders" },
    { id: "evt_3", timestamp: new Date(now - 600000).toISOString(), type: "error", message: "Search Service connection timeout — automatic restart triggered", service: "Search" },
    { id: "evt_4", timestamp: new Date(now - 900000).toISOString(), type: "info", message: "Database backup completed (2.3 GB)", service: "Database" },
    { id: "evt_5", timestamp: new Date(now - 1200000).toISOString(), type: "info", message: "SSL certificate renewed for api.aquinafeira.com", service: "Infrastructure" },
    { id: "evt_6", timestamp: new Date(now - 1500000).toISOString(), type: "warning", message: "Rate limit threshold at 80% for /api/products", service: "Gateway" },
    { id: "evt_7", timestamp: new Date(now - 1800000).toISOString(), type: "info", message: "Cache invalidation completed for product catalog", service: "Cache" },
    { id: "evt_8", timestamp: new Date(now - 2100000).toISOString(), type: "info", message: "User dev@aquinafeira.com logged into Dev Hub", service: "Auth" },
    { id: "evt_9", timestamp: new Date(now - 2400000).toISOString(), type: "error", message: "Payment webhook delivery failed — retry scheduled", service: "Payments" },
    { id: "evt_10", timestamp: new Date(now - 2700000).toISOString(), type: "info", message: "New fair vendor registered: Feira Central SP", service: "Vendors" },
  ];
}

export function generateMockLogs(count = 50): LogEntry[] {
  const services = ["auth", "products", "orders", "notifications", "search", "payments", "gateway"];
  const levels: LogEntry["level"][] = ["info", "warn", "error"];
  const messages: Record<string, string[]> = {
    info: [
      "Request processed successfully",
      "Cache hit for product listing",
      "User session created",
      "Database query completed in 12ms",
      "Webhook delivered successfully",
    ],
    warn: [
      "Response time exceeded threshold (>500ms)",
      "Rate limit approaching for client IP",
      "Deprecated API version used",
      "Retry attempt 2/3 for external service",
      "Memory usage at 85%",
    ],
    error: [
      "Connection timeout to database",
      "Authentication token validation failed",
      "Internal server error in order processing",
      "External service returned 503",
      "Failed to parse request body",
    ],
  };

  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const level = levels[Math.floor(Math.random() * (i < 5 ? 3 : i < 20 ? 2.5 : 2))];
    const service = services[Math.floor(Math.random() * services.length)];
    const msgList = messages[level === "warn" ? "warn" : level];
    return {
      id: `log_${String(i + 1).padStart(4, "0")}`,
      timestamp: new Date(now - i * 45000 - Math.random() * 30000).toISOString(),
      level,
      service,
      message: msgList[Math.floor(Math.random() * msgList.length)],
      requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
      correlationId: `cor_${Math.random().toString(36).slice(2, 8)}`,
      userId: Math.random() > 0.3 ? `usr_${Math.random().toString(36).slice(2, 8)}` : undefined,
      endpoint: `/${service}/v1/${["list", "create", "update", "delete", "health"][Math.floor(Math.random() * 5)]}`,
      metadata: {
        duration: Math.floor(Math.random() * 1000),
        statusCode: level === "error" ? 500 : level === "warn" ? 429 : 200,
      },
    };
  });
}
