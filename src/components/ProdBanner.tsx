import { AlertTriangle } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";

export function ProdBanner() {
  const { isProd } = useEnvironment();
  if (!isProd) return null;

  return (
    <div className="bg-env-prod text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold shrink-0 z-50">
      <AlertTriangle className="h-4 w-4" />
      <span>⚠ PRODUCTION ENVIRONMENT — Proceed with caution. All actions affect live data.</span>
      <AlertTriangle className="h-4 w-4" />
    </div>
  );
}
