import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { environment } = useEnvironment();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Terminal className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl text-foreground">Aqui na Feira</CardTitle>
              <CardDescription className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Dev Hub</CardDescription>
            </div>
          </div>
          <EnvironmentBadge environment={environment} size="md" />
          <p className="text-xs text-muted-foreground">
            Acesso restrito a usuários técnicos (DEV / ADMIN_TECH).
            {/* localStorage notice */}
            <br />
            <span className="text-[10px] opacity-60">Ambiente interno — tokens armazenados localmente.</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" placeholder="dev@aquinafeira.com" value={email} onChange={e => setEmail(e.target.value)} required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="bg-secondary border-border" />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
