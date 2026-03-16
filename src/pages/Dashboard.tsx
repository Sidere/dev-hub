import { useState, useEffect, useCallback } from "react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useAuth } from "@/contexts/AuthContext";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENVIRONMENTS, type Environment } from "@/lib/environment";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus, Activity, Clock } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/lib/api-client";
import { getStoredToken } from "@/lib/auth";

// ─── Tipos da API ───────────────────────────────────────────────────────────

type HealthStatus = "HEALTHY" | "DEGRADED" | "DOWN";

interface HealthCheckResult {
  id: string;
  serviceName: string;
  status: HealthStatus;
  responseTimeMs: number;
  details?: string;
  checkedAt: string;
}

interface LogEntry {
  id: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  service: string;
  message: string;
  createdAt: string;
}

interface LogsResponse {
  data: LogEntry[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── Helpers de UI ──────────────────────────────────────────────────────────

const statusNormalizado = (s: HealthStatus): "healthy" | "degraded" | "down" => {
  const map: Record<HealthStatus, "healthy" | "degraded" | "down"> = {
    HEALTHY: "healthy",
    DEGRADED: "degraded",
    DOWN: "down",
  };
  return map[s];
};

const statusIcone = (s: HealthStatus) => {
  switch (s) {
    case "HEALTHY": return <CheckCircle2 className="h-5 w-5 text-accent" />;
    case "DEGRADED": return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "DOWN": return <XCircle className="h-5 w-5 text-destructive" />;
  }
};

const statusLabel = (s: HealthStatus) => {
  const labels: Record<HealthStatus, string> = {
    HEALTHY: "Saudável",
    DEGRADED: "Degradado",
    DOWN: "Fora",
  };
  const cores: Record<HealthStatus, string> = {
    HEALTHY: "bg-accent/15 text-accent",
    DEGRADED: "bg-warning/15 text-warning",
    DOWN: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${cores[s]}`}>
      {labels[s]}
    </span>
  );
};

const nivelLogCor: Record<string, string> = {
  INFO: "bg-accent/15 text-accent",
  WARN: "bg-warning/15 text-warning",
  ERROR: "bg-destructive/15 text-destructive",
  DEBUG: "bg-muted text-muted-foreground",
};

// ─── Componente ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { environment, switchEnvironment } = useEnvironment();
  const { logout } = useAuth();

  const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [envDialogTarget, setEnvDialogTarget] = useState<Environment | null>(null);

  const buscarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    const token = getStoredToken();
    if (!token) { logout(); return; }

    try {
      const [logsRes, usuariosRes, healthRes] = await Promise.allSettled([
        apiClient.get<LogsResponse>("/logs?limit=10", true),
        apiClient.get<{ length: number }>("/users", true),
        apiClient.get<HealthCheckResult[]>("/health/history", true),
      ]);

      if (logsRes.status === "fulfilled") {
        setRecentLogs(logsRes.value.data);
        setTotalLogs(logsRes.value.meta.total);
      }

      if (usuariosRes.status === "fulfilled") {
        setTotalUsuarios(
          Array.isArray(usuariosRes.value)
            ? (usuariosRes.value as unknown[]).length
            : 0
        );
      }

      if (healthRes.status === "fulfilled" && Array.isArray(healthRes.value)) {
        setHealthChecks(healthRes.value);
      }

      setUltimaAtualizacao(new Date());
    } catch (e) {
      setErro("Erro ao carregar dados do dashboard.");
    } finally {
      setCarregando(false);
    }
  }, [logout]);

  useEffect(() => { buscarDados(); }, [buscarDados]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(buscarDados, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, buscarDados]);

  const handleEnvChange = (val: string) => {
    const target = val as Environment;
    if (target === environment) return;
    setEnvDialogTarget(target);
  };

  const confirmarTrocaEnv = () => {
    if (envDialogTarget) switchEnvironment(envDialogTarget);
    setEnvDialogTarget(null);
  };

  const errosHoje = recentLogs.filter((l) => l.level === "ERROR").length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Técnico</h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              Última atualização: {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Button variant="outline" size="sm" onClick={buscarDados} disabled={carregando}>
            <RefreshCw className={`h-4 w-4 mr-1 ${carregando ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Select value={environment} onValueChange={handleEnvChange}>
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ENVIRONMENTS).map((env) => (
                <SelectItem key={env.name} value={env.name}>
                  <span className="flex items-center gap-2">
                    <EnvironmentBadge environment={env.name} />
                    {env.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {erro && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Usuários Ativos</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{totalUsuarios}</p>
            <p className="text-[10px] text-muted-foreground mt-1">cadastrados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total de Logs</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{totalLogs}</p>
            <p className="text-[10px] text-muted-foreground mt-1">registrados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Erros Recentes</p>
            <p className={`text-xl font-bold font-mono mt-1 ${errosHoje > 0 ? "text-destructive" : "text-accent"}`}>
              {errosHoje}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">nos últimos logs</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Serviços</p>
            <p className="text-xl font-bold font-mono text-foreground mt-1">{healthChecks.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1">monitorados</p>
          </CardContent>
        </Card>
      </div>

      {/* Monitor de saúde da API */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Monitor de Saúde da API
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthChecks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum dado de health check disponível ainda.
              <br />
              <span className="text-xs opacity-60">Os dados aparecem após o Passo 5 (Health Check) ser implementado.</span>
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {healthChecks.map((hc) => (
                <div
                  key={hc.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                >
                  {statusIcone(hc.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{hc.serviceName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {new Date(hc.checkedAt).toLocaleTimeString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    {statusLabel(hc.status)}
                    {hc.status !== "DOWN" && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">
                        {hc.responseTimeMs}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed de atividade recente */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum log registrado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${log.level === "ERROR"
                        ? "bg-destructive"
                        : log.level === "WARN"
                          ? "bg-warning"
                          : "bg-accent"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{log.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge
                        variant="outline"
                        className="text-[9px] px-1 py-0 border-border text-muted-foreground"
                      >
                        {log.service}
                      </Badge>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${nivelLogCor[log.level]}`}
                      >
                        {log.level}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.createdAt).toLocaleTimeString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de troca de ambiente */}
      <AlertDialog open={!!envDialogTarget} onOpenChange={(o) => !o && setEnvDialogTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Trocar Ambiente?</AlertDialogTitle>
            <AlertDialogDescription>
              Trocar para{" "}
              <strong className={envDialogTarget === "PROD" ? "text-destructive" : "text-foreground"}>
                {envDialogTarget}
              </strong>{" "}
              irá encerrar sua sessão atual. Você precisará fazer login novamente.
              {envDialogTarget === "PROD" && (
                <span className="block mt-2 text-destructive font-semibold">
                  ⚠ Você está prestes a acessar o ambiente de PRODUÇÃO. Todas as ações afetarão dados reais.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarTrocaEnv}
              className={
                envDialogTarget === "PROD"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}