import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollText, Search, Copy, Download, X, ChevronRight, RefreshCw, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
  id: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string;
  correlationId?: string;
  userId?: string;
  endpoint?: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

interface LogsResponse {
  data: LogEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const corNivel: Record<LogLevel, string> = {
  INFO: "bg-accent/15 text-accent",
  WARN: "bg-warning/15 text-warning",
  ERROR: "bg-destructive/15 text-destructive",
  DEBUG: "bg-muted text-muted-foreground",
};

const labelNivel: Record<LogLevel, string> = {
  INFO: "Info",
  WARN: "Aviso",
  ERROR: "Erro",
  DEBUG: "Debug",
};

function baixarArquivo(conteudo: string, nome: string, mime: string) {
  const blob = new Blob([conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [selecionado, setSelecionado] = useState<LogEntry | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("all");
  const [filtroServico, setFiltroServico] = useState("");
  const [filtroTrace, setFiltroTrace] = useState("");
  const [pagina, setPagina] = useState(1);

  const buscarLogs = useCallback(async (pg = 1) => {
    setCarregando(true);
    setErro(null);

    const params = new URLSearchParams();
    params.set("page", String(pg));
    params.set("limit", "50");
    if (filtroNivel !== "all") params.set("level", filtroNivel);
    if (filtroServico) params.set("service", filtroServico);
    if (busca) params.set("search", busca);
    if (filtroTrace) {
      params.set("requestId", filtroTrace);
    }

    try {
      const res = await apiClient.get<LogsResponse>(`/logs?${params.toString()}`, true);
      setLogs(res.data);
      setMeta(res.meta);
      setPagina(pg);
    } catch {
      setErro("Erro ao carregar logs.");
    } finally {
      setCarregando(false);
    }
  }, [filtroNivel, filtroServico, busca, filtroTrace]);

  useEffect(() => {
    buscarLogs(1);
  }, [buscarLogs]);

  const copiarComoJson = useCallback((log: LogEntry) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    toast.success("Log copiado como JSON");
  }, []);

  const exportarLogs = useCallback(async (formato: "json" | "csv") => {
    try {
      const res = await apiClient.get<LogsResponse>(`/logs?limit=200`, true);
      const dados = res.data;

      if (formato === "json") {
        baixarArquivo(JSON.stringify(dados, null, 2), "logs.json", "application/json");
      } else {
        const cabecalho = "id,createdAt,level,service,message,requestId,correlationId\n";
        const linhas = dados
          .map(
            (l) =>
              `"${l.id}","${l.createdAt}","${l.level}","${l.service}","${l.message.replace(/"/g, '""')}","${l.requestId ?? ""}","${l.correlationId ?? ""}"`
          )
          .join("\n");
        baixarArquivo(cabecalho + linhas, "logs.csv", "text/csv");
      }

      toast.success(`Logs exportados como ${formato.toUpperCase()}`);
    } catch {
      toast.error("Erro ao exportar logs.");
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-primary" />
          Visualizador de Logs
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => buscarLogs(pagina)} disabled={carregando}>
            <RefreshCw className={`h-3 w-3 mr-1 ${carregando ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportarLogs("json")}>
            <Download className="h-3 w-3 mr-1" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportarLogs("csv")}>
            <Download className="h-3 w-3 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mensagens..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>
            <Select value={filtroNivel} onValueChange={setFiltroNivel}>
              <SelectTrigger className="w-[130px] bg-secondary border-border">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="WARN">Aviso</SelectItem>
                <SelectItem value="ERROR">Erro</SelectItem>
                <SelectItem value="DEBUG">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Serviço..."
              value={filtroServico}
              onChange={(e) => setFiltroServico(e.target.value)}
              className="w-[130px] bg-secondary border-border"
            />
            <div className="relative min-w-[200px]">
              <Input
                placeholder="requestId / correlationId"
                value={filtroTrace}
                onChange={(e) => setFiltroTrace(e.target.value)}
                className="bg-secondary border-border pr-8 font-mono text-xs"
              />
              {filtroTrace && (
                <button onClick={() => setFiltroTrace("")} className="absolute right-2 top-2.5">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contagem e erro */}
      {erro ? (
        <p className="text-sm text-destructive">{erro}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {meta.total} registro(s) — página {meta.page} de {meta.totalPages}
        </p>
      )}

      {/* Tabela de logs */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="text-left p-3 w-[180px]">Data/Hora</th>
                <th className="text-left p-3 w-[80px]">Nível</th>
                <th className="text-left p-3 w-[110px]">Serviço</th>
                <th className="text-left p-3">Mensagem</th>
                <th className="p-3 w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                    Carregando logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelecionado(log)}
                    className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${corNivel[log.level]}`}>
                        {labelNivel[log.level]}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground font-mono">
                        {log.service}
                      </Badge>
                    </td>
                    <td className="p-3 text-foreground truncate max-w-[400px]">{log.message}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); copiarComoJson(log); }}
                          className="p-1 rounded hover:bg-secondary"
                          title="Copiar como JSON"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Paginação */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => buscarLogs(pagina - 1)}
            disabled={pagina <= 1 || carregando}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {pagina} / {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => buscarLogs(pagina + 1)}
            disabled={pagina >= meta.totalPages || carregando}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Painel de detalhes */}
      <Sheet open={!!selecionado} onOpenChange={(o) => !o && setSelecionado(null)}>
        <SheetContent className="bg-card border-border w-[450px] overflow-y-auto">
          {selecionado && (
            <>
              <SheetHeader>
                <SheetTitle className="text-foreground text-sm">Detalhe do Log</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${corNivel[selecionado.level]}`}>
                    {labelNivel[selecionado.level]}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
                    {selecionado.service}
                  </Badge>
                  {selecionado.statusCode && (
                    <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
                      HTTP {selecionado.statusCode}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-foreground">{selecionado.message}</p>

                <div className="space-y-2">
                  <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider">Metadados</h4>
                  <div className="bg-secondary rounded-lg p-3 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground shrink-0">Data/Hora</span>
                      <span className="text-foreground text-right">{new Date(selecionado.createdAt).toLocaleString("pt-BR")}</span>
                    </div>
                    {selecionado.requestId && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Request ID</span>
                        <span
                          className="text-primary cursor-pointer text-right truncate"
                          onClick={() => { setFiltroTrace(selecionado.requestId!); setSelecionado(null); }}
                          title="Filtrar por este Request ID"
                        >
                          {selecionado.requestId}
                        </span>
                      </div>
                    )}
                    {selecionado.correlationId && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Correlation ID</span>
                        <span
                          className="text-primary cursor-pointer text-right truncate"
                          onClick={() => { setFiltroTrace(selecionado.correlationId!); setSelecionado(null); }}
                          title="Filtrar por este Correlation ID"
                        >
                          {selecionado.correlationId}
                        </span>
                      </div>
                    )}
                    {selecionado.endpoint && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Endpoint</span>
                        <span className="text-foreground text-right">{selecionado.endpoint}</span>
                      </div>
                    )}
                    {selecionado.user && (
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground shrink-0">Usuário</span>
                        <span className="text-foreground text-right">{selecionado.user.name}</span>
                      </div>
                    )}
                    {selecionado.metadata &&
                      Object.entries(selecionado.metadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <span className="text-muted-foreground shrink-0">{k}</span>
                          <span className="text-foreground text-right">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => copiarComoJson(selecionado)} className="w-full">
                  <Copy className="h-3 w-3 mr-2" />
                  Copiar como JSON
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}