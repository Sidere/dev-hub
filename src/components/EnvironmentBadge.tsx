import { getEnvColorClass, type Environment } from "@/lib/environment";
import { cn } from "@/lib/utils";

interface EnvironmentBadgeProps {
  environment: Environment;
  size?: "sm" | "md";
  className?: string;
}

export function EnvironmentBadge({ environment, size = "sm", className }: EnvironmentBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full font-mono font-bold uppercase tracking-wider",
      getEnvColorClass(environment),
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      environment === "PROD" && "animate-pulse-slow",
      className,
    )}>
      {environment}
    </span>
  );
}
