import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="bg-card border-border max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <Construction className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          <span className="inline-block text-[10px] font-mono text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full">
            Phase 2
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
