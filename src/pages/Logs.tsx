import { useState, useMemo, useCallback } from "react";
import { generateMockLogs, type LogEntry } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollText, Search, Copy, Download, X, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const levelColor: Record<string, string> = {
  info: "bg-accent/15 text-accent",
  warn: "bg-warning/15 text-warning",
  error: "bg-destructive/15 text-destructive",
};

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Logs() {
  const [allLogs] = useState(() => generateMockLogs(80));
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [traceFilter, setTraceFilter] = useState("");
  const [selected, setSelected] = useState<LogEntry | null>(null);

  const services = useMemo(() => [...new Set(allLogs.map(l => l.service))].sort(), [allLogs]);

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (serviceFilter !== "all" && log.service !== serviceFilter) return false;
      if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
      if (traceFilter && !log.requestId.includes(traceFilter) && !log.correlationId.includes(traceFilter)) return false;
      return true;
    });
  }, [allLogs, search, levelFilter, serviceFilter, traceFilter]);

  const copyAsJson = useCallback((log: LogEntry) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    toast.success("Log copiado como JSON");
  }, []);

  const exportLogs = useCallback((format: "json" | "csv") => {
    if (format === "json") {
      downloadFile(JSON.stringify(filtered, null, 2), "logs.json", "application/json");
    } else {
      const headers = "id,timestamp,level,service,message,requestId,correlationId\n";
      const rows = filtered.map(l => `"${l.id}","${l.timestamp}","${l.level}","${l.service}","${l.message.replace(/"/g, '""')}","${l.requestId}","${l.correlationId}"`).join("\n");
      downloadFile(headers + rows, "logs.csv", "text/csv");
    }
    toast.success(`Logs exportados como ${format.toUpperCase()}`);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-primary" /> Logs Viewer
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportLogs("json")}>
            <Download className="h-3 w-3 mr-1" /> JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportLogs("csv")}>
            <Download className="h-3 w-3 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[120px] bg-secondary border-border"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[140px] bg-secondary border-border"><SelectValue placeholder="Service" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative min-w-[180px]">
              <Input placeholder="requestId / correlationId" value={traceFilter} onChange={e => setTraceFilter(e.target.value)} className="bg-secondary border-border pr-8 font-mono text-xs" />
              {traceFilter && <button onClick={() => setTraceFilter("")} className="absolute right-2 top-2.5"><X className="h-4 w-4 text-muted-foreground" /></button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">{filtered.length} log entries</p>

      {/* Log table */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="text-left p-3 w-[180px]">Timestamp</th>
                <th className="text-left p-3 w-[70px]">Level</th>
                <th className="text-left p-3 w-[100px]">Service</th>
                <th className="text-left p-3">Message</th>
                <th className="p-3 w-[80px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} onClick={() => setSelected(log)} className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors">
                  <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${levelColor[log.level]}`}>
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground font-mono">{log.service}</Badge>
                  </td>
                  <td className="p-3 text-foreground truncate max-w-[400px]">{log.message}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); copyAsJson(log); }} className="p-1 rounded hover:bg-secondary" title="Copy as JSON">
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="bg-card border-border w-[450px] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-foreground text-sm">Log Detail</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${levelColor[selected.level]}`}>{selected.level.toUpperCase()}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">{selected.service}</Badge>
                </div>
                <p className="text-sm text-foreground">{selected.message}</p>

                <div className="space-y-2">
                  <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider">Metadata</h4>
                  <div className="bg-secondary rounded-lg p-3 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Timestamp</span><span className="text-foreground">{new Date(selected.timestamp).toISOString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Request ID</span><span className="text-primary cursor-pointer" onClick={() => { setTraceFilter(selected.requestId); setSelected(null); }}>{selected.requestId}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Correlation ID</span><span className="text-primary cursor-pointer" onClick={() => { setTraceFilter(selected.correlationId); setSelected(null); }}>{selected.correlationId}</span></div>
                    {selected.userId && <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="text-foreground">{selected.userId}</span></div>}
                    {selected.endpoint && <div className="flex justify-between"><span className="text-muted-foreground">Endpoint</span><span className="text-foreground">{selected.endpoint}</span></div>}
                    {selected.metadata && Object.entries(selected.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="text-foreground">{String(v)}</span></div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => copyAsJson(selected)} className="w-full">
                  <Copy className="h-3 w-3 mr-2" /> Copy as JSON
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
