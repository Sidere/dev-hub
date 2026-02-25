import { useState, useEffect, useCallback } from "react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENVIRONMENTS, type Environment } from "@/lib/environment";
import { generateMockHealthData, generateMockSystemStats, generateMockActivity, type ApiHealthEndpoint, type SystemStat, type ActivityEvent } from "@/lib/mock-data";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus, Activity, Clock } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusIcon = (s: ApiHealthEndpoint["status"]) => {
  switch (s) {
    case "healthy": return <CheckCircle2 className="h-5 w-5 text-accent" />;
    case "degraded": return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "down": return <XCircle className="h-5 w-5 text-destructive" />;
  }
};

const statusLabel = (s: ApiHealthEndpoint["status"]) => {
  const map = { healthy: "Healthy", degraded: "Degraded", down: "Down" };
  const colorMap = { healthy: "bg-accent/15 text-accent", degraded: "bg-warning/15 text-warning", down: "bg-destructive/15 text-destructive" };
  return <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${colorMap[s]}`}>{map[s]}</span>;
};

const trendIcon = (t?: SystemStat["trend"]) => {
  switch (t) {
    case "up": return <TrendingUp className="h-3 w-3 text-accent" />;
    case "down": return <TrendingDown className="h-3 w-3 text-accent" />;
    default: return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
};

export default function Dashboard() {
  const { environment, switchEnvironment, isProd } = useEnvironment();
  const [health, setHealth] = useState<ApiHealthEndpoint[]>([]);
  const [stats, setStats] = useState<SystemStat[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [loading, setLoading] = useState(false);
  const [envDialogTarget, setEnvDialogTarget] = useState<Environment | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setHealth(generateMockHealthData());
      setStats(generateMockSystemStats());
      setActivity(generateMockActivity());
      setLastUpdated(new Date());
      setLoading(false);
    }, 400);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, refresh]);

  const handleEnvChange = (val: string) => {
    const target = val as Environment;
    if (target === environment) return;
    setEnvDialogTarget(target);
  };

  const confirmEnvSwitch = () => {
    if (envDialogTarget) switchEnvironment(envDialogTarget);
    setEnvDialogTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Technical Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
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

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold font-mono text-foreground mt-1">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {trendIcon(stat.trend)}
                <span className="text-[10px] text-muted-foreground">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Health */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            API Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {health.map((ep) => (
              <div key={ep.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                {statusIcon(ep.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{ep.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{ep.url}</p>
                </div>
                <div className="text-right">
                  {statusLabel(ep.status)}
                  {ep.status !== "down" && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-1">{ep.responseTime}ms</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activity.map((evt) => (
              <div key={evt.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors">
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  evt.type === "error" ? "bg-destructive" : evt.type === "warning" ? "bg-warning" : "bg-accent"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{evt.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-border text-muted-foreground">{evt.service}</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Environment switch confirmation */}
      <AlertDialog open={!!envDialogTarget} onOpenChange={(o) => !o && setEnvDialogTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Trocar Ambiente?</AlertDialogTitle>
            <AlertDialogDescription>
              Trocar para <strong className={envDialogTarget === "PROD" ? "text-destructive" : "text-foreground"}>{envDialogTarget}</strong> irá encerrar sua sessão atual. Você precisará fazer login novamente.
              {envDialogTarget === "PROD" && (
                <span className="block mt-2 text-destructive font-semibold">
                  ⚠ Você está prestes a acessar o ambiente de PRODUÇÃO. Todas as ações afetarão dados reais.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEnvSwitch} className={envDialogTarget === "PROD" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
